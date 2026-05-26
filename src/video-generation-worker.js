import { VIDEO_SPECS_BY_PLATFORM } from "./constants.js";

/**
 * Resolve a Bearer token from config.
 * The main process (main.cjs) generates the JWT and passes it as klingToken.
 * Falls back to a plain klingApiKey for legacy/proxy setups.
 */
function resolveKlingToken(config) {
  return configValue(config, "klingToken", "KLING_TOKEN")
    || configValue(config, "klingApiKey", "KLING_API_KEY")
    || null;
}

export async function requestVideoGeneration(postDraft, campaign, options = {}) {
  if (!postDraft || !campaign) return null;

  const videoGenerationEnabled =
    postDraft.videoGenerationOverride != null
      ? postDraft.videoGenerationOverride
      : campaign.videoGenerationEnabled;

  if (!videoGenerationEnabled) return null;

  const prompt = postDraft.videoGenerationPrompt || campaign.videoPromptGuidance || postDraft.text;
  const qualitySize = postDraft.videoQualitySizeOverride || campaign.videoQualitySize || "high";
  const heygenQuality = HEYGEN_QUALITY_MAP[qualitySize] || "hd";
  const klingMode = KLING_QUALITY_MODE_MAP[qualitySize] || "professional";

  const platform = postDraft.platform || null;
  const platformConfig =
    (platform && campaign.videoGenerationPlatforms?.[platform]) ||
    (platform && VIDEO_SPECS_BY_PLATFORM[platform]) ||
    null;
  const duration = platformConfig?.videoDurationSeconds ?? 30;
  const aspectRatio = platformConfig?.aspectRatio || "16:9";
  const provider = postDraft.videoGenerationProvider || campaign.videoGenerationProvider || options.provider || "heygen";

  const videoRequest = {
    prompt,
    provider,
    quality: heygenQuality,
    qualitySize,
    klingMode,
    duration,
    aspectRatio,
    platform,
    postDraftId: postDraft.id,
    campaignId: campaign.id,
    createdAt: new Date().toISOString(),
  };

  return videoRequest;
}

export async function generateVideo(videoRequest, config = {}) {
  const provider = normalizeVideoProvider(config.provider || videoRequest?.provider);
  if (provider === "kling") return generateVideoWithKling(videoRequest, config);
  return generateVideoWithHeyGen(videoRequest, config);
}

