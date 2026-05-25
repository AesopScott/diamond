import { normalizeId } from "./ids.js";
import { VIDEO_SPECS_BY_PLATFORM } from "./constants.js";

export function createCompanyRecord(input = {}) {
  const name = String(input.name || "").trim();
  if (!name) throw new Error("Company name is required");
  return {
    id: normalizeId(input.id || name, "companyId"),
    name,
    defaultApprovalPolicyId: input.defaultApprovalPolicyId || "default-risk-review",
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

export function createBrandRecord(input = {}) {
  const name = String(input.name || "").trim();
  if (!name) throw new Error("Brand name is required");
  if (!input.companyId) throw new Error("Brand companyId is required");
  return {
    id: normalizeId(input.id || name, "brandId"),
    companyId: normalizeId(input.companyId, "companyId"),
    name,
    languages: Array.isArray(input.languages) && input.languages.length ? input.languages : ["en"],
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

export function createCampaignRecord(input = {}) {
  const name = String(input.name || "").trim();
  if (!name) throw new Error("Campaign name is required");
  if (!input.companyId) throw new Error("Campaign companyId is required");
  if (!input.brandId) throw new Error("Campaign brandId is required");
  return {
    id: normalizeId(input.id || name, "campaignId"),
    companyId: normalizeId(input.companyId, "companyId"),
    brandId: normalizeId(input.brandId, "brandId"),
    name,
    status: input.status || "planning",
    postTags: Array.isArray(input.postTags)
      ? [...new Set(input.postTags.map((t) => String(t).trim().toLowerCase()).filter(Boolean))]
      : [],
    videoGenerationEnabled: input.videoGenerationEnabled || false,
    videoGenerationPlatforms: input.videoGenerationPlatforms || { ...VIDEO_SPECS_BY_PLATFORM },
    videoQualitySize: input.videoQualitySize || "high",
    videoPromptGuidance: input.videoPromptGuidance || "",
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

