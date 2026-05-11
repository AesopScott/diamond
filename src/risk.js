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
  const flags = detectRiskFlags(text);
  const reviewRequired = new Set(policy.reviewRequiredFlags || DEFAULT_REVIEW_REQUIRED_FLAGS);
  const blockedFlags = new Set(policy.blockedFlags || []);

  if (flags.some((flag) => blockedFlags.has(flag))) {
    return { level: "blocked", flags };
  }
  if (flags.some((flag) => reviewRequired.has(flag))) {
    return { level: "review_required", flags };
  }
  return { level: "auto_allowed", flags };
}
