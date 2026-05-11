import { browserProfilePath, contextsMatch, assertTenantContext } from "./tenant-context.js";

export const SESSION_STATUSES = Object.freeze([
  "unknown",
  "login_required",
  "ready",
  "challenge",
  "error",
]);

export function sessionKey(context) {
  return browserProfilePath(context);
}

export function createAccountSession(context, overrides = {}) {
  const safe = assertTenantContext(context);
  const now = new Date().toISOString();
  return {
    id: sessionKey(safe),
    context: safe,
    status: overrides.status || "unknown",
    currentUrl: overrides.currentUrl || null,
    lastCheckedAt: overrides.lastCheckedAt || now,
    lastReadyAt: overrides.lastReadyAt || null,
    note: overrides.note || "Session has not been checked yet.",
  };
}

export function normalizeSessionStatus(status) {
  return SESSION_STATUSES.includes(status) ? status : "unknown";
}

export function updateAccountSession(session, patch = {}) {
  const nextStatus = normalizeSessionStatus(patch.status || session.status);
  const now = new Date().toISOString();
  return {
    ...session,
    ...patch,
    status: nextStatus,
    lastCheckedAt: patch.lastCheckedAt || now,
    lastReadyAt: nextStatus === "ready" ? (patch.lastReadyAt || now) : session.lastReadyAt || null,
  };
}

export function getSessionForContext(sessions, context) {
  const key = sessionKey(context);
  return sessions[key] || createAccountSession(context);
}

export function upsertSessionForContext(sessions, context, patch) {
  const current = getSessionForContext(sessions, context);
  return {
    ...sessions,
    [current.id]: updateAccountSession(current, patch),
  };
}

export function validateSessionForStaging(session, context) {
  if (!session) return { ok: false, reason: "No browser session record" };
  if (!contextsMatch(session.context, context)) {
    return { ok: false, reason: "Browser session does not match active tenant/account" };
  }
  if (session.id !== sessionKey(context)) {
    return { ok: false, reason: "Browser profile path does not match active tenant/account" };
  }
  if (session.status !== "ready") {
    return { ok: false, reason: `Browser session is ${session.status}` };
  }
  return { ok: true, reason: "Browser session is ready" };
}

export function inferSessionStatusFromUrl(url, account = {}) {
  const value = String(url || "");
  if (!value || value === "about:blank") {
    return { status: "unknown", note: "Browser has not loaded an account page yet." };
  }
  if (/login|signin|account\/access/i.test(value)) {
    return { status: "login_required", note: "The platform is showing a login or access page." };
  }
  if (/challenge|checkpoint|captcha|verification/i.test(value)) {
    return { status: "challenge", note: "The platform appears to be asking for verification." };
  }
  const expectedHost = account.expectedHost || hostFromUrl(account.accountUrl);
  if (expectedHost && hostFromUrl(value) !== expectedHost) {
    return { status: "unknown", note: `Loaded host does not match expected host ${expectedHost}.` };
  }
  return { status: "ready", note: "Account page appears reachable in this browser profile." };
}

function hostFromUrl(url) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return null;
  }
}
