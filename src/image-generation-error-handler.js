// Error handling and user notifications for image generation failures
// Provides structured error responses, retry guidance, and logging

export const IMAGE_GENERATION_ERROR_TYPES = {
  REPLICATE_API_ERROR: "replicate_api_error",
  RATE_LIMIT: "rate_limit",
  TIMEOUT: "timeout",
  INVALID_PROMPT: "invalid_prompt",
  PLATFORM_UPLOAD_FAILED: "platform_upload_failed",
  INSUFFICIENT_CREDITS: "insufficient_credits",
  NETWORK_ERROR: "network_error",
};

export function formatErrorForUI(error) {
  if (!error) {
    return {
      title: "Unknown error",
      message: "An unexpected error occurred. Please try again.",
      retriable: true,
      actionLabel: "Retry",
    };
  }

  switch (error.code || error.reason) {
    case IMAGE_GENERATION_ERROR_TYPES.RATE_LIMIT:
      return {
        title: "Rate limited",
        message: `Please wait ${error.retryAfter || 60} seconds before generating another image.`,
        retriable: true,
        actionLabel: "Retry in 60s",
        retryAfter: error.retryAfter || 60,
      };

    case IMAGE_GENERATION_ERROR_TYPES.TIMEOUT:
      return {
        title: "Generation timeout",
        message: "Image generation took too long. Try a shorter prompt or simpler request.",
        retriable: true,
        actionLabel: "Try again with different prompt",
      };

    case IMAGE_GENERATION_ERROR_TYPES.INVALID_PROMPT:
      return {
        title: "Invalid prompt",
        message: error.message || "The image prompt contains blocked content or formatting issues.",
        retriable: false,
        actionLabel: "Edit prompt",
      };

    case IMAGE_GENERATION_ERROR_TYPES.INSUFFICIENT_CREDITS:
      return {
        title: "Insufficient credits",
        message: "Replicate account has insufficient credits. Contact administrator.",
        retriable: false,
        actionLabel: "Dismiss",
      };

    case IMAGE_GENERATION_ERROR_TYPES.PLATFORM_UPLOAD_FAILED:
      return {
        title: "Upload failed",
        message: `Failed to upload image to ${error.platform}. ${error.message || ""}`,
        retriable: error.retriable !== false,
        actionLabel: error.retriable ? "Retry upload" : "Dismiss",
        platform: error.platform,
      };

    case IMAGE_GENERATION_ERROR_TYPES.NETWORK_ERROR:
      return {
        title: "Network error",
        message: "Connection lost. Please check your internet and try again.",
        retriable: true,
        actionLabel: "Retry",
      };

    case IMAGE_GENERATION_ERROR_TYPES.REPLICATE_API_ERROR:
    default:
      return {
        title: "Generation failed",
        message: error.message || "Failed to generate image. Please try again.",
        retriable: true,
        actionLabel: "Retry",
      };
  }
}

export function formatErrorForEmail(error, context = {}) {
  const { campaignName, platform, postId, operatorEmail } = context;

  const errorDetails = {
    title: "Image Generation Failed",
    campaign: campaignName || "Unknown campaign",
    platform: platform || "Unknown platform",
    postId: postId || "Unknown post",
    errorCode: error.code || error.reason || "unknown",
    errorMessage: error.message || "No error details",
    timestamp: new Date().toISOString(),
    actionRequired: "Manual review required before automated publishing can proceed.",
    actionItems: [
      `1. Log into Diamond and navigate to campaign: ${campaignName}`,
      `2. Review post ${postId} for platform ${platform}`,
      `3. Either manually attach an image or disable image generation for this post`,
      `4. Re-publish when ready`,
    ],
  };

  return {
    to: operatorEmail || "operator@company.com",
    subject: `Diamond: Image generation failed for ${campaignName || "post"}`,
    template: "image-generation-error",
    context: errorDetails,
  };
}

export function logImageGenerationError(error, context = {}) {
  const { campaignId, postId, platform, isInteractive } = context;

  const logEntry = {
    timestamp: new Date().toISOString(),
    type: error.code || error.reason || "unknown",
    message: error.message || "Unknown error",
    details: {
      campaignId,
      postId,
      platform,
      isInteractive,
      errorCode: error.code,
      errorReason: error.reason,
      retriable: error.retriable,
      retryAfter: error.retryAfter,
    },
    severity: error.retriable ? "warning" : "error",
  };

  // In production, this would write to logging service
  console.error("Image generation error", logEntry);

  return logEntry;
}

export function createImageGenerationErrorWithContext(baseError, context = {}) {
  return {
    ...baseError,
    context,
    uiMessage: formatErrorForUI(baseError),
    emailMessage: formatErrorForEmail(baseError, context),
    logEntry: logImageGenerationError(baseError, context),
  };
}

export function shouldRetryImageGeneration(error) {
  if (!error) return false;
  if (error.retriable === false) return false;
  if (error.code === IMAGE_GENERATION_ERROR_TYPES.INVALID_PROMPT) return false;
  if (error.code === IMAGE_GENERATION_ERROR_TYPES.INSUFFICIENT_CREDITS) return false;
  return true;
}

export function calculateBackoffDelay(attemptNumber, baseDelay = 1000) {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 60s
  const delayMs = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), 60000);
  return delayMs;
}

export async function retryWithBackoff(fn, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts || !shouldRetryImageGeneration(err)) {
        throw err;
      }
      const delay = calculateBackoffDelay(attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
