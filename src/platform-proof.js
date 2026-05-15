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
    loginProofCount: whole(input.loginProofCount),
    stagingProofSessions: normalizeStagingProofSessions(input.stagingProofSessions),
    lastLoginProofAt: input.lastLoginProofAt || null,
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

export function markPlatformLoginProof(proof, notes = "") {
  const next = createPlatformProofRecord(proof);
  next.loginProofCount += 1;
  next.lastLoginProofAt = new Date().toISOString();
  next.updatedAt = next.lastLoginProofAt;
  if (notes) next.notes = notes;
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

export function markPlatformProofFromStage(proof, input = {}) {
  let next = createPlatformProofRecord(proof);
  const fillResult = input.fillResult || {};
  const mediaResult = input.mediaResult || {};
  const hasMedia = Boolean(input.hasMedia);
  const notes = [];
  if (fillResult.ok) {
    next = markPlatformProof(next, "text");
    notes.push("Text insertion proof recorded from staging.");
  } else if (fillResult.manual) {
    next = markPlatformProof(next, "manual");
    notes.push("Manual staging proof recorded from staging.");
  }
  if (hasMedia && mediaResult.ok) {
    next = markPlatformProof(next, "media");
    notes.push("Media picker proof recorded from staging.");
  }
  if (notes.length) {
    next.notes = notes.join(" ");
    next.updatedAt = next.lastProofAt || new Date().toISOString();
  }
  if (input.appSessionId || input.stageUrl || input.screenshotPath || input.draftId) {
    next = recordPlatformStagingProofSession(next, {
      ...input,
      ok: Boolean(input.ok ?? fillResult.ok ?? input.stageUrl ?? input.screenshotPath),
      notes: notes.join(" ") || input.notes || "",
    });
  }
  return {
    proof: next,
    changed: notes.length > 0 || Boolean(input.appSessionId || input.stageUrl || input.screenshotPath || input.draftId),
    notes,
  };
}

export function recordPlatformStagingProofSession(proof, input = {}) {
  const next = createPlatformProofRecord(proof);
  const createdAt = input.createdAt || new Date().toISOString();
  const appSessionId = input.appSessionId || `session-${createdAt}`;
  const record = {
    id: input.id || `staging-proof-${createdAt.replace(/[^0-9a-z]+/gi, "-")}-${next.platform || "platform"}`,
    appSessionId,
    platform: next.platform,
    companyId: next.companyId,
    brandId: next.brandId,
    socialAccountId: next.socialAccountId,
    draftId: input.draftId || "",
    postPackageId: input.postPackageId || "",
    stageUrl: input.stageUrl || input.platformUrl || "",
    screenshotPath: input.screenshotPath || "",
    status: input.status || (input.ok ? "staged" : "needs_review"),
    ok: Boolean(input.ok),
    notes: input.notes || "",
    createdAt,
  };
  const existingIndex = next.stagingProofSessions.findIndex((session) => session.appSessionId === appSessionId && session.draftId === record.draftId);
  if (existingIndex >= 0) next.stagingProofSessions[existingIndex] = { ...next.stagingProofSessions[existingIndex], ...record };
  else next.stagingProofSessions.unshift(record);
  next.stagingProofSessions = next.stagingProofSessions.slice(0, 12);
  next.lastProofAt = createdAt;
  next.updatedAt = createdAt;
  if (record.notes) next.notes = record.notes;
  return next;
}

export function stagingProofSessionProgress(proof = {}, required = 3) {
  const sessions = normalizeStagingProofSessions(proof.stagingProofSessions)
    .filter((session) => session.ok && session.appSessionId);
  const unique = [];
  const seen = new Set();
  sessions.forEach((session) => {
    if (seen.has(session.appSessionId)) return;
    seen.add(session.appSessionId);
    unique.push(session);
  });
  return {
    count: unique.length,
    required,
    complete: unique.length >= required,
    sessions: unique,
    label: `${platformDisplay(proof.platform)} staging proof ${Math.min(unique.length, required)}/${required}`,
  };
}

export function evaluatePlatformProof(proof = {}, adapter = getPlatformBrowserAdapter(proof.platform)) {
  const record = createPlatformProofRecord({ ...proof, adapter });
  if (adapter.stageMode === "monitoring_only") {
    return {
      status: "monitoring_only",
      label: "Monitoring only",
      ok: true,
      summary: "No publishing proof required. Use this platform for monitoring and reply capture.",
      loginSummary: `Login proof ${record.loginProofCount}/1.`,
    };
  }
  if (adapter.stageMode === "manual") {
    const ok = record.manualProofCount >= 3;
    return {
      status: ok ? "manual_proven" : "manual_needs_proof",
      label: ok ? "Manual proven" : "Manual proof needed",
      ok,
      summary: `Manual staging proof ${record.manualProofCount}/3.`,
      loginSummary: `Login proof ${record.loginProofCount}/1.`,
    };
  }
  const ok = record.textProofCount >= 3 && record.mediaProofCount >= 1;
  const stagingProgress = stagingProofSessionProgress(record);
  return {
    status: ok && stagingProgress.complete ? "assisted_proven" : "needs_proof",
    label: ok ? "Assisted proven" : "Proof needed",
    ok: ok && stagingProgress.complete,
    summary: `Text proof ${record.textProofCount}/3. Media proof ${record.mediaProofCount}/1. ${stagingProgress.label}.`,
    loginSummary: `Login proof ${record.loginProofCount}/1.`,
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

function normalizeStagingProofSessions(value) {
  return Array.isArray(value) ? value.filter(Boolean).map((session) => ({
    id: session.id || "",
    appSessionId: session.appSessionId || "",
    platform: session.platform || "",
    companyId: session.companyId || "",
    brandId: session.brandId || "",
    socialAccountId: session.socialAccountId || "",
    draftId: session.draftId || "",
    postPackageId: session.postPackageId || "",
    stageUrl: session.stageUrl || session.platformUrl || "",
    screenshotPath: session.screenshotPath || "",
    status: session.status || "",
    ok: Boolean(session.ok),
    notes: session.notes || "",
    createdAt: session.createdAt || "",
  })) : [];
}

function platformDisplay(platform) {
  if (platform === "x") return "X";
  if (!platform) return "Platform";
  return String(platform).replace(/(^|-)(\w)/g, (_match, separator, letter) => `${separator ? " " : ""}${letter.toUpperCase()}`);
}
