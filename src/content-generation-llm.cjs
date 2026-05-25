"use strict";

// Diamond dynamic content generation — two-stage pipeline.
//
//   Stage 1 (write):   Anthropic (Claude) drafts platform-specific copy.
//   Stage 2 (review):  OpenAI reviews and adjusts each draft.
//   Stage 3 (enforce): deterministic claim/banned-phrase enforcement runs in the
//                       renderer via evaluatePlatformDraft — NOT here.
//
// Keys and models come from the environment (loaded from .env.local by main.cjs):
//   ANTHROPIC_API_KEY, OPENAI_API_KEY, DIAMOND_WRITER_MODEL, DIAMOND_REVIEWER_MODEL
//
// CommonJS by design: package.json sets "type":"module" but Electron main is
// CommonJS, and this module is required() from src/electron/main.cjs.
//
// The pipeline NEVER throws to the caller for an API/degradation condition; it
// resolves a structured result so the renderer can degrade gracefully:
//   { ok: true,  drafts: [{ platform, text, changeNote }], degraded: null | "no-writer-key" | "no-reviewer-key" }
//   { ok: true,  drafts: null, degraded: "no-writer-key" }   // renderer applies its template fallback
//   { ok: false, drafts: null, error: "<writer failure>" }

const DEFAULT_WRITER_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_REVIEWER_MODEL = "gpt-4o";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const STAGE_TIMEOUT_MS = 60000;
const WRITER_MAX_TOKENS = 1024;

async function generatePostDrafts(payload = {}, deps = {}) {
  const env = deps.env || process.env;
  const writerKey = env.ANTHROPIC_API_KEY;
  const reviewerKey = env.OPENAI_API_KEY;
  const writerModel = env.DIAMOND_WRITER_MODEL || DEFAULT_WRITER_MODEL;
  const reviewerModel = env.DIAMOND_REVIEWER_MODEL || DEFAULT_REVIEWER_MODEL;
  const platforms = Array.isArray(payload.platforms) ? payload.platforms : [];

  // No writer key (and no injected writer) → renderer falls back to its template generator.
  if (!writerKey && !deps.writer) {
    return { ok: true, drafts: null, degraded: "no-writer-key" };
  }

  const write = deps.writer
    || ((args) => callAnthropic(args, { key: writerKey, model: writerModel, fetchImpl: deps.fetchImpl }));
  const review = deps.reviewer
    || ((args) => callOpenAi(args, { key: reviewerKey, model: reviewerModel, fetchImpl: deps.fetchImpl }));
  const reviewerAvailable = Boolean(reviewerKey || deps.reviewer);

  const drafts = [];
  let degraded = null;

  for (const target of platforms) {
    const platform = target.platform;
    const charLimit = target.charLimit || null;

    let text;
    try {
      text = await write({ payload, platform, charLimit });
    } catch (error) {
      // A writer failure with a key present is a hard error — let the renderer flag + retry.
      return { ok: false, drafts: null, error: `Writer failed for ${platform}: ${normalizeError(error)}` };
    }

    let changeNote;
    if (!reviewerAvailable) {
      degraded = degraded || "no-reviewer-key";
      changeNote = "reviewer unavailable";
    } else {
      try {
        const reviewed = await review({ payload, platform, charLimit, draft: text });
        text = reviewed.text || text;
        changeNote = reviewed.changeNote || "reviewed";
      } catch (_error) {
        // Reviewer error (timeout, unknown/unauthorized model id) soft-degrades to unreviewed writer text.
        degraded = degraded || "no-reviewer-key";
        changeNote = "reviewer unavailable";
      }
    }

    drafts.push({ platform, text: String(text || "").trim(), changeNote });
  }

  return { ok: true, drafts, degraded };
}

