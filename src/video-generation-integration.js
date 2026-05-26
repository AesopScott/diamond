import {
  requestVideoGeneration,
  generateVideo,
  pollProviderVideoGeneration,
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

    const provider = config.provider || videoRequest.provider || "heygen";
    const generationResult = await generateVideo(videoRequest, {
      provider,
      heygenApiKey: configValue(config, "heygenApiKey", "HEYGEN_API_KEY"),
      heygenApiEndpoint: configValue(config, "heygenApiEndpoint", "HEYGEN_API_ENDPOINT"),
      heygenAvatarId: configValue(config, "heygenAvatarId", "HEYGEN_AVATAR_ID"),
      heygenVoiceId: configValue(config, "heygenVoiceId", "HEYGEN_VOICE_ID"),
      klingToken: configValue(config, "klingToken", "KLING_TOKEN"),
      klingApiEndpoint: configValue(config, "klingApiEndpoint", "KLING_API_ENDPOINT"),
      klingModel: configValue(config, "klingModel", "KLING_MODEL"),
      klingEnableAudio: config.klingEnableAudio,
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
        provider,
        updatedDraft: workingDraft,
      };
    }

    const pollResult = await pollProviderVideoGeneration(generationResult.videoId, {
      provider,
      heygenApiKey: configValue(config, "heygenApiKey", "HEYGEN_API_KEY"),
      heygenApiEndpoint: configValue(config, "heygenApiEndpoint", "HEYGEN_API_ENDPOINT"),
      klingToken: configValue(config, "klingToken", "KLING_TOKEN"),
      klingApiEndpoint: configValue(config, "klingApiEndpoint", "KLING_API_ENDPOINT"),
    });

    const finalDraft = updatePostDraftWithVideoResult(workingDraft, pollResult);

    // Unit 10: trigger email notification after 3 failed attempts
    if (!pollResult.ok && finalDraft.videoGenerationAttempts >= 3) {
      const notificationPayload = buildVideoErrorNotificationPayload(postPackage, finalDraft);
      if (notificationPayload) {
        await sendVideoErrorNotification(notificationPayload, {
          service: config.notificationService || envValue("NOTIFICATION_EMAIL_SERVICE"),
          sendgridApiKey: config.sendgridApiKey || envValue("SENDGRID_API_KEY"),
        });
      }
    }

    return {
      ok: pollResult.ok,
      reason: pollResult.ok ? "Video generated successfully" : pollResult.error?.message,
      videoId: generationResult.videoId,
      provider,
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

function envValue(key) {
  return typeof process !== "undefined" ? process.env?.[key] : undefined;
}

function configValue(config, key, envKey) {
  return Object.prototype.hasOwnProperty.call(config, key) ? config[key] : envValue(envKey);
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
