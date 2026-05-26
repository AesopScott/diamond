import {
  requestVideoGeneration,
  generateVideoWithHeyGen,
  pollVideoGeneration,
  updatePostDraftWithVideoResult,
} from "./video-generation-worker.js";
import {
  buildVideoErrorNotificationPayload,
  sendVideoErrorNotification,
} from "./video-error-handler.js";

export async function integrateVideoGenerationIntoPostCreation(postPackage, postDraft, campaign, config = {}) {
  const videoGenerationEnabled =
    postDraft.videoGenerationOverride != null
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

    // Attempt counting is owned entirely by updatePostDraftWithVideoResult —
    // do not increment here to avoid double-counting on failure paths.
    const workingDraft = {
      ...postDraft,
      videoGenerationStatus: "generating",
      generatedVideoPrompt: videoRequest.prompt,
    };

    if (config.skipPolling) {
      return {
        ok: true,
        reason: "Video generation started (async)",
        videoId: generationResult.videoId,
        updatedDraft: workingDraft,
      };
    }

    const pollResult = await pollVideoGeneration(generationResult.videoId, {
      heygenApiKey: config.heygenApiKey || process.env.HEYGEN_API_KEY,
      heygenApiEndpoint: config.heygenApiEndpoint || process.env.HEYGEN_API_ENDPOINT,
    });

    const finalDraft = updatePostDraftWithVideoResult(workingDraft, pollResult);

    // Unit 10: trigger email notification after 3 failed attempts
    if (!pollResult.ok && finalDraft.videoGenerationAttempts >= 3) {
      const notificationPayload = buildVideoErrorNotificationPayload(postPackage, finalDraft);
      if (notificationPayload) {
        await sendVideoErrorNotification(notificationPayload, {
          service: config.notificationService || process.env.NOTIFICATION_EMAIL_SERVICE,
          sendgridApiKey: config.sendgridApiKey || process.env.SENDGRID_API_KEY,
        });
      }
    }

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

      // updatedDraft is returned in results — callers should read results[i].updatedDraft
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
