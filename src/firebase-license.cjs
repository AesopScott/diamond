const crypto = require("crypto");
const fs = require("fs");

const FIRESTORE_SCOPE = "https://www.googleapis.com/auth/datastore";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const LICENSE_COLLECTION = "products/diamond/licenses";
let tokenCache = null;

async function fetchFirebaseLicense(input = {}) {
  const configPath = input.configPath || process.env.DIAMOND_FIREBASE_ADMIN_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
  if (!configPath) {
    return { ok: false, reason: "No Firebase admin JSON path configured.", online: false };
  }
  if (!fs.existsSync(configPath)) {
    return { ok: false, reason: "Firebase admin JSON file was not found.", online: false, redactedPath: redactPath(configPath) };
  }

  const serviceAccount = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const projectId = input.projectId || process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id;
  const firebasePath = input.firebasePath || licenseFirebasePath(input.userId || input.email || "unknown");
  if (!projectId) {
    return { ok: false, reason: "Firebase project id is missing.", online: false, firebasePath };
  }

  try {
    const token = await getAccessToken(serviceAccount);
    const response = await fetch(firestoreDocumentUrl(projectId, firebasePath), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 404) {
      return { ok: false, reason: `No Diamond license found at ${firebasePath}.`, online: true, firebasePath, projectId };
    }
    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      return { ok: false, reason: `Firebase license read failed: ${response.status} ${message}`, online: true, firebasePath, projectId };
    }
    const document = await response.json();
    return {
      ok: true,
      reason: "Firebase license synced.",
      online: true,
      firebasePath,
      projectId,
      license: licenseFromFirestoreDocument(document, firebasePath),
    };
  } catch (error) {
    return { ok: false, reason: `Firebase license sync failed: ${error.message}`, online: false, firebasePath, projectId };
  }
}

function licenseFromFirestoreDocument(document = {}, fallbackPath = "") {
  const plain = firestoreDocumentToPlainObject(document);
  return {
    ...plain,
    product: plain.product || "diamond",
    source: plain.source || "firebase",
    firebasePath: documentPathFromName(document.name) || fallbackPath,
    lastVerifiedAt: new Date().toISOString(),
  };
}

function firestoreDocumentToPlainObject(document = {}) {
  return firestoreFieldsToPlainObject(document.fields || {});
}

function firestoreFieldsToPlainObject(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, firestoreValueToPlain(value)]));
}

function firestoreValueToPlain(value = {}) {
  if (Object.prototype.hasOwnProperty.call(value, "stringValue")) return value.stringValue;
  if (Object.prototype.hasOwnProperty.call(value, "integerValue")) return Number.parseInt(value.integerValue, 10);
  if (Object.prototype.hasOwnProperty.call(value, "doubleValue")) return Number(value.doubleValue);
  if (Object.prototype.hasOwnProperty.call(value, "booleanValue")) return Boolean(value.booleanValue);
  if (Object.prototype.hasOwnProperty.call(value, "timestampValue")) return value.timestampValue;
  if (Object.prototype.hasOwnProperty.call(value, "nullValue")) return null;
  if (value.arrayValue) return (value.arrayValue.values || []).map(firestoreValueToPlain);
  if (value.mapValue) return firestoreFieldsToPlainObject(value.mapValue.fields || {});
  return null;
}

async function getAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache?.email === serviceAccount.client_email && tokenCache.expiresAt - 60 > now) {
    return tokenCache.token;
  }
  const assertion = signJwt(serviceAccount, now);
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`OAuth token request failed: ${response.status} ${message}`);
  }
  const payload = await response.json();
  tokenCache = {
    email: serviceAccount.client_email,
    token: payload.access_token,
    expiresAt: now + Number(payload.expires_in || 3600),
  };
  return tokenCache.token;
}

function signJwt(serviceAccount, now) {
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: serviceAccount.client_email,
    scope: FIRESTORE_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64UrlJson(header)}.${base64UrlJson(claim)}`;
  const signature = crypto.createSign("RSA-SHA256").update(unsigned).sign(serviceAccount.private_key);
  return `${unsigned}.${base64Url(signature)}`;
}

function firestoreDocumentUrl(projectId, firebasePath) {
  const encodedPath = String(firebasePath || "").split("/").map(encodeURIComponent).join("/");
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${encodedPath}`;
}

function licenseFirebasePath(userId) {
  return `${LICENSE_COLLECTION}/${slug(userId)}`;
}

function documentPathFromName(name = "") {
  return String(name).split("/documents/")[1] || "";
}

function base64UrlJson(value) {
  return base64Url(Buffer.from(JSON.stringify(value), "utf8"));
}

function base64Url(value) {
  return Buffer.from(value).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function slug(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9_.-]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}

function redactPath(value) {
  const input = String(value || "");
  if (!input) return "";
  const parts = input.split(/[\\/]/).filter(Boolean);
  if (parts.length <= 2) return `.../${parts.at(-1) || ""}`;
  return `.../${parts.at(-2)}/${parts.at(-1)}`;
}

module.exports = {
  fetchFirebaseLicense,
  firestoreDocumentToPlainObject,
  firestoreValueToPlain,
  licenseFromFirestoreDocument,
  licenseFirebasePath,
};
