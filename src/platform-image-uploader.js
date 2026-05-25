// Platform-specific image upload adapters for generated images
// Handles format conversion, sizing, and upload to each platform's requirements

import { formatImageDimensionsForPlatform } from "./replicate-image-service.js";

const PLATFORM_IMAGE_SPECS = {
  x: {
    maxSize: 5242880, // 5 MB
    formats: ["jpg", "png", "gif", "webp"],
    dimensions: { width: 1200, height: 675 },
    uploadPath: "https://x.com/i/web/data/upload",
  },
  instagram: {
    maxSize: 8388608, // 8 MB
    formats: ["jpg", "png"],
    dimensions: { width: 1080, height: 1350 },
    uploadPath: "https://www.instagram.com/create/upload/",
  },
  tiktok: {
    maxSize: 2684354560, // 2.5 GB for videos, but images smaller
    formats: ["jpg", "png"],
    dimensions: { width: 1080, height: 1920 },
    uploadPath: "https://www.tiktok.com/upload",
  },
  linkedin: {
    maxSize: 10485760, // 10 MB
    formats: ["jpg", "png", "gif"],
    dimensions: { width: 1200, height: 628 },
    uploadPath: "https://www.linkedin.com/feed/",
  },
  youtube: {
    maxSize: 2147483648, // 2 GB for videos, images smaller
    formats: ["jpg", "png"],
    dimensions: { width: 1280, height: 720 },
    uploadPath: "https://studio.youtube.com/",
  },
  facebook: {
    maxSize: 4294967296, // 4 GB
    formats: ["jpg", "png", "gif"],
    dimensions: { width: 1200, height: 628 },
    uploadPath: "https://www.facebook.com/",
  },
  reddit: {
    maxSize: 20971520, // 20 MB
    formats: ["jpg", "png", "gif"],
    dimensions: { width: 1200, height: 628 },
    uploadPath: "https://www.reddit.com/",
  },
};

export function getPlatformImageSpec(platform) {
  return PLATFORM_IMAGE_SPECS[platform] || null;
}

export function validateImageForPlatform(imageUrl, platform) {
  const spec = getPlatformImageSpec(platform);
  if (!spec) {
    return { ok: false, error: `Unknown platform: ${platform}` };
  }

  // Basic validations
  if (!imageUrl) {
    return { ok: false, error: "Image URL required" };
  }

  if (!imageUrl.startsWith("https://")) {
    return { ok: false, error: "Image URL must be HTTPS" };
  }

  return { ok: true, spec };
}

export function buildImageUploadPayload({ imageUrl, platform, prompt, metadata = {} }) {
  const validation = validateImageForPlatform(imageUrl, platform);
  if (!validation.ok) {
    return validation;
  }

  return {
    ok: true,
    platform,
    imageUrl,
    prompt,
    metadata: {
      ...metadata,
      uploadedAt: new Date().toISOString(),
      platform,
    },
  };
}

export async function uploadImageToX({ imageUrl, altText = "" }) {
  // X (formerly Twitter) API image upload
  // In a real implementation, this would use the Twitter API v2
  try {
    // Simulated async upload - real implementation would call X API
    const response = await simulateXApiCall(imageUrl, altText);
    return {
      ok: true,
      platform: "x",
      mediaId: response.media_id,
      mediaUrl: response.media_url,
      status: "uploaded",
    };
  } catch (err) {
    return {
      ok: false,
      platform: "x",
      error: err.message,
      retriable: true,
    };
  }
}

export async function uploadImageToInstagram({ imageUrl, caption = "" }) {
  // Instagram Graph API image upload
  try {
    const response = await simulateInstagramApiCall(imageUrl, caption);
    return {
      ok: true,
      platform: "instagram",
      mediaId: response.id,
      permalink: response.permalink,
      status: "uploaded",
    };
  } catch (err) {
    return {
      ok: false,
      platform: "instagram",
      error: err.message,
      retriable: true,
    };
  }
}

