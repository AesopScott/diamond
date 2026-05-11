export function classifySocialReply(input = {}) {
  const text = String(input.text || "");
  const lower = text.toLowerCase();
  const matches = [];
  const category = categoryRules.find((rule) => {
    const hit = rule.terms.find((term) => lower.includes(term));
    if (hit) matches.push(hit);
    return hit;
  })?.category || "product";
  const priority = priorityForCategory(category);
  const suggestedAction = actionForCategory(category);
  return {
    category,
    priority,
    suggestedAction,
    matchedTerms: matches,
    requiresApproval: true,
    shouldEscalate: ["legal", "regulatory", "money", "hostile"].includes(category),
  };
}

export function createSocialReply(input = {}) {
  const classification = input.classification || classifySocialReply(input);
  const triage = input.triage || createInboxTriage({ classification, ...input });
  return {
    id: input.id || `reply-${Date.now()}`,
    context: input.context,
    author: clean(input.author),
    sourceUrl: clean(input.sourceUrl),
    text: clean(input.text),
    classification,
    triage,
    status: classification.shouldEscalate ? "escalated" : "captured",
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
}

export function createInboxTriage(input = {}) {
  const classification = input.classification || classifySocialReply(input);
  const now = input.createdAt ? new Date(input.createdAt) : new Date();
  const dueAt = dueDateForPriority(classification.priority, now);
  return {
    priority: input.priority || classification.priority,
    owner: clean(input.owner) || ownerForCategory(classification.category),
    nextAction: input.nextAction || classification.suggestedAction,
    dueAt: input.dueAt || dueAt.toISOString(),
    escalationReason: classification.shouldEscalate ? `${classification.category} reply requires manual escalation.` : "",
    notes: clean(input.notes),
    status: classification.shouldEscalate ? "escalation_required" : "ready_for_review",
  };
}

export function createResponseDraftForReply(input = {}) {
  const reply = input.reply || {};
  const classification = reply.classification || classifySocialReply(reply);
  return {
    id: input.id || `response-${Date.now()}`,
    replyId: reply.id,
    context: reply.context,
    text: clean(input.text) || defaultResponseFor(classification.category),
    category: classification.category,
    priority: classification.priority,
    status: classification.shouldEscalate ? "escalation_required" : "needs_approval",
    requiresApproval: true,
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
}

function defaultResponseFor(category) {
  const responses = {
    support: "Thanks for flagging this. Please send the account details through support so we can look at it carefully.",
    bug: "Thanks for catching this. We are logging it as a bug and will check the flow.",
    investor: "Thanks for the interest. The right next step is a private conversation, not a public thread.",
    influencer: "This could be a fit. Please send your account details and audience notes so we can review.",
    legal: "We cannot handle legal questions in a public reply. Please contact us directly through the proper channel.",
    money: "We need to be careful with prize and payment questions. Please check the official rules and support path.",
    regulatory: "We cannot answer regulatory questions in a public thread. Please use the official contact path.",
    hostile: "No response recommended.",
    spam: "No response recommended.",
  };
  return responses[category] || "Thanks for the note. We are taking a look.";
}

function priorityForCategory(category) {
  if (["legal", "regulatory", "money", "hostile"].includes(category)) return "high";
  if (["support", "bug", "investor", "influencer"].includes(category)) return "medium";
  return "normal";
}

function actionForCategory(category) {
  if (["legal", "regulatory", "money", "hostile"].includes(category)) return "escalate";
  if (["spam"].includes(category)) return "ignore";
  return "draft_response";
}

function ownerForCategory(category) {
  if (["legal", "regulatory", "money"].includes(category)) return "Founder";
  if (["support", "bug"].includes(category)) return "Support";
  if (["investor"].includes(category)) return "Founder";
  if (["influencer"].includes(category)) return "Growth";
  return "Social";
}

function dueDateForPriority(priority, now) {
  const minutes = priority === "high" ? 60 : priority === "medium" ? 4 * 60 : 24 * 60;
  return new Date(now.getTime() + minutes * 60 * 1000);
}

function clean(value) {
  return String(value || "").trim();
}

const categoryRules = [
  { category: "legal", terms: ["lawsuit", "attorney", "legal", "subpoena", "terms of service"] },
  { category: "regulatory", terms: ["regulator", "cftc", "gaming commission", "gambling license", "licensed"] },
  { category: "money", terms: ["payout", "prize", "billing", "charge", "refund", "paid", "membership"] },
  { category: "hostile", terms: ["scam", "fraud", "fake", "sue you", "hate"] },
  { category: "support", terms: ["login", "password", "account", "email verification", "not working"] },
  { category: "bug", terms: ["bug", "broken", "error", "crash", "stuck"] },
  { category: "investor", terms: ["investor", "invest", "valuation", "equity", "funding"] },
  { category: "influencer", terms: ["sponsor", "collab", "influencer", "affiliate", "audience"] },
  { category: "spam", terms: ["crypto giveaway", "airdrop", "dm me now", "telegram"] },
  { category: "product", terms: ["feature", "league", "leaderboard", "world cup", "prediction"] },
];
