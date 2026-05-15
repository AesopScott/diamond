import {
  classifySocialReply,
  createResponseDraftForReply,
  createSocialReply,
} from "./reply-classifier.js";

export function captureRedditMonitoringItem(input = {}) {
  const text = clean(input.text);
  if (!text) return { ok: false, reason: "Reddit capture requires text." };
  const sourceUrl = clean(input.sourceUrl);
  const context = {
    ...(input.context || {}),
    platform: "reddit",
    socialAccountId: input.socialAccountId || input.context?.socialAccountId || "",
  };
  const classification = classifySocialReply({ text, platform: "reddit" });
  const reply = createSocialReply({
    id: input.id || `reddit-reply-${Date.now()}`,
    context,
    author: clean(input.author) || "Reddit user",
    sourceUrl,
    text,
    classification,
    notes: monitoringNotes(input),
    createdAt: input.createdAt,
  });
  reply.platform = "reddit";
  reply.monitoringOnly = true;
  reply.threadTitle = clean(input.threadTitle);
  reply.subreddit = normalizeSubreddit(input.subreddit || sourceUrl);
  reply.route.notes = [reply.route.notes, "Reddit monitoring capture. Do not publish automatically."].filter(Boolean).join(" ");
  const responseDraft = createResponseDraftForReply({
    id: input.responseDraftId || `reddit-response-${Date.now()}`,
    reply,
    text: input.responseText,
    createdAt: input.createdAt,
  });
  responseDraft.platform = "reddit";
  responseDraft.monitoringOnly = true;
  responseDraft.status = classification.shouldEscalate ? "escalation_required" : "needs_approval";
  return {
    ok: true,
    reply,
    responseDraft,
    classification,
    reason: `${classification.category}/${classification.priority} Reddit item captured.`,
  };
}

export function redditMonitoringCanStage() {
  return {
    ok: false,
    reason: "Reddit is monitoring-only. Capture, classify, and draft responses; do not stage posts.",
  };
}

function monitoringNotes(input) {
  return [
    clean(input.notes),
    clean(input.threadTitle) ? `Thread: ${clean(input.threadTitle)}` : "",
    clean(input.subreddit) ? `Subreddit: ${normalizeSubreddit(input.subreddit)}` : "",
  ].filter(Boolean).join(" ");
}

function normalizeSubreddit(value) {
  const text = clean(value);
  const match = text.match(/\/r\/([A-Za-z0-9_]+)/i);
  if (match) return `r/${match[1]}`;
  if (/^r\/[A-Za-z0-9_]+$/i.test(text)) return text;
  if (/^[A-Za-z0-9_]+$/i.test(text)) return `r/${text}`;
  return "";
}

function clean(value) {
  return String(value || "").trim();
}
