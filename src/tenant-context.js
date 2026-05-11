import { PLATFORMS, POSTING_MODES } from "./constants.js";
import { normalizeId } from "./ids.js";

const REQUIRED_CONTEXT_KEYS = Object.freeze([
  "companyId",
  "brandId",
  "platform",
  "socialAccountId",
  "campaignId",
  "approvalPolicyId",
  "browserProfileId",
]);

export function createTenantContext(input) {
  const context = {
    companyId: normalizeId(input.companyId, "companyId"),
    brandId: normalizeId(input.brandId, "brandId"),
    platform: normalizeId(input.platform, "platform"),
    socialAccountId: normalizeId(input.socialAccountId, "socialAccountId"),
    campaignId: normalizeId(input.campaignId, "campaignId"),
    approvalPolicyId: normalizeId(input.approvalPolicyId, "approvalPolicyId"),
    browserProfileId: normalizeId(input.browserProfileId, "browserProfileId"),
    postingMode: input.postingMode || "stage_for_review",
  };

  if (!PLATFORMS.includes(context.platform)) {
    throw new Error(`Unsupported platform: ${context.platform}`);
  }
  if (!POSTING_MODES.includes(context.postingMode)) {
    throw new Error(`Unsupported posting mode: ${context.postingMode}`);
  }

  return context;
}

export function missingTenantContextKeys(input) {
  return REQUIRED_CONTEXT_KEYS.filter((key) => !input || !input[key]);
}

export function assertTenantContext(input) {
  const missing = missingTenantContextKeys(input);
  if (missing.length) {
    throw new Error(`Missing tenant context: ${missing.join(", ")}`);
  }
  return createTenantContext(input);
}

export function companyPath(context, ...segments) {
  const safe = assertTenantContext(context);
  return [
    "companies",
    safe.companyId,
    "brands",
    safe.brandId,
    ...segments.filter(Boolean).map((segment) => normalizeId(String(segment), "path segment")),
  ];
}

export function browserProfilePath(context) {
  const safe = assertTenantContext(context);
  return [
    "browser-profiles",
    safe.companyId,
    safe.platform,
    safe.socialAccountId,
    safe.browserProfileId,
  ].join("/");
}

export function contextsMatch(left, right) {
  const a = assertTenantContext(left);
  const b = assertTenantContext(right);
  return REQUIRED_CONTEXT_KEYS.every((key) => a[key] === b[key]);
}
