import { getPlatformBrowserAdapter } from "./platform-browser-adapter.js";

export function createPlatformProofRecord(input = {}) {
  const adapter = input.adapter || getPlatformBrowserAdapter(input.platform);
  const now = input.createdAt || new Date().toISOString();
  return {
    id: platformProofId(input),
    companyId: input.companyId,
    brandId: input.brandId,
    platform: input.platform,
    socialAccountId: input.socialAccountId,
    stageMode: adapter.stageMode,
    textProofCount: whole(input.textProofCount),
    mediaProofCount: whole(input.mediaProofCount),
    manualProofCount: whole(input.manualProofCount),
    lastProofAt: input.lastProofAt || null,
    notes: input.notes || adapter.note || "",
    createdAt: now,
    updatedAt: input.updatedAt || now,
  };
}

export function ensurePlatformProofRecords(workspace = {}) {
  const next = structuredClone(workspace);
  next.platformProofs ||= [];
  (next.socialAccounts || []).forEach((account) => {
    const id = platformProofId({
      companyId: account.companyId,
      brandId: account.brandId,
      platform: account.platform,
      socialAccountId: account.id,
    });
    if (!next.platformProofs.some((proof) => proof.id === id)) {
      next.platformProofs.push(createPlatformProofRecord({
        companyId: account.companyId,
        brandId: account.brandId,
        platform: account.platform,
        socialAccountId: account.id,
      }));
    }
  });
  return next;
}

export function markPlatformProof(proof, type = "manual", notes = "") {
  const next = createPlatformProofRecord(proof);
  if (type === "text") next.textProofCount += 1;
  if (type === "media") next.mediaProofCount += 1;
  if (type === "manual") next.manualProofCount += 1;
  next.lastProofAt = new Date().toISOString();
  next.updatedAt = next.lastProofAt;
  if (notes) next.notes = notes;
  return next;
}

export function evaluatePlatformProof(proof = {}, adapter = getPlatformBrowserAdapter(proof.platform)) {
  const record = createPlatformProofRecord({ ...proof, adapter });
  if (adapter.stageMode === "monitoring_only") {
    return {
      status: "monitoring_only",
      label: "Monitoring only",
      ok: true,
      summary: "No publishing proof required. Use this platform for monitoring and reply capture.",
    };
  }
  if (adapter.stageMode === "manual") {
    const ok = record.manualProofCount >= 3;
    return {
      status: ok ? "manual_proven" : "manual_needs_proof",
      label: ok ? "Manual proven" : "Manual proof needed",
      ok,
      summary: `Manual staging proof ${record.manualProofCount}/3.`,
    };
  }
  const ok = record.textProofCount >= 3 && record.mediaProofCount >= 1;
  return {
    status: ok ? "assisted_proven" : "needs_proof",
    label: ok ? "Assisted proven" : "Proof needed",
    ok,
    summary: `Text proof ${record.textProofCount}/3. Media proof ${record.mediaProofCount}/1.`,
  };
}

export function platformProofId(input = {}) {
  return [
    "proof",
    input.companyId,
    input.brandId,
    input.platform,
    input.socialAccountId,
  ].filter(Boolean).join("-").replace(/[^a-z0-9_.-]+/gi, "-").toLowerCase();
}

function whole(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.trunc(number) : 0;
}
