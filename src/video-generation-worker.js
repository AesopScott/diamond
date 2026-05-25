import { VIDEO_SPECS_BY_PLATFORM } from "./constants.js";

export async function requestVideoGeneration(postDraft, campaign, options = {}) {
  if (!postDraft || !campaign) return null;

  const videoGenerationEnabled =
    postDraft.videoGenerationOverride !== null
      ? postDraft.videoGenerationOverride
      : campaign.videoGenerationEnabled;

  if (!videoGenerationEnabled) return null;

  const prompt = postDraft.videoGenerationPrompt || campaign.videoPromptGuidance || postDraft.text;
  const qualitySize = postDraft.videoQualitySizeOverride || campaign.videoQualitySize || "high";
  const heygenQuality = HEYGEN_QUALITY_MAP[qualitySize] || "hd";

  const platform = postDraft.platform || null;
  const platformConfig =
    (platform && campaign.videoGenerationPlatforms?.[platform]) ||
    (platform && VIDEO_SPECS_BY_PLATFORM[platform]) ||
    null;
  const duration = platformConfig?.videoDurationSeconds ?? 30;

  const videoRequest = {
    prompt,
    quality: heygenQuality,
    duration,
    platform,
    postDraftId: postDraft.id,
    campaignId: campaign.id,
    createdAt: new Date().toISOString(),
  };

  return videoRequest;
}

export async function generateVideoWithHeyGen(videoRequest, config = {}) {
  const apiKey = config.heygenApiKey || process.env.HEYGEN_API_KEY;
  const apiEndpoint = config.heygenApiEndpoint || process.env.HEYGEN_API_ENDPOINT || "https://api.heygen.com/v1";

  if (!apiKey) {
    return {
      ok: false,
      status: "failed",
      error: { code: "missing_api_key", message: "HEYGEN_API_KEY not configured" },
    };
  }

  try {
    const response = await fetch(`${apiEndpoint}/video/generate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: videoRequest.prompt,
        quality: videoRequest.quality,
        duration: videoRequest.duration,
        avatar_id: config.heygenAvatarId || process.env.HEYGEN_AVATAR_ID || "default",
        voice_id: config.heygenVoiceId || process.env.HEYGEN_VOICE_ID || "en-us-1",
        platform: videoRequest.platform || "social_media",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        ok: false,
        status: "failed",
        statusCode: response.status,
        error: {
          code: errorData.error?.code || "api_error",
          message: errorData.error?.message || `HeyGen API error: ${response.status}`,
          retryable: response.status === 429 || response.status === 503,
        },
      };
    }

    const data = await response.json();
    return {
      ok: true,
      status: data.status || "pending",
      videoId: data.video_id,
      creditsUsed: data.credits_used || 0,
      createdAt: data.created_at,
    };
  } catch (error) {
    return {
      ok: false,
      status: "failed",
      error: {
        code: "request_error",
        message: error.message || "Failed to request video generation",
        retryable: true,
      },
    };
  }
}

export async function pollVideoGeneration(videoId, config = {}, options = {}) {
  const apiKey = config.heygenApiKey || process.env.HEYGEN_API_KEY;
  const apiEndpoint = config.heygenApiEndpoint || process.env.HEYGEN_API_ENDPOINT || "https://api.heygen.com/v1";
  const maxWaitMs = options.maxWaitMs || 300000;
  const pollIntervalMs = options.pollIntervalMs || 2000;

  if (!apiKey || !videoId) {
    return {
      ok: false,
      status: "failed",
      error: { code: "invalid_params", message: "API key and video ID required" },
    };
  }

  const startTime = Date.now();
  let lastError = null;

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const response = await fetch(`${apiEndpoint}/video/${videoId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        lastError = {
          code: errorData.error?.code || "api_error",
          message: errorData.error?.message || `HeyGen API error: ${response.status}`,
          retryable: response.status === 429 || response.status === 503,
        };
        if (!lastError.retryable) {
          return { ok: false, status: "failed", error: lastError };
        }
      } else {
        const data = await response.json();
        if (data.status === "completed") {
          return {
            ok: true,
            status: "completed",
            videoId: data.video_id,
            videoUrl: data.video_url,
            creditsUsed: data.credits_used,
            durationSeconds: data.duration_seconds,
            expiresAt: data.expires_at,
          };
        }
        if (data.status === "failed") {
          return {
            ok: false,
            status: "failed",
            error: { code: "generation_failed", message: data.error?.message || "Video generation failed" },
          };
        }
      }
    } catch (error) {
      lastError = {
        code: "request_error",
        message: error.message || "Failed to poll video status",
        retryable: true,
      };
    }

    await sleep(pollIntervalMs);
  }

  return {
    ok: false,
    status: "timeout",
    error: {
      code: "timeout",
      message: `Video generation timeout after ${maxWaitMs}ms`,
      retryable: true,
    },
  };
}

export function updatePostDraftWithVideoResult(postDraft, result) {
  if (!postDraft || !result) return postDraft;

  const updated = { ...postDraft };

  if (result.status === "completed") {
    updated.generatedVideoUrl = result.videoUrl;
    updated.videoGenerationStatus = "success";
    updated.videoDurationSeconds = result.durationSeconds || 0;
    updated.videoGenerationCost = result.creditsUsed || 0;
    updated.videoGenerationError = null;
    updated.videoGenerationRetryable = false;
  } else if (result.status === "timeout" || result.status === "failed") {
    updated.videoGenerationStatus = result.status === "timeout" ? "failed" : "failed";
    updated.videoGenerationError = result.error || null;
    updated.videoGenerationRetryable = result.error?.retryable !== false;
    updated.videoGenerationAttempts = (updated.videoGenerationAttempts || 0) + 1;
  } else {
    updated.videoGenerationStatus = result.status;
  }

  updated.updatedAt = new Date().toISOString();
  return updated;
}

const HEYGEN_QUALITY_MAP = {
  low: "standard",
  medium: "hd",
  high: "uhd",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
