// Image generation integration — wires campaign + post draft settings to Replicate / Flux Pro
// Mirror of video-generation-integration.js; same error contract, different service

import { generateImageViaReplicate, createReplicateImageMetadata } from "./replicate-image-service.js";
import { formatErrorForUI as formatImageGenerationError } from "./image-generation-error-handler.js";
import { createImageCostRecord, logImageCost } from "./image-generation-cost-tracker.js";

/**
 * Determine whether image generation is enabled for a given draft, applying the
 * campaign-level default and the per-post override.
 *
 * Override semantics:
 *   - draft.imageGenerationEnabled === null | undefined  → "inherit"
 *   - draft.imageGenerationEnabled === true              → explicitly enabled for this post
 *   - draft.imageGenerationEnabled === false             → explicitly disabled for this post
 *
 * When inheriting (null), the platform-level enabled flag from
 * campaign.imageGenerationPlatforms[platform] is consulted if a platform is
 * supplied; otherwise the campaign master flag is used as the fallback.
 *
 * @param {object}      draft    - platform draft (has imageGenerationEnabled field)
 * @param {object|null} campaign - campaign record (has imageGenerationEnabled master flag)
 * @param {string}      [platform] - optional platform key for null/inherit resolution
 */
export function resolveImageGenerationEnabled(draft, campaign, platform) {
  if (!campaign?.imageGenerationEnabled) return false;
  // Per-post override: explicit true/false short-circuits platform-level check
  if (draft.imageGenerationEnabled !== null && draft.imageGenerationEnabled !== undefined) {
    return Boolean(draft.imageGenerationEnabled);
  }
  // null = inherit: use the campaign platform-level setting if available
  if (platform && campaign.imageGenerationPlatforms) {
    const platformSpec = campaign.imageGenerationPlatforms[platform];
    if (platformSpec !== undefined) {
      return Boolean(platformSpec.enabled);
    }
  }
  // No platform spec — fall back to campaign master flag
  return Boolean(campaign.imageGenerationEnabled);
}

/**
 * Build the image prompt for a draft.
 * Priority: per-post override → campaign guidance → post text.
 * The post override fully replaces the campaign guidance when set.
 * The post text is appended as context in both cases.
 */
export function buildImagePrompt(draft, campaign) {
  const postOverride = draft.imagePromptOverride?.trim() || "";
  const campaignGuidance = campaign?.imagePromptGuidance?.trim() || "";
  const guidance = postOverride || campaignGuidance;
  const postText = draft.text?.trim() || "";
  if (guidance && postText) return `${guidance}\n\nPost: ${postText}`;
  return guidance || postText;
}

/**
 * Integrate image generation into post creation.
 * Returns { ok, reason, imageUrl, metadata, updatedDraft } — same shape as
 * video-generation-integration for consistency in callers.
 *
 * @param {object} postPackage  — the parent post package (used for cost tracking)
 * @param {object} postDraft    — the platform draft being generated
 * @param {object} campaign     — the campaign record with imageGenerationEnabled etc.
 * @param {object} config       — optional overrides { replicateApiKey, skipGeneration }
 */
export async function integrateImageGenerationIntoPostCreation(postPackage, postDraft, campaign, config = {}) {
  if (!campaign?.imageGenerationEnabled) {
    return { ok: false, reason: "Image generation disabled for campaign" };
  }

  // Derive platform key before the resolver so it can consult per-platform spec for null/inherit
  const platformKey = postDraft.platform?.replace("-shorts", "").replace("-longform", "") || "";

  const enabled = resolveImageGenerationEnabled(postDraft, campaign, platformKey);
  if (!enabled) {
    return { ok: false, reason: `Image generation disabled for this post or platform ${postDraft.platform}` };
  }

  // Defensive gate: also block if the platform spec explicitly disables generation, regardless
  // of per-post override. Keeps platform-level as an operator constraint that can't be bypassed.
  const platformSpec = campaign.imageGenerationPlatforms?.[platformKey];
  if (platformSpec && !platformSpec.enabled && postDraft.imageGenerationEnabled === true) {
    return { ok: false, reason: `Image generation disabled for platform ${postDraft.platform}` };
  }

  const prompt = buildImagePrompt(postDraft, campaign);
  if (!prompt) {
    return { ok: false, reason: "No image prompt available — add post text or campaign image guidance" };
  }

  const apiKey = config.replicateApiKey || (typeof process !== "undefined" ? process.env.REPLICATE_API_KEY : undefined);
  if (!apiKey) {
    return { ok: false, reason: "REPLICATE_API_KEY not configured" };
  }

  // skipGeneration is used in tests to short-circuit the real API call
  if (config.skipGeneration) {
    return { ok: true, reason: "skipped (test mode)", imageUrl: null, updatedDraft: postDraft };
  }

  try {
    const result = await generateImageViaReplicate({
      prompt,
      platform: platformKey || "x",
      apiKey,
    });

    if (!result.ok) {
      // result.error may be a string from generateImageViaReplicate — wrap it in a proper
      // error object so formatErrorForUI can match on .code / .reason correctly.
      const rawError = result.error;
      const errorObj = typeof rawError === "string"
        ? { code: "replicate_api_error", message: rawError, reason: "replicate_api_error" }
        : (rawError || { code: "replicate_api_error" });
      const errorDetails = formatImageGenerationError(errorObj);
      const updatedDraft = {
        ...postDraft,
        imageGenerationStatus: "failed",
        imageGenerationError: errorDetails.message,
      };
      return {
        ok: false,
        reason: errorDetails.message,
        errorDetails,
        updatedDraft,
      };
    }

    const metadata = createReplicateImageMetadata({
      imageUrl: result.imageUrl,
      prompt,
      platform: platformKey,
      cost: result.cost,
      predictionId: result.predictionId,
    });

    // Record cost for the campaign — log to console so the entry is durable in the
    // Electron main-process log stream. Firestore cost aggregation is deferred (follow-on task).
    if (result.cost > 0) {
      const costRecord = createImageCostRecord({
        campaignId: postPackage.campaignId || postDraft.campaignId,
        postId: postDraft.id,
        platform: postDraft.platform,
        cost: result.cost,
        predictTime: result.predictTime,
        imageId: result.predictionId,
      });
      const logEntry = logImageCost(costRecord);
      console.info("[image-gen] cost:", JSON.stringify(logEntry));
    }

    const updatedDraft = {
      ...postDraft,
      imageGenerationStatus: "complete",
      generatedImageUrl: result.imageUrl,
      generatedImageMetadata: metadata,
      imageGenerationError: null,
    };

    return {
      ok: true,
      reason: "Image generated successfully",
      imageUrl: result.imageUrl,
      metadata,
      updatedDraft,
    };
  } catch (err) {
    const updatedDraft = {
      ...postDraft,
      imageGenerationStatus: "failed",
      imageGenerationError: err.message || "Unexpected error during image generation",
    };
    return {
      ok: false,
      reason: err.message || "Unexpected error during image generation",
      updatedDraft,
    };
  }
}