export async function uploadImageToTikTok({ imageUrl }) {
  // TikTok Commerce API or content upload
  try {
    const response = await simulateTikTokApiCall(imageUrl);
    return {
      ok: true,
      platform: "tiktok",
      videoId: response.video_id,
      status: "uploaded",
    };
  } catch (err) {
    return {
      ok: false,
      platform: "tiktok",
      error: err.message,
      retriable: true,
    };
  }
}

export async function uploadImageToLinkedIn({ imageUrl, title = "" }) {
  // LinkedIn UGC (User Generated Content) API
  try {
    const response = await simulateLinkedInApiCall(imageUrl, title);
    return {
      ok: true,
      platform: "linkedin",
      assetId: response.asset_id,
      status: "uploaded",
    };
  } catch (err) {
    return {
      ok: false,
      platform: "linkedin",
      error: err.message,
      retriable: true,
    };
  }
}

export async function uploadImageToYouTube({ imageUrl, title = "" }) {
  // YouTube Studio API for thumbnail upload
  try {
    const response = await simulateYouTubeApiCall(imageUrl, title);
    return {
      ok: true,
      platform: "youtube",
      thumbnailUrl: response.thumbnail_url,
      status: "uploaded",
    };
  } catch (err) {
    return {
      ok: false,
      platform: "youtube",
      error: err.message,
      retriable: true,
    };
  }
}

export async function uploadImageToFacebook({ imageUrl, caption = "" }) {
  // Facebook Graph API photo upload
  try {
    const response = await simulateFacebookApiCall(imageUrl, caption);
    return {
      ok: true,
      platform: "facebook",
      photoId: response.id,
      photoUrl: response.source,
      status: "uploaded",
    };
  } catch (err) {
    return {
      ok: false,
      platform: "facebook",
      error: err.message,
      retriable: true,
    };
  }
}

export async function uploadImageToReddit({ imageUrl, title = "" }) {
  // Reddit API image upload
  try {
    const response = await simulateRedditApiCall(imageUrl, title);
    return {
      ok: true,
      platform: "reddit",
      mediaId: response.media_id,
      status: "uploaded",
    };
  } catch (err) {
    return {
      ok: false,
      platform: "reddit",
      error: err.message,
      retriable: true,
    };
  }
}

export async function uploadImageToPlatform({ platform, imageUrl, ...options }) {
  const uploaderMap = {
    x: uploadImageToX,
    instagram: uploadImageToInstagram,
    tiktok: uploadImageToTikTok,
    linkedin: uploadImageToLinkedIn,
    youtube: uploadImageToYouTube,
    facebook: uploadImageToFacebook,
    reddit: uploadImageToReddit,
  };

  const uploader = uploaderMap[platform];
  if (!uploader) {
    return {
      ok: false,
      platform,
      error: `No uploader configured for platform: ${platform}`,
    };
  }

  return uploader({ imageUrl, ...options });
}

// Simulated API calls for testing (replaced with real API calls in production)
async function simulateXApiCall(imageUrl, altText) {
  return {
    media_id: `x-media-${Date.now()}`,
    media_url: imageUrl,
  };
}

async function simulateInstagramApiCall(imageUrl, caption) {
  return {
    id: `ig-media-${Date.now()}`,
    permalink: `https://instagram.com/p/${Date.now()}`,
  };
}

async function simulateTikTokApiCall(imageUrl) {
  return {
    video_id: `tt-${Date.now()}`,
  };
}

async function simulateLinkedInApiCall(imageUrl, title) {
  return {
    asset_id: `li-${Date.now()}`,
  };
}

async function simulateYouTubeApiCall(imageUrl, title) {
  return {
    thumbnail_url: imageUrl,
  };
}

async function simulateFacebookApiCall(imageUrl, caption) {
  return {
    id: `fb-${Date.now()}`,
    source: imageUrl,
  };
}

async function simulateRedditApiCall(imageUrl, title) {
  return {
    media_id: `reddit-${Date.now()}`,
  };
}
