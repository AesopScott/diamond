export const LICENSE_GRACE_DAYS = 7;
export const DIAMOND_LICENSE_MODEL_VERSION = "2026-05-12";
export const TEMPORARY_UNLIMITED_LICENSE_PLAN = "temporary-unlimited-until-shop";

export function buildDiamondLicenseModel(input = {}) {
  return {
    product: "diamond",
    version: input.version || DIAMOND_LICENSE_MODEL_VERSION,
    billingInterval: "monthly",
    sourceOfTruth: "firebase",
    purchaseSystem: "mojo-ai-studio",
    offlineGraceDays: LICENSE_GRACE_DAYS,
    entitlements: {
      brandLimit: count(input.brandLimit, 1),
      platformLimit: count(input.platformLimit, 1),
      automationDefault: false,
      automationPlatforms: normalizeList(input.automationPlatforms),
    },
    firebase: {
      collectionPath: "products/diamond/licenses",
      documentKey: "userId or email slug",
    },
  };
}

export function createDiamondLicense(input = {}) {
  const model = buildDiamondLicenseModel(input);
  return {
    id: input.id || `license-${Date.now()}`,
    product: "diamond",
    modelVersion: input.modelVersion || model.version,
    planId: clean(input.planId || "custom-monthly"),
    userId: clean(input.userId),
    email: clean(input.email),
    role: input.role || "user",
    status: input.status || "active",
    brandLimit: count(input.brandLimit, 1),
    brands: normalizeList(input.brands),
    platformLimit: count(input.platformLimit, 1),
    platforms: normalizeList(input.platforms),
    automationPlatforms: normalizeList(input.automationPlatforms),
    automationDefault: false,
    billingInterval: input.billingInterval || "monthly",
    mojoSubscriptionId: clean(input.mojoSubscriptionId),
    source: input.source || "mojo-ai-studio",
    firebasePath: input.firebasePath || licenseFirebasePath(input.userId || input.email || "unknown"),
    lastVerifiedAt: input.lastVerifiedAt || new Date().toISOString(),
    expiresAt: input.expiresAt || null,
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
}

export function createTemporaryUnlimitedDiamondLicense(input = {}) {
  return createDiamondLicense({
    id: input.id || "license-temporary-unlimited",
    userId: input.userId || "temporary-unlimited",
    email: input.email || "unlimited@diamond.local",
    role: "dev",
    status: "active",
    planId: TEMPORARY_UNLIMITED_LICENSE_PLAN,
    brandLimit: 0,
    brands: input.brands || [],
    platformLimit: 0,
    platforms: input.platforms || [],
    automationPlatforms: input.automationPlatforms || input.platforms || [],
    billingInterval: "monthly",
    source: "temporary-shop-bypass",
    firebasePath: input.firebasePath || licenseFirebasePath(input.userId || "temporary-unlimited"),
    lastVerifiedAt: input.lastVerifiedAt || new Date().toISOString(),
    updatedAt: input.updatedAt || new Date().toISOString(),
  });
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
  const licensedBrands = normalizeList(license.brands);
  const missingBrands = requestedBrands.filter((brand) => !licensedBrands.includes(brand));
  if (!isAdminOrDev(license) && missingBrands.length) {
    return deny(`Brand not licensed: ${missingBrands.join(", ")}.`);
  }
  if (!isAdminOrDev(license) && requestedBrands.length > count(license.brandLimit, 0)) {
    return deny(`Brand limit exceeded (${requestedBrands.length}/${license.brandLimit}).`);
  }
  const requestedPlatforms = normalizeList(input.requestedPlatforms || license.platforms);
  const licensedPlatforms = normalizeList(license.platforms);
  const missingPlatforms = requestedPlatforms.filter((platform) => !licensedPlatforms.includes(platform));
  if (!isAdminOrDev(license) && missingPlatforms.length) {
    return deny(`Platform not licensed: ${missingPlatforms.join(", ")}.`);
  }
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

export function evaluateDiamondAccess(input = {}) {
  const context = input.context || {};
  return evaluateDiamondLicense(input.license || {}, {
    now: input.now,
    online: input.online,
    requestedBrands: [context.brandId].filter(Boolean),
    requestedPlatforms: [context.platform].filter(Boolean),
    requestedAutomationPlatforms: input.automation ? [context.platform].filter(Boolean) : [],
  });
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
      modelVersion: record.modelVersion,
      planId: record.planId,
      userId: record.userId,
      email: record.email,
      role: record.role,
      status: record.status,
      brandLimit: record.brandLimit,
      brands: record.brands,
      platformLimit: record.platformLimit,
      platforms: record.platforms,
      automationPlatforms: record.automationPlatforms,
      automationDefault: record.automationDefault,
      billingInterval: record.billingInterval,
      mojoSubscriptionId: record.mojoSubscriptionId,
      source: record.source,
      lastVerifiedAt: record.lastVerifiedAt,
      expiresAt: record.expiresAt,
      updatedAt: record.updatedAt,
      entitlements: {
        brandLimit: record.brandLimit,
        brands: record.brands,
        platformLimit: record.platformLimit,
        platforms: record.platforms,
        automationPlatforms: record.automationPlatforms,
        automationDefault: record.automationDefault,
      },
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
