// Replicate API service wrapper for Flux Pro image generation
// Handles authentication, request formatting, response parsing, error handling, and cost tracking

const REPLICATE_API_BASE = "https://api.replicate.com/v1";
const MODEL_ID = "black-forest-labs/flux-pro";

// Platform-specific image dimensions and formats
const PLATFORM_SPECS = {
  instagram: { width: 1080, height: 1350, aspectRatio: "4:5", format: "webp" },
  x: { width: 1200, height: 675, aspectRatio: "16:9", format: "webp" },
  tiktok: { width: 1080, height: 1920, aspectRatio: "9:16", format: "webp" },
  linkedin: { width: 1200, height: 628, aspectRatio: "1.91:1", format: "webp" },
  youtube: { width: 1280, height: 720, aspectRatio: "16:9", format: "webp" },
  facebook: { width: 1200, height: 628, aspectRatio: "1.91:1", format: "webp" },
  reddit: { width: 1200, height: 628, aspectRatio: "1.91:1", format: "webp" },
};

// Flux Pro pricing: $0.03-$0.15 per image depending on resolution and processing time
const COST_PER_SECOND = 0.015; // Approximate cost per second of predict time

export function authenticateReplicateRequest({ env }) {
  const apiKey = env.REPLICATE_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      reason: "missing",
      message: "REPLICATE_API_KEY environment variable not set",
    };
  }
  return {
    ok: true,
    apiKey,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  };
}

export function formatImageDimensionsForPlatform(platform) {
  const spec = PLATFORM_SPECS[platform];
  if (!spec) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  return {
    width: spec.width,
    height: spec.height,
    aspectRatio: spec.aspectRatio,
    format: spec.format,
  };
}

export function buildReplicateRequestPayload({
  prompt,
  platform,
  model = MODEL_ID,
  numOutputs = 1,
}) {
  const dims = formatImageDimensionsForPlatform(platform);
  return {
    version: model, // Replicate uses version ID, not model name
    input: {
      prompt,
      aspect_ratio: dims.aspectRatio.replace(":", "."),
      output_format: dims.format,
      num_outputs: numOutputs,
    },
  };
}

export function extractGenerationCost({ predictTime, model }) {
  // Flux Pro costs approximately $0.015 per second of processing
  // predictTime is in seconds
  return Math.round(predictTime * COST_PER_SECOND * 100) / 100;
}

export function handleReplicateError({ status, message, retryAfter }) {
  const retriable = status >= 429 && status <= 503; // Rate limits and temporary errors
  return {
    ok: false,
    code: status,
    message,
    retriable,
    retryAfter: retryAfter || null,
    reason: status === 401 ? "unauthorized" : status === 429 ? "rate-limited" : "api-error",
  };
}

export async function generateImageViaReplicate({
  prompt,
  platform,
  apiKey,
  onProgress,
}) {
  if (!apiKey) {
    return {
      ok: false,
      error: "API key required",
    };
  }

  try {
    const payload = buildReplicateRequestPayload({ prompt, platform });

    // Start prediction request
    const predictionResponse = await fetch(`${REPLICATE_API_BASE}/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!predictionResponse.ok) {
      const errorData = await predictionResponse.json();
      return handleReplicateError({
        status: predictionResponse.status,
        message: errorData.detail || errorData.message || predictionResponse.statusText,
        retryAfter: parseInt(predictionResponse.headers.get("Retry-After")) || null,
      });
    }

    const prediction = await predictionResponse.json();
    const predictionId = prediction.id;

    // Poll for completion
    const maxAttempts = 120; // 2 minutes with 1-second polling
    let attempts = 0;
    let completed = false;
    let finalPrediction = prediction;

    while (attempts < maxAttempts && !completed) {
      if (finalPrediction.status === "succeeded" || finalPrediction.status === "failed") {
        completed = true;
        break;
      }

      attempts += 1;
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const statusResponse = await fetch(`${REPLICATE_API_BASE}/predictions/${predictionId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (statusResponse.ok) {
        finalPrediction = await statusResponse.json();
      }

      if (onProgress) {
        onProgress({ status: finalPrediction.status, attempt: attempts, maxAttempts });
      }
    }

    if (finalPrediction.status === "failed") {
      return {
        ok: false,
        error: finalPrediction.error || "Image generation failed",
      };
    }

    if (!completed) {
      return {
        ok: false,
        error: "Image generation timeout",
      };
    }

    // Extract results
    const imageUrl = finalPrediction.output?.[0]?.url || finalPrediction.output?.[0];
    const cost = extractGenerationCost({
      predictTime: finalPrediction.metrics?.predict_time || 10,
      model: MODEL_ID,
    });

    return {
      ok: true,
      imageUrl,
      predictTime: finalPrediction.metrics?.predict_time,
      cost,
      status: finalPrediction.status,
      predictionId: finalPrediction.id,
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message,
      retriable: true,
    };
  }
}

export function createReplicateImageMetadata({
  imageUrl,
  prompt,
  platform,
  cost,
  predictionId,
}) {
  return {
    service: "replicate",
    model: "flux-pro",
    prompt,
    platform,
    imageUrl,
    generationCost: cost,
    approvalStatus: "pending",
    regenerationCount: 0,
    predictionId,
    createdAt: new Date().toISOString(),
  };
}