export async function generateVideoWithHeyGen(videoRequest, config = {}) {
  const apiKey = configValue(config, "heygenApiKey", "HEYGEN_API_KEY");
  const apiEndpoint = configValue(config, "heygenApiEndpoint", "HEYGEN_API_ENDPOINT") || "https://api.heygen.com/v2";

  if (!apiKey) {
    return {
      ok: false,
      status: "failed",
      error: { code: "missing_api_key", message: "HEYGEN_API_KEY not configured" },
    };
  }

  const avatarId = config.heygenAvatarId || envValue("HEYGEN_AVATAR_ID") || "default";
  const voiceId = config.heygenVoiceId || envValue("HEYGEN_VOICE_ID") || "en-us-1";
  const aspectRatio = normalizeHeyGenAspectRatio(videoRequest.aspectRatio);

  try {
    const response = await fetch(`${apiEndpoint}/video/generate`, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_inputs: [{
          character: {
            type: "avatar",
            avatar_id: avatarId,
            avatar_style: "normal",
          },
          voice: {
            type: "text",
            input_text: videoRequest.prompt,
            voice_id: voiceId,
          },
        }],
        test: false,
        aspect_ratio: aspectRatio,
        caption: false,
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

export async function generateVideoWithKling(videoRequest, config = {}) {
  const token = resolveKlingToken(config);
  const apiEndpoint = configValue(config, "klingApiEndpoint", "KLING_API_ENDPOINT") || "https://api.klingai.com/v1";

  if (!token) {
    return {
      ok: false,
      status: "failed",
      error: { code: "missing_api_key", message: "Kling token not configured" },
    };
  }

  const duration = normalizeKlingDuration(videoRequest.duration);
  const body = {
    model: config.klingModel || envValue("KLING_MODEL") || "kling-v2.6-pro",
    prompt: videoRequest.prompt,
    duration,
    aspect_ratio: normalizeKlingAspectRatio(videoRequest.aspectRatio),
    mode: config.klingMode || videoRequest.klingMode || "pro",
  };

  const negativePrompt = config.klingNegativePrompt || envValue("KLING_NEGATIVE_PROMPT");
  if (negativePrompt) body.negative_prompt = negativePrompt;
  if (config.klingEnableAudio != null) body.sound = Boolean(config.klingEnableAudio);
  if (config.klingImageUrl || videoRequest.imageUrl) body.image_url = config.klingImageUrl || videoRequest.imageUrl;

  try {
    const response = await fetch(`${apiEndpoint}/videos/text2video`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        ok: false,
        status: "failed",
        statusCode: response.status,
        error: {
          code: errorData.error?.code || errorData.code || "api_error",
          message: errorData.error?.message || errorData.message || `Kling API error: ${response.status}`,
          retryable: response.status === 429 || response.status === 503,
        },
      };
    }

    const data = await response.json();
    const taskId = data.task_id || data.taskId || data.id || data.data?.task_id || data.data?.id;
    return {
      ok: true,
      status: normalizeProviderStatus(data.status || data.data?.status || "pending"),
      videoId: taskId,
      provider: "kling",
      creditsUsed: data.credits_used || data.data?.credits_used || 0,
      createdAt: data.created_at || data.data?.created_at,
    };
  } catch (error) {
    return {
      ok: false,
      status: "failed",
      error: {
        code: "request_error",
        message: error.message || "Failed to request Kling video generation",
        retryable: true,
      },
    };
  }
}

export async function pollProviderVideoGeneration(videoId, config = {}, options = {}) {
  const provider = normalizeVideoProvider(config.provider);
  if (provider === "kling") return pollKlingVideoGeneration(videoId, config, options);
  return pollVideoGeneration(videoId, config, options);
}

export async function pollVideoGeneration(videoId, config = {}, options = {}) {
  const apiKey = configValue(config, "heygenApiKey", "HEYGEN_API_KEY");
  const apiEndpoint = configValue(config, "heygenApiEndpoint", "HEYGEN_API_ENDPOINT") || "https://api.heygen.com/v2";
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
      const response = await fetch(`https://api.heygen.com/v1/video.status.get?video_id=${encodeURIComponent(videoId)}`, {
        method: "GET",
        headers: {
          "X-Api-Key": apiKey,
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
        const payload = data.data || data;
        const status = (payload.status || "").toLowerCase();
        if (status === "completed") {
          return {
            ok: true,
            status: "completed",
            videoId: payload.video_id || videoId,
            videoUrl: payload.video_url,
            creditsUsed: payload.credits_used,
            durationSeconds: payload.duration_seconds,
            expiresAt: payload.expires_at,
          };
        }
        if (status === "failed") {
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

export async function pollKlingVideoGeneration(videoId, config = {}, options = {}) {
  const apiEndpoint = configValue(config, "klingApiEndpoint", "KLING_API_ENDPOINT") || "https://api.klingai.com/v1";
  const maxWaitMs = options.maxWaitMs || 300000;
  const pollIntervalMs = options.pollIntervalMs || 2000;

  if (!videoId) {
    return {
      ok: false,
      status: "failed",
      error: { code: "invalid_params", message: "Video ID required" },
    };
  }

  if (!resolveKlingToken(config)) {
    return {
      ok: false,
      status: "failed",
      error: { code: "missing_api_key", message: "Kling token not configured" },
    };
  }

  const startTime = Date.now();
  let lastError = null;

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const pollToken = resolveKlingToken(config);
      const response = await fetch(`${apiEndpoint}/videos/${videoId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${pollToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        lastError = {
          code: errorData.error?.code || errorData.code || "api_error",
          message: errorData.error?.message || errorData.message || `Kling API error: ${response.status}`,
          retryable: response.status === 429 || response.status === 503,
        };
        if (!lastError.retryable) {
          return { ok: false, status: "failed", error: lastError };
        }
      } else {
        const data = await response.json();
        const payload = data.data || data;
        const status = normalizeProviderStatus(payload.status || payload.task_status || payload.state);
        if (status === "completed") {
          return {
            ok: true,
            status: "completed",
            videoId: payload.task_id || payload.taskId || payload.id || videoId,
            videoUrl: extractKlingVideoUrl(payload),
            creditsUsed: payload.credits_used || payload.cost || 0,
            durationSeconds: payload.duration_seconds || payload.duration || 0,
            expiresAt: payload.expires_at,
          };
        }
        if (status === "failed") {
          return {
            ok: false,
            status: "failed",
            error: { code: "generation_failed", message: payload.error?.message || payload.message || "Kling video generation failed" },
          };
        }
      }
    } catch (error) {
      lastError = {
        code: "request_error",
        message: error.message || "Failed to poll Kling video status",
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

  // All outcomes increment the attempt counter — this is the single source of truth.
  updated.videoGenerationAttempts = (updated.videoGenerationAttempts || 0) + 1;

  if (result.status === "completed") {
    updated.generatedVideoUrl = result.videoUrl;
    updated.videoGenerationStatus = "success";
    updated.videoDurationSeconds = result.durationSeconds || 0;
    updated.videoGenerationCost = result.creditsUsed || 0;
    updated.videoGenerationError = null;
    updated.videoGenerationRetryable = false;
  } else if (result.status === "timeout" || result.status === "failed") {
    updated.videoGenerationStatus = "failed";
    updated.videoGenerationError = result.error || null;
    updated.videoGenerationRetryable = result.error?.retryable !== false;
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

const KLING_QUALITY_MODE_MAP = {
  low: "std",
  medium: "std",
  high: "pro",
};

function normalizeVideoProvider(provider) {
  return String(provider || "heygen").toLowerCase() === "kling" ? "kling" : "heygen";
}

function normalizeKlingDuration(duration) {
  return Number(duration || 0) <= 5 ? 5 : 10;
}

function normalizeKlingAspectRatio(aspectRatio) {
  const value = String(aspectRatio || "16:9");
  return ["16:9", "9:16", "1:1"].includes(value) ? value : "16:9";
}

function normalizeHeyGenAspectRatio(aspectRatio) {
  // HeyGen v2 accepts "16:9", "9:16", "1:1"
  const value = String(aspectRatio || "16:9");
  return ["16:9", "9:16", "1:1"].includes(value) ? value : "16:9";
}

function normalizeProviderStatus(status) {
  const value = String(status || "").toLowerCase();
  if (["completed", "complete", "succeeded", "success"].includes(value)) return "completed";
  if (["failed", "failure", "error", "cancelled", "canceled"].includes(value)) return "failed";
  return value || "pending";
}

function extractKlingVideoUrl(payload = {}) {
  return payload.video_url
    || payload.videoUrl
    || payload.output?.video_url
    || payload.output?.videoUrl
    || payload.result?.video_url
    || payload.result?.videoUrl
    || payload.assets?.video
    || payload.videos?.[0]?.url
    || payload.video?.url;
}

function envValue(key) {
  return typeof process !== "undefined" ? process.env?.[key] : undefined;
}

function configValue(config, key, envKey) {
  return Object.prototype.hasOwnProperty.call(config, key) ? config[key] : envValue(envKey);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
