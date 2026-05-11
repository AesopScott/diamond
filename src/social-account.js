import { normalizeId } from "./ids.js";

export function normalizeAccountUrl(value, platform) {
  const raw = String(value || "").trim();
  if (!raw) return platform === "x" ? "https://x.com/" : "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("@") && platform === "x") return `https://x.com/${raw.slice(1)}`;
  if (/^[a-z0-9_.-]+$/i.test(raw) && platform === "x") return `https://x.com/${raw}`;
  return `https://${raw}`;
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
