import {
  requestVideoGeneration,
  generateVideoWithHeyGen,
  pollVideoGeneration,
  updatePostDraftWithVideoResult,
} from "./video-generation-worker.js";

export async function integrateVideoGenerationIntoPostCreation(postPackage, postDraft, campaign, config = {}) {
  if (!campaign?.videoGenerationEnabled) {
    return { ok: false, reason: "Video generation disabled for campaign" };
  }

  const videoGenerationEnabled =
    postDraft.videoGenerationOverride !== null
      ? postDraft.videoGenerationOverride
      : campaign.videoGenerationEnabled;

  if (!videoGenerationEnabled) {
    return { ok: false, reason: "Video generation disabled for post" };
  }

  try {
    const videoRequest = await requestVideoGeneration(postDraft, campaign);
    if (!videoRequest) {
      return { ok: false, reason: "Could not create video request" };
    }

    const generationResult = await generateVideoWithHeyGen(videoRequest, {
      heygenApiKey: config.heygenApiKey || process.env.HEYGEN_API_KEY,
      heygenApiEndpoint: config.heygenApiEndpoint || process.env.HEYGEN_API_ENDPOINT,
      heygenAvatarId: config.heygenAvatarId || process.env.HEYGEN_AVATAR_ID,
      heygenVoiceId: config.heygenVoiceId || process.env.HEYGEN_VOICE_ID,
    });

    if (!generationResult.ok) {
      const updatedDraft = updatePostDraftWithVideoResult(postDraft, {
        status: "failed",
        error: generationResult.error,
      });
      return {
        ok: false,
        reason: generationResult.error?.message || "Failed to generate video",
        updatedDraft,
      };
    }

    postDraft.videoGenerationStatus = "generating";
    postDraft.generatedVideoPrompt = videoRequest.prompt;
    postDraft.videoGenerationAttempts = (postDraft.videoGenerationAttempts || 0) + 1;

    if (config.skipPolling) {
      return {
        ok: true,
        reason: "Video generation started (async)",
        videoId: generationResult.videoId,
        updatedDraft: postDraft,
      };
    }

    const pollResult = await pollVideoGeneration(generationResult.videoId, {
      heygenApiKey: config.heygenApiKey || process.env.HEYGEN_API_KEY,
      heygenApiEndpoint: config.heygenApiEndpoint || process.env.HEYGEN_API_ENDPOINT,
    });

    const finalDraft = updatePostDraftWithVideoResult(postDraft, pollResult);

    return {
      ok: pollResult.ok,
      reason: pollResult.ok ? "Video generated successfully" : pollResult.error?.message,
      videoId: generationResult.videoId,
      updatedDraft: finalDraft,
      videoPollResult: pollResult,
    };
  } catch (error) {
    return {
      ok: false,
      reason: error.message || "Unexpected error during video generation",
      error: error.message,
    };
  }
}

export async function processVideoGenerationForPostPackage(postPackage, drafts, campaigns, config = {}) {
  if (!postPackage || !Array.isArray(drafts)) {
    return { ok: false, reason: "Invalid inputs" };
  }

  const campaign = campaigns?.find((c) => c.id === postPackage.campaignId);
  if (!campaign) {
    return { ok: false, reason: "Campaign not found" };
  }

  const results = [];

  for (const draft of drafts) {
    try {
      const result = await integrateVideoGenerationIntoPostCreation(postPackage, draft, campaign, config);
      results.push({
        draftId: draft.id,
        platform: draft.platform,
        ...result,
      });

      if (result.updatedDraft) {
        Object.assign(draft, result.updatedDraft);
      }
    } catch (error) {
      results.push({
        draftId: draft.id,
        platform: draft.platform,
        ok: false,
        reason: error.message || "Unexpected error",
      });
    }
  }

  return {
    ok: results.every((r) => r.ok),
    results,
    processedAt: new Date().toISOString(),
  };
}
