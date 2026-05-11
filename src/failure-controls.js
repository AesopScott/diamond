import { contextsMatch } from "./tenant-context.js";

export function findDuplicateDraft(candidate, drafts = []) {
  if (!candidate) return null;
  const text = normalizeText(candidate.text);
  if (!text) return null;
  return drafts.find((draft) => draft.id !== candidate.id
    && !["removed", "abandoned"].includes(draft.status)
    && normalizeText(draft.text) === text
    && contextsMatch(draft.context, candidate.context)) || null;
}

export function validateMediaRequirement(media = [], options = {}) {
  if (!options.required) return { ok: true, reason: "Media is optional" };
  if (Array.isArray(media) && media.length > 0) return { ok: true, reason: "Media is present" };
  return { ok: false, reason: "Required media is missing" };
}

export function validateAssetForUse(asset, options = {}) {
  if (!asset) return { ok: false, reason: "Asset is missing" };
  if (asset.doNotUse) return { ok: false, reason: "Asset is marked do-not-use" };
  if (options.requireAltText && !String(asset.altText || "").trim()) {
    return { ok: false, reason: "Asset is missing alt text" };
  }
  if (options.requireSafeZone && !String(asset.safeZone || "").trim()) {
    return { ok: false, reason: "Asset is missing safe-zone metadata" };
  }
  if (!String(asset.filePath || "").trim()) return { ok: false, reason: "Asset is missing a file path" };
  return { ok: true, reason: "Asset can be used" };
}

export function validateRoutineSlot(slot, options = {}) {
  const missing = [
    ["company", slot?.companyId],
    ["brand", slot?.brandId],
    ["campaign", slot?.campaignId],
    ["platform", slot?.platform],
    ["social account", slot?.socialAccountId],
    ["topic", slot?.topic],
  ].filter(([, value]) => !value);
  if (missing.length) {
    return { ok: false, reason: `Missing ${missing.map(([label]) => label).join(", ")}.` };
  }

  if (slot.status !== "planned") {
    return { ok: false, reason: `Slot status is ${slot.status}` };
  }

  const plannedAt = new Date(slot.plannedAt);
  const now = options.now ? new Date(options.now) : new Date();
  const dueWindowMs = Number.isFinite(options.dueWindowMs) ? options.dueWindowMs : 15 * 60 * 1000;
  if (!Number.isNaN(plannedAt.getTime()) && plannedAt.getTime() > now.getTime() + dueWindowMs) {
    return { ok: false, reason: "Slot is not due yet" };
  }

  const strategy = options.strategy || {};
  if (!strategy.cta) return { ok: false, reason: "Campaign strategy is missing a CTA." };
  if (!Array.isArray(strategy.pillars) || !strategy.pillars.length) {
    return { ok: false, reason: "Campaign strategy is missing content pillars." };
  }

  return { ok: true, reason: "Ready for routine" };
}

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}
