import { normalizeId } from "./ids.js";

export function normalizeAccountUrl(value, platform) {
  const raw = String(value || "").trim();
  if (!raw) return platform === "x" ? "https://x.com/" : "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("@") && platform === "x") return `https://x.com/${raw.slice(1)}`;
  if (/^[a-z0-9_.-]+$/i.test(raw) && platform === "x") return `https://x.com/${raw}`;
  return `https://${raw}`;
}

export function defaultLoginUrlForPlatform(platform) {
  return platform === "x" ? "https://x.com/i/flow/login" : "";
}

export function normalizeLoginUrl(value, platform) {
  const raw = String(value || "").trim();
  if (!raw) return defaultLoginUrlForPlatform(platform);
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

export function resolveLoginUrl(account) {
  return normalizeLoginUrl(account?.loginUrl, account?.platform) || normalizeAccountUrl(account?.accountUrl, account?.platform);
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