function buildWriterPrompt({ payload = {}, platform, charLimit }) {
  const brand = payload.brand || {};
  const campaign = payload.campaign || {};
  const claims = payload.claims || {};
  const isCampaignMode = payload.mode === "campaign" && !payload.idea;
  const lines = [
    `You are a social media copywriter. Write ONE ${platformLabel(platform)} post.`,
    isCampaignMode
      ? "Generate a post based entirely on the campaign information below. No specific idea is provided — derive compelling content from the campaign goals, audience, offer, and CTA."
      : `Core idea: ${payload.idea || ""}`,
  ];
  if (payload.style && payload.style !== "Default") lines.push(`Style: ${payload.style}.`);
  if (payload.language && payload.language !== "en") lines.push(`Write the post in language code "${payload.language}".`);
  if (brand.voice) lines.push(`Brand voice: ${brand.voice}`);
  if (hasItems(brand.approvedPhrases)) lines.push(`Prefer these approved phrases where natural: ${joinList(brand.approvedPhrases)}.`);
  if (hasItems(brand.bannedPhrases)) lines.push(`Never use these banned phrases: ${joinList(brand.bannedPhrases)}.`);
  if (hasItems(campaign.goals)) lines.push(`Campaign goals: ${joinList(campaign.goals)}.`);
  if (hasItems(campaign.pillars)) lines.push(`Content pillars: ${joinList(campaign.pillars)}.`);
  if (campaign.audience) lines.push(`Audience: ${joinList(campaign.audience)}.`);
  if (campaign.offer) lines.push(`Offer: ${campaign.offer}.`);
  if (campaign.cta) lines.push(`Call to action: ${campaign.cta}.`);
  if (campaign.guidanceSummary) lines.push(`Extra guidance:\n${campaign.guidanceSummary}`);
  if (hasItems(claims.blockedClaims)) lines.push(`Do NOT make these blocked claims: ${joinList(claims.blockedClaims)}.`);
  if (hasItems(claims.requiresReviewClaims)) lines.push(`Avoid unverified claims such as: ${joinList(claims.requiresReviewClaims)}.`);
  if (charLimit) lines.push(`Hard limit: stay under ${charLimit} characters.`);
  lines.push("Return only the post text, with no preamble, quotes, hashtags-list, or explanation.");
  return lines.filter(Boolean).join("\n");
}

function buildReviewerPrompt({ payload = {}, platform, charLimit, draft }) {
  const brand = payload.brand || {};
  const claims = payload.claims || {};
  const rules = [];
  if (brand.voice) rules.push(`Brand voice: ${brand.voice}`);
  if (hasItems(brand.bannedPhrases)) rules.push(`Banned phrases (remove): ${joinList(brand.bannedPhrases)}`);
  if (hasItems(claims.blockedClaims)) rules.push(`Blocked claims (remove): ${joinList(claims.blockedClaims)}`);
  if (charLimit) rules.push(`Character limit: ${charLimit}`);
  return [
    `You are an editor reviewing a ${platformLabel(platform)} post for brand voice, claim safety, and platform fit.`,
    rules.length ? `Rules:\n${rules.join("\n")}` : "",
    `Draft:\n${draft}`,
    'Revise the draft to satisfy the rules while preserving intent. Respond with strict JSON only: {"text": "<final post>", "changes": "<one short sentence on what you changed>"}.',
  ].filter(Boolean).join("\n\n");
}

function parseReviewerContent(content, fallbackDraft) {
  const raw = String(content || "").trim();
  try {
    const json = JSON.parse(stripCodeFence(raw));
    return {
      text: String(json.text || fallbackDraft).trim(),
      changeNote: json.changes ? String(json.changes).trim() : "reviewed",
    };
  } catch (_error) {
    // Reviewer did not return JSON; return the original draft unchanged so reviewer
    // failure messages never become published post text.
    return { text: fallbackDraft, changeNote: "reviewer parse error" };
  }
}

async function callAnthropic({ payload, platform, charLimit }, { key, model, fetchImpl }) {
  const doFetch = fetchImpl || fetch;
  const response = await doFetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: WRITER_MAX_TOKENS,
      messages: [{ role: "user", content: buildWriterPrompt({ payload, platform, charLimit }) }],
    }),
    signal: AbortSignal.timeout(STAGE_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Anthropic ${response.status} ${await safeText(response)}`);
  const data = await response.json();
  const text = Array.isArray(data.content)
    ? data.content.map((part) => part.text || "").join("").trim()
    : "";
  if (!text) throw new Error("Anthropic returned empty content");
  return text;
}

async function callOpenAi({ payload, platform, charLimit, draft }, { key, model, fetchImpl }) {
  const doFetch = fetchImpl || fetch;
  const response = await doFetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a precise social media copy editor. Always reply with strict JSON." },
        { role: "user", content: buildReviewerPrompt({ payload, platform, charLimit, draft }) },
      ],
    }),
    signal: AbortSignal.timeout(STAGE_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status} ${await safeText(response)}`);
  const data = await response.json();
  const content = data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content
    : "";
  return parseReviewerContent(content, draft);
}

