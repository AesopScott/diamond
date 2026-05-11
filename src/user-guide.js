const DEFAULT_ELEVENLABS_MODEL = "eleven_multilingual_v2";
const DEFAULT_OUTPUT_FORMAT = "mp3_44100_128";

const guideSections = [
  {
    id: "target",
    title: "1. Choose the account you are operating",
    summary: "Pick the company, brand, campaign, and social account before touching a post.",
    steps: [
      "Use the Tenant selectors in the left rail.",
      "Confirm the Active target banner at the top of the workspace.",
      "If the active target is wrong, stop and switch it before staging anything.",
    ],
  },
  {
    id: "session",
    title: "2. Confirm the browser session",
    summary: "Diamond uses your visible browser login. It does not store your social password.",
    steps: [
      "Open the login or account page for the selected platform.",
      "Sign in manually when the platform asks for it.",
      "Use Check session or Mark ready before staging a post.",
    ],
  },
  {
    id: "package",
    title: "3. Build and review the post package",
    summary: "The Post Package is the copy, media, approval state, and schedule record for one social post.",
    steps: [
      "Write or generate the draft text.",
      "Evaluate the draft for risk, quality, claims, and repetition.",
      "Approve it only after the live precheck looks right.",
    ],
  },
  {
    id: "stage",
    title: "4. Stage in the browser",
    summary: "Staging opens the platform composer, inserts the approved text when possible, and stops before publishing.",
    steps: [
      "Use Stage in browser after approval.",
      "Review the visible composer yourself.",
      "Publish manually on the social platform, then capture the run or mark the package posted.",
    ],
  },
  {
    id: "calendar",
    title: "5. Use the calendars when posts are planned ahead",
    summary: "The editorial calendar creates work. The schedule calendar tracks when approved work should go out.",
    steps: [
      "Use Editorial Calendar for planned content slots.",
      "Use Schedule Calendar to see upcoming, overdue, ready, and completed posts.",
      "Keep schedules scoped to the right company, brand, campaign, platform, and account.",
    ],
  },
  {
    id: "safety",
    title: "6. Let Diamond fail closed",
    summary: "When Diamond is unsure, the correct behavior is to pause instead of publishing wrong.",
    steps: [
      "Treat red warning cards as real blockers.",
      "Fix login, license, target, risk, or media issues before continuing.",
      "Use the run log as the audit trail for what happened.",
    ],
  },
];

const tourSteps = [
  {
    id: "active-target",
    title: "Start with the Active target",
    targetSelector: ".topbar",
    voiceoverText: "First, confirm the Active target. This tells you exactly which company, brand, campaign, and social account Diamond is about to operate.",
  },
  {
    id: "tenant",
    title: "Choose the tenant context",
    targetSelector: "#company-select",
    voiceoverText: "Use the Tenant controls to switch companies, brands, campaigns, and accounts. Every queue item and browser session is scoped to this selection.",
  },
  {
    id: "session",
    title: "Check the social login session",
    targetSelector: "#session-card",
    voiceoverText: "Diamond uses the visible browser session for the selected account. If the session is unknown or expired, sign in manually before staging.",
  },
  {
    id: "composer",
    title: "Review the Post Package",
    targetSelector: ".composer",
    voiceoverText: "The Post Package holds the draft text, media, approval state, and next actions for one social post.",
  },
  {
    id: "actions",
    title: "Use the numbered workflow",
    targetSelector: ".draft-actions",
    voiceoverText: "Work through the numbered buttons. Evaluate, approve, stage, upload media, capture the run, schedule, mark posted, or mark abandoned.",
  },
  {
    id: "browser",
    title: "Use the visible browser",
    targetSelector: ".browser",
    voiceoverText: "The browser is intentionally visible. Diamond can stage the post, but you can always take over before anything is published.",
  },
  {
    id: "log",
    title: "Read the run log",
    targetSelector: ".log-panel",
    voiceoverText: "The run log explains what Diamond just did, what it blocked, and what needs your attention.",
  },
  {
    id: "calendar",
    title: "Plan from the calendars",
    targetSelector: "#schedule-calendar-panel",
    voiceoverText: "Use the calendars to plan posts, see what is due, and keep scheduled work tied to the right brand and account.",
  },
];

export function getDiamondGuideSections() {
  return guideSections.map((section) => ({
    ...section,
    steps: [...section.steps],
  }));
}

export function getDiamondTourSteps() {
  return tourSteps.map((step, index) => ({
    ...step,
    order: index + 1,
  }));
}

export function validateDiamondTourSteps(steps = getDiamondTourSteps()) {
  const issues = [];
  steps.forEach((step, index) => {
    if (!step.id) issues.push(`Step ${index + 1} is missing an id.`);
    if (!step.title) issues.push(`Step ${index + 1} is missing a title.`);
    if (!step.targetSelector) issues.push(`Step ${index + 1} is missing a target selector.`);
    if (!step.voiceoverText) issues.push(`Step ${index + 1} is missing voiceover text.`);
  });
  return {
    ok: issues.length === 0,
    issues,
  };
}

export function buildTourVoiceoverScript(steps = getDiamondTourSteps()) {
  return steps
    .map((step) => `${step.order || ""}. ${step.title}\n${step.voiceoverText}`)
    .join("\n\n");
}

export function createElevenLabsSpeechRequest({
  text,
  voiceId,
  modelId = DEFAULT_ELEVENLABS_MODEL,
  outputFormat = DEFAULT_OUTPUT_FORMAT,
  languageCode = "en",
  stability = 0.45,
  similarityBoost = 0.75,
  speed = 1,
} = {}) {
  const trimmedText = String(text || "").trim();
  const trimmedVoiceId = String(voiceId || "").trim();
  if (!trimmedText) {
    return { ok: false, reason: "Voiceover text is required." };
  }
  if (!trimmedVoiceId) {
    return { ok: false, reason: "ElevenLabs voiceId is required." };
  }
  return {
    ok: true,
    provider: "elevenlabs",
    method: "POST",
    endpoint: `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(trimmedVoiceId)}?output_format=${encodeURIComponent(outputFormat)}`,
    apiKeyHeader: "xi-api-key",
    apiKeyEnvVar: "ELEVENLABS_API_KEY",
    body: {
      text: trimmedText,
      model_id: modelId,
      language_code: languageCode,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
        speed,
      },
    },
  };
}

