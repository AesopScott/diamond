import { normalizeId } from "./ids.js";

export const SOCIAL_PLATFORM_CONFIG = Object.freeze({
  x: {
    label: "X",
    accountBaseUrl: "https://x.com/",
    loginUrl: "https://x.com/i/flow/login",
    composeUrl: "https://x.com/compose/post",
    expectedHost: "x.com",
    monitoringOnly: false,
  },
  instagram: {
    label: "Instagram",
    accountBaseUrl: "https://www.instagram.com/",
    loginUrl: "https://www.instagram.com/accounts/login/",
    composeUrl: "https://www.instagram.com/",
    expectedHost: "instagram.com",
    monitoringOnly: false,
  },
  tiktok: {
    label: "TikTok",
    accountBaseUrl: "https://www.tiktok.com/",
    loginUrl: "https://www.tiktok.com/login",
    composeUrl: "https://www.tiktok.com/upload",
    expectedHost: "tiktok.com",
    monitoringOnly: false,
  },
  linkedin: {
    label: "LinkedIn",
    accountBaseUrl: "https://www.linkedin.com/company/",
    loginUrl: "https://www.linkedin.com/login",
    composeUrl: "https://www.linkedin.com/feed/",
    expectedHost: "linkedin.com",
    monitoringOnly: false,
  },
  "youtube-shorts": {
    label: "YouTube Shorts",
    accountBaseUrl: "https://www.youtube.com/",
    loginUrl: "https://accounts.google.com/",
    composeUrl: "https://studio.youtube.com/",
    expectedHost: "youtube.com",
    monitoringOnly: false,
    sharedAccountGroup: "youtube",
  },
  "youtube-longform": {
    label: "YouTube Long Form",
    accountBaseUrl: "https://www.youtube.com/",
    loginUrl: "https://accounts.google.com/",
    composeUrl: "https://studio.youtube.com/",
    expectedHost: "youtube.com",
    monitoringOnly: false,
    sharedAccountGroup: "youtube",
  },
  facebook: {
    label: "Facebook",
    accountBaseUrl: "https://www.facebook.com/",
    loginUrl: "https://www.facebook.com/login/",
    composeUrl: "https://www.facebook.com/",
    expectedHost: "facebook.com",
    monitoringOnly: false,
  },
  pinterest: {
    label: "Pinterest",
    accountBaseUrl: "https://www.pinterest.com/",
    loginUrl: "https://www.pinterest.com/login/",
    composeUrl: "https://www.pinterest.com/pin-builder/",
    expectedHost: "pinterest.com",
    monitoringOnly: false,
  },
  reddit: {
    label: "Reddit",
    accountBaseUrl: "https://www.reddit.com/user/",
    loginUrl: "https://www.reddit.com/login/",
    composeUrl: "https://www.reddit.com/",
    expectedHost: "reddit.com",
    monitoringOnly: true,
  },
});

export function platformConfig(platform) {
  return SOCIAL_PLATFORM_CONFIG[normalizeId(platform, "platform")] || null;
}

export function platformLabel(platform) {
  return platformConfig(platform)?.label || String(platform || "").toUpperCase();
}

export function normalizeAccountUrl(value, platform) {
  const raw = String(value || "").trim();
  const config = platformConfig(platform);
  if (!raw) return config?.accountBaseUrl || "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("@") && platform === "x") return `https://x.com/${raw.slice(1)}`;
  if (/^[a-z0-9_.-]+$/i.test(raw) && platform === "x") return `https://x.com/${raw}`;
  if (/^[a-z0-9_.-]+$/i.test(raw) && config?.accountBaseUrl) return `${config.accountBaseUrl}${raw}`;
  return `https://${raw}`;
}

export function defaultLoginUrlForPlatform(platform) {
  return platformConfig(platform)?.loginUrl || "";
}

export function defaultComposeUrlForPlatform(platform) {
  return platformConfig(platform)?.composeUrl || "";
}

export function defaultExpectedHostForPlatform(platform) {
  return platformConfig(platform)?.expectedHost || "";
}

export function isMonitoringOnlyPlatform(platform) {
  return Boolean(platformConfig(platform)?.monitoringOnly);
}

export function sharedAccountGroupForPlatform(platform) {
  return platformConfig(platform)?.sharedAccountGroup || normalizeId(platform, "platform");
}

export function normalizeLoginUrl(value, platform) {
  const raw = String(value || "").trim();
  if (!raw) return defaultLoginUrlForPlatform(platform);
  if (normalizeId(platform, "platform") === "tiktok" && /^https?:\/\/((www|m)\.)?tiktok\.com\/login(?:\/phone-or-email\/email)?\/?$/i.test(raw)) {
    return defaultLoginUrlForPlatform(platform);
  }
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

export function normalizeComposeUrl(value, platform) {
  const raw = String(value || "").trim();
  if (!raw) return defaultComposeUrlForPlatform(platform);
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

export function resolveLoginUrl(account) {
  return normalizeLoginUrl(account?.loginUrl, account?.platform) || normalizeAccountUrl(account?.accountUrl, account?.platform);
}

export function resolveComposeUrl(account) {
  return normalizeComposeUrl(account?.composeUrl, account?.platform) || normalizeAccountUrl(account?.accountUrl, account?.platform);
}

export function normalizeHost(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return raw.replace(/^https?:\/\//i, "").replace(/^www\./, "").split("/")[0];
  }
}

export function normalizeBrowserProfileId(value) {
  return normalizeId(value, "browserProfileId");
}
