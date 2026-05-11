import { assertTenantContext, companyPath } from "./tenant-context.js";
import { approvalLevelForText } from "./risk.js";
import { normalizeId } from "./ids.js";

export function createPostDraft(input) {
  const context = assertTenantContext(input.context);
  const text = String(input.text || "").trim();
  if (!text) throw new Error("Draft text is required");

  const evaluation = approvalLevelForText(text, {
    ...input.approvalPolicy,
    brandLibrary: input.brandLibrary,
    claimLibrary: input.claimLibrary,
  });
  const now = new Date().toISOString();
  const draftId = normalizeId(input.draftId || `${context.platform}-${Date.now()}`, "draftId");

  return {
    id: draftId,
    context,
    platform: context.platform,
    text,
    language: input.language || "en",
    media: Array.isArray(input.media) ? input.media : [],
    status: evaluation.level === "blocked" ? "blocked" : "draft",
    approvalLevel: evaluation.level,
    riskFlags: evaluation.flags,
    riskDetails: evaluation.details || [],
    firestorePath: companyPath(context, "postDrafts", draftId).join("/"),
    createdAt: now,
    updatedAt: now,
  };
}

export function canStageDraft(draft, options = {}) {
  if (!draft) return { ok: false, reason: "Missing draft" };
  if (draft.status === "blocked") return { ok: false, reason: "Draft is blocked" };
  if (draft.approvalLevel === "review_required" && !["approved", "staged"].includes(draft.status)) {
    return { ok: false, reason: "Review required before staging" };
  }
  if (draft.context.postingMode === "draft_only") {
    return { ok: false, reason: "Posting mode is draft_only" };
  }
  if (options.sessionCheck && !options.sessionCheck.ok) {
    return { ok: false, reason: options.sessionCheck.reason };
  }
  return { ok: true, reason: "Draft can be staged" };
}
