import { DEFAULT_REVIEW_REQUIRED_FLAGS } from "./constants.js";

const RISK_PATTERNS = Object.freeze({
  money: /\b(\$|money|cash|payout|payment|paid|revenue|profit|refund|subscription)\b/i,
  prize: /\b(prize|giveaway|winner|runner-up|sweepstakes|contest|reward|jackpot)\b/i,
  gambling: /\b(gambling|betting|wager|sportsbook|casino|odds|stake|parlay)\b/i,
  regulatory: /\b(cftc|regulated|regulation|legal in|license|permit|compliance)\b/i,
  legal: /\b(lawsuit|lawyer|attorney|legal|terms of service|liability|disclaimer)\b/i,
  equity: /\b(equity|ownership|shares|cap table|stock|stake in the company)\b/i,
  investment: /\b(investor|investment|valuation|returns|roi|fundraise|raise money)\b/i,
  support_sensitive: /\b(password|account locked|login|email verification|charge|billing|delete my account)\b/i,
  hostile: /\b(scam|fraud|fake|trash|sue|hate|angry|complaint)\b/i,
});

export function detectRiskFlags(text) {
  const value = String(text || "");
  return Object.entries(RISK_PATTERNS)
    .filter(([, pattern]) => pattern.test(value))
    .map(([flag]) => flag);
}

export function approvalLevelForText(text, policy = {}) {
  return evaluateDraftRisk({
    text,
    policy,
    brandLibrary: policy.brandLibrary,
    claimLibrary: policy.claimLibrary,
  });
}

export function evaluateDraftRisk({ text, policy = {}, brandLibrary = {}, claimLibrary = {} }) {
  const flags = new Set(detectRiskFlags(text));
  const details = [];
  const value = String(text || "");

  findTerms(value, brandLibrary.bannedPhrases).forEach((term) => {
    flags.add("banned_phrase");
    details.push(`Banned phrase found: ${term}`);
  });

  findTerms(value, claimLibrary.blockedClaims).forEach((term) => {
    flags.add("blocked_claim");
    details.push(`Blocked claim found: ${term}`);
  });

  findTerms(value, claimLibrary.requiresReviewClaims).forEach((term) => {
    flags.add("claim_review");
    details.push(`Claim requires approval: ${term}`);
  });

  findTerms(value, claimLibrary.prizeLanguage).forEach((term) => {
    flags.add("prize");
    details.push(`Prize language found: ${term}`);
  });

  findTerms(value, claimLibrary.freeToPlayLanguage).forEach((term) => {
    details.push(`Approved free-to-play language found: ${term}`);
  });

  findTerms(value, brandLibrary.approvedPhrases).forEach((term) => {
    details.push(`Approved brand phrase found: ${term}`);
  });

  const flagList = [...flags];
  const reviewRequired = new Set(policy.reviewRequiredFlags || DEFAULT_REVIEW_REQUIRED_FLAGS);
  const blockedFlags = new Set(policy.blockedFlags || []);

  if (flagList.some((flag) => blockedFlags.has(flag) || flag === "banned_phrase" || flag === "blocked_claim")) {
    return { level: "blocked", flags: flagList, details };
  }
  if (flagList.some((flag) => reviewRequired.has(flag) || flag === "claim_review")) {
    return { level: "review_required", flags: flagList, details };
  }
  return { level: "auto_allowed", flags: flagList, details };
}

function findTerms(text, terms = []) {
  const value = String(text || "").toLowerCase();
  return normalizeTerms(terms).filter((term) => value.includes(term.toLowerCase()));
}

function normalizeTerms(terms = []) {
  if (Array.isArray(terms)) return terms.map(String).map((term) => term.trim()).filter(Boolean);
  return String(terms || "")
    .split(/\r?\n|,/)
    .map((term) => term.trim())
    .filter(Boolean);
}
