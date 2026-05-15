const DEFAULT_ELEVENLABS_MODEL = "eleven_multilingual_v2";
const DEFAULT_OUTPUT_FORMAT = "mp3_44100_128";

const guideSections = [
  {
    id: "posts",
    title: "1. Start on the Posts board",
    summary: "The Posts page is the daily workspace for drafts, scheduled posts, published posts, review items, and failures.",
    steps: [
      "Open a card to review the source idea and platform drafts.",
      "Use Create when you need a new post package.",
      "Treat Needs Review and Failed as the first things to clear before adding more work.",
    ],
  },
  {
    id: "package",
    title: "2. Build the post package",
    summary: "A post package is one source idea with one or more platform-specific drafts attached to it.",
    steps: [
      "Write or edit the source idea in the post detail view.",
      "Add the platforms that should receive their own draft.",
      "Use tags, media, and generation style before approval so every platform draft has the right context.",
    ],
  },
  {
    id: "drafts",
    title: "3. Review each platform draft",
    summary: "Each platform gets its own text, limits, approval state, preview, and posting actions.",
    steps: [
      "Read the platform-specific text instead of assuming one draft works everywhere.",
      "Evaluate for quality, risk, claims, and repetition.",
      "Approve only the drafts that are ready to schedule or stage.",
    ],
  },
  {
    id: "accounts",
    title: "4. Confirm the social account",
    summary: "Accounts are scoped by company and brand so the wrong browser profile does not post for the wrong client.",
    steps: [
      "Open Accounts before staging if the session is unknown, expired, or attached to the wrong platform.",
      "Use the account page to open the login page, mark the session ready, or capture proof.",
      "Diamond uses your visible browser session; it should not store social passwords.",
    ],
  },
  {
    id: "calendar",
    title: "5. Use Calendar for planned work",
    summary: "Calendar shows upcoming, overdue, ready, completed, and canceled scheduled posts.",
    steps: [
      "Use Schedule from the header or from an approved platform draft.",
      "Load a scheduled post when you need to review or stage it.",
      "Cancel or mark posted only when the schedule really changed.",
    ],
  },
  {
    id: "brands",
    title: "6. Maintain brand strategy",
    summary: "Brands keeps the company, brand, campaign, voice, audience, pillars, and claim rules close to the publishing work.",
    steps: [
      "Create companies, brands, and campaigns before connecting accounts.",
      "Keep goals, audience, pillars, voice, approved phrases, and blocked claims current.",
      "Use brand strategy as the source of truth before generating campaign content.",
    ],
  },
  {
    id: "settings",
    title: "7. Manage operating settings",
    summary: "Settings holds licensing, Firebase, legal drafts, routine timing, accessibility, and theme choices.",
    steps: [
      "Keep the temporary unlimited license until the shop is ready.",
      "Use Firebase sync and export when you need to inspect or move the Firestore bundle.",
      "Use Theme and Accessibility when the interface needs to be easier to read or operate.",
    ],
  },
  {
    id: "operator",
    title: "8. Use Operator only when needed",
    summary: "Operator tools are for advanced browser staging, validation, proof capture, sync checks, and run logs.",
    steps: [
      "Open Operator when you need to stage in the visible browser or validate a package.",
      "Read warnings before continuing; Diamond should fail closed when the target or session is unclear.",
      "Capture proof or export sync data after meaningful publishing actions.",
    ],
  },
  {
    id: "analytics",
    title: "9. Review performance",
    summary: "Analytics explains output, funnel health, platform readiness, and operational blockers.",
    steps: [
      "Use totals to see whether publishing is moving signups and league joins.",
      "Review platform readiness before assigning more work to a stuck account.",
      "Export when you need to preserve a reporting snapshot.",
    ],
  },
  {
    id: "safety",
    title: "10. Let Diamond fail closed",
    summary: "When Diamond is unsure, the correct behavior is to pause instead of publishing the wrong thing.",
    steps: [
      "Treat red warning cards as real blockers.",
      "Fix login, license, target, risk, or media issues before continuing.",
      "Use the run log as the audit trail for what happened.",
    ],
  },
];

const tourSteps = [
  {
    id: "posts-nav",
    title: "Start on Posts",
    targetSelector: "#prototype-nav",
    voiceoverText: "Start with the main navigation. Posts is the daily board, and the other pages hold calendar, accounts, brands, settings, and reporting.",
  },
  {
    id: "create",
    title: "Create or open a post package",
    targetSelector: "#create-post",
    voiceoverText: "Use Create for a new post package, or open a card on the board to continue existing work.",
  },
  {
    id: "board",
    title: "Read the board by status",
    targetSelector: "#posts-board",
    voiceoverText: "The board separates drafts, scheduled posts, published posts, review items, and failures so you can see what needs attention.",
  },
  {
    id: "calendar",
    title: "Plan from Calendar",
    targetSelector: "#prototype-nav a[data-view=\"calendar-view\"]",
    voiceoverText: "Calendar shows the publishing schedule. Use it to load, stage, complete, or cancel scheduled work.",
  },
  {
    id: "accounts",
    title: "Check social accounts",
    targetSelector: "#prototype-nav a[data-view=\"accounts-view\"]",
    voiceoverText: "Accounts is where you manage platform logins, browser profiles, proof captures, and setup kits by company and brand.",
  },
  {
    id: "brands",
    title: "Maintain brand context",
    targetSelector: "#prototype-nav a[data-view=\"brands-view\"]",
    voiceoverText: "Brands holds company identity, campaign strategy, voice, audience, pillars, and claim rules so generated work stays on track.",
  },
  {
    id: "settings",
    title: "Use Settings as the control room",
    targetSelector: "#prototype-nav a[data-view=\"settings-view\"]",
    voiceoverText: "Settings holds licensing, Firebase, legal drafts, routine timing, accessibility, and the theme selector.",
  },
  {
    id: "operator",
    title: "Open Operator for advanced work",
    targetSelector: "#operator-toggle",
    voiceoverText: "Operator tools handle browser staging, validation, sync checks, run proof, and audit-style logs when you need deeper control.",
  },
  {
    id: "guide",
    title: "Return to this guide",
    targetSelector: "#diamond-guide-panel",
    voiceoverText: "The user guide stays in Settings so you can come back when the workflow gets complicated.",
  },
  {
    id: "fail-closed",
    title: "Fail closed",
    targetSelector: "#settings-workspace",
    voiceoverText: "If the target, account, license, browser session, or draft quality is unclear, pause and fix the blocker before publishing.",
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
