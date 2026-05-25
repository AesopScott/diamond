// Pure helpers for platform toggle chips and Company→Brand→Campaign scope cascade.
// No DOM, no global state — importable from both the renderer and Node test scripts.
//
// reddit is excluded from TOGGLEABLE_PLATFORMS: it uses a monitoring-first workflow
// and does not support compose-and-stage via Diamond's browser automation.

export const TOGGLEABLE_PLATFORMS = [
  "x", "instagram", "tiktok", "linkedin",
  "youtube-shorts", "youtube-longform", "facebook", "pinterest",
];

/**
 * Given a new companyId, auto-select the first matching brand then the first
 * matching campaign for that brand. Returns { companyId, brandId, campaignId }
 * — all strings, never undefined/null. Empty strings signal "no match" and are
 * safe to write into package context without corrupting unrelated fields.
 */
export function computeCompanyCascade(companyId, brands = [], campaigns = []) {
  const brandId = brands.find((b) => b.companyId === companyId)?.id || "";
  const campaignId = campaigns.find((c) => c.companyId === companyId && c.brandId === brandId)?.id || "";
  return { companyId: companyId || "", brandId, campaignId };
}

/**
 * Given a new brandId within a known companyId, auto-select the first matching campaign.
 * Returns { companyId, brandId, campaignId } — all strings, never undefined/null.
 */
export function computeBrandCascade(companyId, brandId, campaigns = []) {
  const campaignId = campaigns.find((c) => c.companyId === companyId && c.brandId === brandId)?.id || "";
  return { companyId: companyId || "", brandId: brandId || "", campaignId };
}

/**
 * Return a NEW draft object with updated scope fields and generationStatus "needs-attention".
 * Never mutates the input draft. The "needs-attention" status causes platformDraftPreflight
 * to block the draft from staging until it is regenerated after the scope change.
 */
export function applyDraftScope(draft, { companyId, brandId, campaignId }) {
  return {
    ...draft,
    context: {
      ...draft.context,
      companyId: companyId || "",
      brandId: brandId || "",
      campaignId: campaignId || "",
    },
    companyId: companyId || "",
    brandId: brandId || "",
    campaignId: campaignId || "",
    generationStatus: "needs-attention",
  };
}

/**
 * Return true if a draft already exists for (postPackageId, platform).
 */
export function platformDraftExists(drafts = [], postPackageId, platform) {
  return drafts.some((d) => d.postPackageId === postPackageId && d.platform === platform);
}

/**
 * Return a new drafts array with the matching (postPackageId, platform) entry removed.
 * Never mutates the input array.
 */
export function removePlatformDraft(drafts = [], postPackageId, platform) {
  return drafts.filter((d) => !(d.postPackageId === postPackageId && d.platform === platform));
}