const PLATFORM_LABELS = {
  x: "X (Twitter)",
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  "youtube-shorts": "YouTube Shorts",
  "youtube-longform": "YouTube",
  facebook: "Facebook",
  pinterest: "Pinterest",
};

function platformLabel(platform) {
  return PLATFORM_LABELS[platform] || String(platform || "social");
}

function hasItems(value) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

function joinList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return String(value || "");
}

function stripCodeFence(raw) {
  return String(raw || "").replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function normalizeError(error) {
  return error && error.message ? error.message : String(error);
}

// ─── LLM Draft Evaluation ────────────────────────────────────────────────────
//
// evaluateDraftWithLlm sends the draft text + brand/campaign context to OpenAI
// and returns a structured quality assessment:
//   { ok: true, evaluation: { score, status, summary, issues, suggestions } }
//   { ok: true, evaluation: null, degraded: "no-reviewer-key" }
//   { ok: false, evaluation: null, error: "..." }

const EVALUATOR_MAX_TOKENS = 512;

async function evaluateDraftWithLlm(payload = {}, deps = {}) {
  const env = deps.env || process.env;
  const reviewerKey = env.OPENAI_API_KEY;
  const reviewerModel = env.DIAMOND_REVIEWER_MODEL || DEFAULT_REVIEWER_MODEL;

  if (!reviewerKey && !deps.evaluator) {
    return { ok: true, evaluation: null, degraded: "no-reviewer-key" };
  }

  const doEvaluate = deps.evaluator
    || ((prompt) => callOpenAiWithPrompt(prompt, { key: reviewerKey, model: reviewerModel, fetchImpl: deps.fetchImpl }));

  const prompt = buildEvaluationPrompt(payload);
  try {
    const raw = await doEvaluate(prompt);
    return { ok: true, evaluation: parseEvaluationContent(raw) };
  } catch (error) {
    return { ok: false, evaluation: null, error: normalizeError(error) };
  }
}

function buildEvaluationPrompt({ platform, text, brand = {}, campaign = {}, claims = {}, charLimit = null }) {
  const name = platformLabel(platform);
  const rules = [];
  if (brand.voice) rules.push(`Brand voice: ${brand.voice}`);
  if (hasItems(brand.bannedPhrases)) rules.push(`Banned phrases (must not appear): ${joinList(brand.bannedPhrases)}`);
  if (hasItems(claims.blockedClaims)) rules.push(`Blocked claims: ${joinList(claims.blockedClaims)}`);
  if (hasItems(campaign.goals)) rules.push(`Campaign goals: ${joinList(campaign.goals)}`);
  if (campaign.offer) rules.push(`Offer: ${campaign.offer}`);
  if (campaign.cta) rules.push(`Expected CTA: ${campaign.cta}`);
  if (charLimit) rules.push(`Character limit: ${charLimit} (this draft is ${String(text || "").length} chars)`);
  return [
    `You are a social media content evaluator. Evaluate this ${name} post draft.`,
    rules.length ? `Rules to check against:\n${rules.join("\n")}` : "",
    `Draft:\n${text || "(empty)"}`,
    "Assess: clarity, platform fit, brand voice, campaign alignment, CTA presence, and any problems.",
    'Respond with strict JSON only — no preamble:\n{"score":<0-100>,"status":"<approved|needs_review|blocked>","summary":"<1-2 sentences>","issues":["<issue>"],"suggestions":["<suggestion>"]}',
    "Use approved if score >= 75 and no blockers. Use blocked if score < 40 or a critical rule is violated. Otherwise needs_review.",
  ].filter(Boolean).join("\n\n");
}

function parseEvaluationContent(content) {
  try {
    const json = JSON.parse(stripCodeFence(String(content || "").trim()));
    const score = typeof json.score === "number" ? Math.max(0, Math.min(100, json.score)) : 50;
    const status = ["approved", "needs_review", "blocked"].includes(json.status) ? json.status : "needs_review";
    return {
      score,
      status,
      summary: String(json.summary || "").trim(),
      issues: Array.isArray(json.issues) ? json.issues.map(String).filter(Boolean) : [],
      suggestions: Array.isArray(json.suggestions) ? json.suggestions.map(String).filter(Boolean) : [],
    };
  } catch (_err) {
    return { score: 50, status: "needs_review", summary: "Could not parse evaluation response.", issues: [], suggestions: [] };
  }
}

async function callOpenAiWithPrompt(prompt, { key, model, fetchImpl, maxTokens = EVALUATOR_MAX_TOKENS }) {
  const doFetch = fetchImpl || fetch;
  const response = await doFetch(OPENAI_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: "You are a precise social media content evaluator. Always reply with strict JSON." },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(STAGE_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status} ${await safeText(response)}`);
  const data = await response.json();
  return data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content
    : "";
}

// ─── LLM Draft Rewrite ───────────────────────────────────────────────────────
//
// rewriteDraftWithSuggestions takes the original draft + evaluation findings and
// returns a revised version with all suggestions applied:
//   { ok: true, revisedText: "..." }
//   { ok: true, revisedText: null, degraded: "no-reviewer-key" }
//   { ok: false, revisedText: null, error: "..." }

const REWRITER_MAX_TOKENS = 1024;

async function rewriteDraftWithSuggestions(payload = {}, deps = {}) {
  const env = deps.env || process.env;
  const reviewerKey = env.OPENAI_API_KEY;
  const reviewerModel = env.DIAMOND_REVIEWER_MODEL || DEFAULT_REVIEWER_MODEL;

  if (!reviewerKey && !deps.rewriter) {
    return { ok: true, revisedText: null, degraded: "no-reviewer-key" };
  }

  const doRewrite = deps.rewriter
    || ((prompt) => callOpenAiWithPrompt(prompt, { key: reviewerKey, model: reviewerModel, fetchImpl: deps.fetchImpl, maxTokens: REWRITER_MAX_TOKENS }));

  const prompt = buildRewritePrompt(payload);
  try {
    const raw = await doRewrite(prompt);
    const revisedText = unwrapRewriteText(String(raw || "").trim());
    return { ok: true, revisedText: revisedText || null };
  } catch (error) {
    return { ok: false, revisedText: null, error: normalizeError(error) };
  }
}

// Some models ignore "no JSON" instructions and wrap the response anyway.
// Extract the string value from common envelope shapes before storing.
function unwrapRewriteText(raw) {
  if (!raw.startsWith("{") && !raw.startsWith("[")) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return parsed.trim();
    if (Array.isArray(parsed)) {
      const first = parsed.find((v) => typeof v === "string");
      return first ? first.trim() : raw;
    }
    if (typeof parsed === "object" && parsed !== null) {
      // Try known field names first for speed.
      const knownKeys = ["post", "text", "content", "revised", "draft", "output", "result",
        "revisedText", "revisedPostText", "revision", "copy", "message"];
      for (const key of knownKeys) {
        if (typeof parsed[key] === "string") return parsed[key].trim();
      }
      // Fall back: if there's exactly one string value in the object, use it regardless of key name.
      const stringValues = Object.values(parsed).filter((v) => typeof v === "string");
      if (stringValues.length === 1) return stringValues[0].trim();
    }
  } catch {
    // Not valid JSON — return as-is.
  }
  return raw;
}

function buildRewritePrompt({ platform, text, issues = [], suggestions = [], brand = {}, charLimit = null }) {
  const name = platformLabel(platform);
  const fixList = [
    ...issues.map((i) => `Fix: ${i}`),
    ...suggestions.map((s) => `Apply: ${s}`),
  ];
  return [
    `You are a social media copywriter. Revise the ${name} post draft below to fix the listed issues and apply the suggestions.`,
    fixList.length ? `Changes to make:\n${fixList.join("\n")}` : "",
    brand.voice ? `Brand voice: ${brand.voice}` : "",
    charLimit ? `Stay under ${charLimit} characters.` : "",
    `Original draft:\n${text || "(empty)"}`,
    "Output ONLY the revised post text. Do not wrap it in JSON, do not add a label or key, do not include any explanation. Plain text only.",
  ].filter(Boolean).join("\n\n");
}

async function safeText(response) {
  try {
    return await response.text();
  } catch (_error) {
    return response.statusText || "";
  }
}

module.exports = {
  generatePostDrafts,
  evaluateDraftWithLlm,
  rewriteDraftWithSuggestions,
  buildWriterPrompt,
  buildReviewerPrompt,
  buildEvaluationPrompt,
  parseEvaluationContent,
  parseReviewerContent,
  DEFAULT_WRITER_MODEL,
  DEFAULT_REVIEWER_MODEL,
};
