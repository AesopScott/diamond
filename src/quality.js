import { contextsMatch } from "./tenant-context.js";

export function evaluateDraftQuality(input = {}) {
  const draft = input.draft || {};
  const strategy = input.strategy || {};
  const memory = Array.isArray(input.memory) ? input.memory : [];
  const assets = Array.isArray(input.assets) ? input.assets : [];
  const slot = input.slot || null;
  const details = [];
  let score = 100;

  if (draft.approvalLevel === "blocked") {
    score -= 40;
    details.push("Risk: draft is blocked.");
  } else if (draft.approvalLevel === "review_required") {
    score -= 15;
    details.push("Risk: review is required.");
  }

  const cta = languageText(strategy, "cta", draft.language);
  if (!cta || !containsLoose(draft.text, cta)) {
    score -= 15;
    details.push("CTA: draft does not include the campaign CTA.");
  } else {
    details.push("CTA: campaign CTA is present.");
  }

  if (!languageMatches(draft.text, draft.language)) {
    score -= 15;
    details.push(`Language: draft does not look like ${draft.language || "en"}.`);
  } else {
    details.push(`Language: ${draft.language || "en"} matches.`);
  }

  const duplicate = findSimilarMemory(draft, memory);
  if (duplicate) {
    score -= 30;
    details.push(`Novelty: similar to ${duplicate.sourceId || duplicate.id}.`);
  } else {
    details.push("Novelty: no close repeat found.");
  }

  if (draft.media?.length) {
    const attachedAssets = assets.filter((asset) => draft.media.includes(asset.filePath));
    if (attachedAssets.some((asset) => asset.doNotUse)) {
      score -= 35;
      details.push("Asset fit: attached asset is marked do-not-use.");
    } else if (attachedAssets.length) {
      details.push("Asset fit: attached asset is usable.");
    } else {
      score -= 5;
      details.push("Asset fit: media has no library metadata.");
    }
  } else {
    score -= 10;
    details.push("Asset fit: no asset attached.");
  }

  if (slot?.assetNeed) {
    const needed = String(slot.assetNeed).toLowerCase();
    const attachedAssets = assets.filter((asset) => draft.media?.includes(asset.filePath));
    if (!attachedAssets.length) {
      score -= 15;
      details.push(`Visual fit: missing ${slot.assetNeed} asset for the slot.`);
    } else if (!attachedAssets.some((asset) => String(asset.type || "").toLowerCase().includes(needed) || needed.includes(String(asset.type || "").toLowerCase()))) {
      score -= 10;
      details.push(`Visual fit: attached asset does not match ${slot.assetNeed}.`);
    } else {
      details.push(`Visual fit: ${slot.assetNeed} asset is attached.`);
    }
  }

  if (draft.text && draft.text.length >= 80) {
    details.push("Audience value: draft has enough context.");
  } else {
    score -= 10;
    details.push("Audience value: draft is thin.");
  }

  const finalScore = Math.max(0, Math.min(100, score));
  return {
    score: finalScore,
    level: duplicate || draft.approvalLevel === "blocked"
      ? "hold"
      : finalScore >= 80 ? "strong" : finalScore >= 60 ? "review" : "hold",
    details,
    repeatedMemoryId: duplicate?.id || null,
  };
}

export function createPostMemoryRecord(input = {}) {
  const draft = input.draft || {};
  return {
    id: `memory-${Date.now()}-${String(draft.id || "draft").replace(/[^a-z0-9_.-]+/gi, "-")}`,
    sourceId: draft.id || input.sourceId || null,
    sourceType: input.sourceType || "draft",
    context: draft.context,
    text: draft.text || "",
    normalizedText: normalizeText(draft.text),
    language: draft.language || "en",
    status: input.status || draft.status || "draft",
    qualityScore: draft.qualityScore ?? null,
    qualityGate: draft.qualityGate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function findSimilarMemory(draft, memory = []) {
  const text = normalizeText(draft?.text);
  if (!text) return null;
  return memory.find((item) => {
    if (!item?.context || !draft?.context || !contextsMatch(item.context, draft.context)) return false;
    const other = item.normalizedText || normalizeText(item.text);
    return other === text || similarity(other, text) >= 0.82;
  }) || null;
}

function languageText(strategy, key, language) {
  if (language === "es") return strategy[`${key}Es`] || "";
  return strategy[key] || "";
}

function languageMatches(text, language) {
  const value = String(text || "").toLowerCase();
  if (language === "es") return /\b(unete|mundial|gratis|liga|premios|tabla|predicciones|pais)\b/.test(value);
  return !/\b(unete|mundial|premios|tabla|predicciones)\b/.test(value);
}

function containsLoose(text, needle) {
  const haystack = normalizeText(text);
  const value = normalizeText(needle);
  return value && haystack.includes(value);
}

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function similarity(left, right) {
  const a = new Set(left.split(" ").filter(Boolean));
  const b = new Set(right.split(" ").filter(Boolean));
  if (!a.size || !b.size) return 0;
  const overlap = [...a].filter((word) => b.has(word)).length;
  return overlap / Math.max(a.size, b.size);
}
