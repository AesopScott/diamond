import { contextsMatch } from "./tenant-context.js";

export function createDefaultCadencePolicy(input = {}) {
  return {
    id: input.id || `${input.companyId || "company"}-${input.brandId || "brand"}-${input.campaignId || "campaign"}-cadence`,
    companyId: input.companyId || "",
    brandId: input.brandId || "",
    campaignId: input.campaignId || "",
    maxPostsPerDay: numberOr(input.maxPostsPerDay, 3),
    maxRepliesPerHour: numberOr(input.maxRepliesPerHour, 8),
    quietHoursStart: numberOr(input.quietHoursStart, 22),
    quietHoursEnd: numberOr(input.quietHoursEnd, 7),
    cooldownMinutes: numberOr(input.cooldownMinutes, 45),
    duplicateLookbackDays: numberOr(input.duplicateLookbackDays, 14),
    routineDueWindowMinutes: numberOr(input.routineDueWindowMinutes, 15),
    doNotEngageTerms: Array.isArray(input.doNotEngageTerms) ? input.doNotEngageTerms : [
      "lawsuit",
      "subpoena",
      "chargeback",
      "scam",
      "fraud",
    ],
    escalationTerms: Array.isArray(input.escalationTerms) ? input.escalationTerms : [
      "regulator",
      "attorney",
      "press",
      "investor",
      "threat",
    ],
  };
}

export function validateCadenceForStaging(input = {}) {
  const policy = createDefaultCadencePolicy(input.policy || {});
  const context = input.context;
  const draft = input.draft || {};
  const now = input.now ? new Date(input.now) : new Date();
  const runs = Array.isArray(input.runs) ? input.runs : [];
  const memory = Array.isArray(input.memory) ? input.memory : [];
  const reasons = [];

  if (isQuietHour(now, policy)) {
    reasons.push(`Quiet hours are active (${formatHour(policy.quietHoursStart)}-${formatHour(policy.quietHoursEnd)}).`);
  }

  const sameContextRuns = runs.filter((run) => run.context && context && contextsMatch(run.context, context));
  const postedToday = sameContextRuns.filter((run) => run.status === "posted" && isSameLocalDay(dateForRun(run), now)).length;
  if (postedToday >= policy.maxPostsPerDay) {
    reasons.push(`Daily post limit reached (${postedToday}/${policy.maxPostsPerDay}).`);
  }

  const lastPosted = sameContextRuns
    .filter((run) => ["posted", "staged", "needs_manual_finish"].includes(run.status))
    .map(dateForRun)
    .filter(Boolean)
    .sort((a, b) => b - a)[0];
  if (lastPosted && minutesBetween(lastPosted, now) < policy.cooldownMinutes) {
    reasons.push(`Cooldown active (${Math.ceil(policy.cooldownMinutes - minutesBetween(lastPosted, now))} minute(s) remaining).`);
  }

  const lowerText = String(draft.text || "").toLowerCase();
  const blockedTerm = policy.doNotEngageTerms.find((term) => term && lowerText.includes(String(term).toLowerCase()));
  if (blockedTerm) {
    reasons.push(`Do-not-engage term detected: ${blockedTerm}.`);
  }

  const escalationTerm = policy.escalationTerms.find((term) => term && lowerText.includes(String(term).toLowerCase()));
  if (escalationTerm) {
    reasons.push(`Escalation term detected: ${escalationTerm}.`);
  }

  const duplicate = findRecentDuplicate(draft, memory, context, now, policy.duplicateLookbackDays);
  if (duplicate) {
    reasons.push(`Recent duplicate found in post memory: ${duplicate.sourceId || duplicate.id}.`);
  }

  return {
    ok: reasons.length === 0,
    reasons,
    summary: reasons.length ? reasons.join(" ") : "Cadence clear.",
  };
}

function findRecentDuplicate(draft, memory, context, now, days) {
  const text = normalizeText(draft.text);
  if (!text) return null;
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return memory.find((item) => {
    if (!item?.context || !context || !contextsMatch(item.context, context)) return false;
    const created = new Date(item.updatedAt || item.createdAt || 0);
    if (created < cutoff) return false;
    return normalizeText(item.text) === text;
  }) || null;
}

function isQuietHour(now, policy) {
  const hour = now.getHours();
  const start = clampHour(policy.quietHoursStart);
  const end = clampHour(policy.quietHoursEnd);
  if (start === end) return false;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

function isSameLocalDay(left, right) {
  if (!left || !right) return false;
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function dateForRun(run) {
  const value = run.postedAt || run.createdAt || run.updatedAt;
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function minutesBetween(left, right) {
  return Math.max(0, (right.getTime() - left.getTime()) / 60000);
}

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function numberOr(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampHour(value) {
  return Math.max(0, Math.min(23, Math.trunc(numberOr(value, 0))));
}

function formatHour(value) {
  return `${String(clampHour(value)).padStart(2, "0")}:00`;
}
