export const LICENSE_GRACE_DAYS = 7;

export function createDiamondLicense(input = {}) {
  return {
    id: input.id || `license-${Date.now()}`,
    product: "diamond",
    userId: clean(input.userId),
    email: clean(input.email),
    role: input.role || "user",
    status: input.status || "active",
    brandLimit: count(input.brandLimit, 1),
    brands: normalizeList(input.brands),
    platformLimit: count(input.platformLimit, 1),
    platforms: normalizeList(input.platforms),
    automationPlatforms: normalizeList(input.automationPlatforms),
    billingInterval: input.billingInterval || "monthly",
    source: input.source || "mojo-ai-studio",
    firebasePath: input.firebasePath || licenseFirebasePath(input.userId || input.email || "unknown"),
    lastVerifiedAt: input.lastVerifiedAt || new Date().toISOString(),
    expiresAt: input.expiresAt || null,
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
}

export function evaluateDiamondLicense(license = {}, input = {}) {
  if (license.product && license.product !== "diamond") {
    return deny("License is for a different product.");
  }
  if (!["active", "trialing"].includes(license.status) && !isAdminOrDev(license)) {
    return deny(`License status is ${license.status || "missing"}.`);
  }
  const now = input.now ? new Date(input.now) : new Date();
  if (license.expiresAt && new Date(license.expiresAt) < now && !isAdminOrDev(license)) {
    return deny("License is expired.");
  }
  const offline = input.online === false;
  if (offline) {
    const grace = offlineGraceStatus(license, now);
    if (!grace.ok) return grace;
  }
  const requestedBrands = normalizeList(input.requestedBrands || license.brands);
  if (!isAdminOrDev(license) && requestedBrands.length > count(license.brandLimit, 0)) {
    return deny(`Brand limit exceeded (${requestedBrands.length}/${license.brandLimit}).`);
  }
  const requestedPlatforms = normalizeList(input.requestedPlatforms || license.platforms);
  if (!isAdminOrDev(license) && requestedPlatforms.length > count(license.platformLimit, 0)) {
    return deny(`Platform limit exceeded (${requestedPlatforms.length}/${license.platformLimit}).`);
  }
  const requestedAutomationPlatforms = normalizeList(input.requestedAutomationPlatforms);
  const licensedAutomation = normalizeList(license.automationPlatforms);
  const missingAutomation = requestedAutomationPlatforms.filter((platform) => !licensedAutomation.includes(platform));
  if (!isAdminOrDev(license) && missingAutomation.length) {
    return deny(`Automation not licensed for: ${missingAutomation.join(", ")}.`);
  }
  return {
    ok: true,
    reason: offline ? "License valid within offline grace window." : "License valid.",
    offline,
    graceExpiresAt: offline ? graceExpiry(license).toISOString() : null,
    brandLimit: isAdminOrDev(license) ? "unlimited" : count(license.brandLimit, 0),
    platformLimit: isAdminOrDev(license) ? "unlimited" : count(license.platformLimit, 0),
    automationPlatforms: isAdminOrDev(license) ? "unlimited" : licensedAutomation,
  };
}

export function licenseFirebasePath(userId) {
  return `products/diamond/licenses/${slug(userId)}`;
}

export function buildLicensePortalRecord(license = {}) {
  const record = createDiamondLicense(license);
  return {
    path: record.firebasePath,
    data: {
      product: record.product,
      userId: record.userId,
      email: record.email,
      role: record.role,
      status: record.status,
      brandLimit: record.brandLimit,
      brands: record.brands,
      platformLimit: record.platformLimit,
      platforms: record.platforms,
      automationPlatforms: record.automationPlatforms,
      billingInterval: record.billingInterval,
      source: record.source,
      lastVerifiedAt: record.lastVerifiedAt,
      expiresAt: record.expiresAt,
      updatedAt: record.updatedAt,
    },
  };
}

function offlineGraceStatus(license, now) {
  if (!license.lastVerifiedAt) return deny("No previous Firebase license verification is available.");
  const expiresAt = graceExpiry(license);
  if (expiresAt < now) return deny("Offline license grace window has expired.");
  return { ok: true };
}

function graceExpiry(license) {
  const verified = new Date(license.lastVerifiedAt || 0);
  return new Date(verified.getTime() + LICENSE_GRACE_DAYS * 24 * 60 * 60 * 1000);
}

function isAdminOrDev(license) {
  return ["admin", "dev"].includes(license.role);
}

function normalizeList(value = []) {
  const list = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(list.map((item) => clean(item).toLowerCase()).filter(Boolean))];
}

function count(value, fallback) {
  const number = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function deny(reason) {
  return { ok: false, reason };
}

function clean(value) {
  return String(value || "").trim();
}

function slug(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9_.-]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}
