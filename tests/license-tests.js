import assert from "node:assert/strict";
import {
  buildLicensePortalRecord,
  buildDiamondLicenseModel,
  canStageDraft,
  createDiamondLicense,
  createPostDraft,
  createSeedWorkspace,
  evaluateDiamondAccess,
  evaluateDiamondLicense,
  licenseFirebasePath,
} from "../src/index.js";

const model = buildDiamondLicenseModel({
  brandLimit: 3,
  platformLimit: 4,
  automationPlatforms: ["x"],
});
assert.equal(model.product, "diamond");
assert.equal(model.sourceOfTruth, "firebase");
assert.equal(model.purchaseSystem, "mojo-ai-studio");
assert.equal(model.entitlements.brandLimit, 3);
assert.equal(model.entitlements.platformLimit, 4);
assert.equal(model.entitlements.automationDefault, false);
assert.equal(model.offlineGraceDays, 7);

const license = createDiamondLicense({
  userId: "scott",
  email: "scott@example.com",
  brandLimit: 2,
  brands: ["the-card", "world-cup"],
  platformLimit: 2,
  platforms: ["x", "linkedin"],
  automationPlatforms: ["x"],
  lastVerifiedAt: "2026-05-11T12:00:00.000Z",
});

assert.equal(license.product, "diamond");
assert.equal(license.source, "mojo-ai-studio");
assert.equal(license.firebasePath, "products/diamond/licenses/scott");
assert.equal(license.brandLimit, 2);

const valid = evaluateDiamondLicense(license, {
  requestedBrands: ["the-card", "world-cup"],
  requestedPlatforms: ["x", "linkedin"],
  now: "2026-05-11T13:00:00.000Z",
  online: true,
});
assert.equal(valid.ok, true);
assert.equal(valid.brandLimit, 2);
assert.equal(valid.platformLimit, 2);
assert.deepEqual(valid.automationPlatforms, ["x"]);

const automationAllowed = evaluateDiamondLicense(license, {
  requestedBrands: ["the-card"],
  requestedPlatforms: ["x"],
  requestedAutomationPlatforms: ["x"],
  now: "2026-05-11T13:00:00.000Z",
});
assert.equal(automationAllowed.ok, true);

const automationBlocked = evaluateDiamondLicense(license, {
  requestedBrands: ["the-card"],
  requestedPlatforms: ["linkedin"],
  requestedAutomationPlatforms: ["linkedin"],
  now: "2026-05-11T13:00:00.000Z",
});
assert.equal(automationBlocked.ok, false);
assert.match(automationBlocked.reason, /Automation not licensed/);

const tooManyBrands = evaluateDiamondLicense(license, {
  requestedBrands: ["the-card", "world-cup", "another-brand"],
  requestedPlatforms: ["x"],
  now: "2026-05-11T13:00:00.000Z",
});
assert.equal(tooManyBrands.ok, false);
assert.match(tooManyBrands.reason, /Brand not licensed/);

const brandLimitExceeded = evaluateDiamondLicense({ ...license, brands: ["the-card", "world-cup", "another-brand"] }, {
  requestedBrands: ["the-card", "world-cup", "another-brand"],
  requestedPlatforms: ["x"],
  now: "2026-05-11T13:00:00.000Z",
});
assert.equal(brandLimitExceeded.ok, false);
assert.match(brandLimitExceeded.reason, /Brand limit/);

const tooMany = evaluateDiamondLicense(license, {
  requestedBrands: ["the-card"],
  requestedPlatforms: ["x", "linkedin", "instagram"],
  now: "2026-05-11T13:00:00.000Z",
});
assert.equal(tooMany.ok, false);
assert.match(tooMany.reason, /Platform not licensed/);

const platformLimitExceeded = evaluateDiamondLicense({ ...license, platforms: ["x", "linkedin", "instagram"] }, {
  requestedBrands: ["the-card"],
  requestedPlatforms: ["x", "linkedin", "instagram"],
  now: "2026-05-11T13:00:00.000Z",
});
assert.equal(platformLimitExceeded.ok, false);
assert.match(platformLimitExceeded.reason, /Platform limit/);

const offlineGrace = evaluateDiamondLicense(license, {
  requestedPlatforms: ["x"],
  now: "2026-05-18T11:59:00.000Z",
  online: false,
});
assert.equal(offlineGrace.ok, true);
assert.equal(offlineGrace.graceExpiresAt, "2026-05-18T12:00:00.000Z");

const offlineExpired = evaluateDiamondLicense(license, {
  requestedPlatforms: ["x"],
  now: "2026-05-18T12:01:00.000Z",
  online: false,
});
assert.equal(offlineExpired.ok, false);
assert.match(offlineExpired.reason, /grace window/);

const dev = createDiamondLicense({
  userId: "dev",
  role: "dev",
  status: "active",
  platformLimit: 0,
});
const devCheck = evaluateDiamondLicense(dev, {
  requestedBrands: ["a", "b", "c"],
  requestedPlatforms: ["x", "linkedin", "instagram", "tiktok"],
});
assert.equal(devCheck.ok, true);
assert.equal(devCheck.brandLimit, "unlimited");
assert.equal(devCheck.platformLimit, "unlimited");
assert.equal(devCheck.automationPlatforms, "unlimited");

const wrongProduct = evaluateDiamondLicense({ ...license, product: "polaris" });
assert.equal(wrongProduct.ok, false);
assert.match(wrongProduct.reason, /different product/);

const portal = buildLicensePortalRecord(license);
assert.equal(portal.path, licenseFirebasePath("scott"));
assert.equal(portal.data.product, "diamond");
assert.equal(portal.data.modelVersion, "2026-05-12");
assert.equal(portal.data.source, "mojo-ai-studio");
assert.equal(portal.data.brandLimit, 2);
assert.equal(portal.data.platformLimit, 2);
assert.deepEqual(portal.data.automationPlatforms, ["x"]);
assert.equal(portal.data.entitlements.automationDefault, false);

const workspace = createSeedWorkspace();
const draft = createPostDraft({
  context: workspace.context,
  text: "Join the free World Cup league and chase the leaderboard.",
  approvalPolicy: workspace.approvalPolicies[0],
});
const stageLicense = evaluateDiamondAccess({
  license: createDiamondLicense({
    userId: "licensed-user",
    brandLimit: 1,
    brands: [workspace.context.brandId],
    platformLimit: 1,
    platforms: [workspace.context.platform],
  }),
  context: workspace.context,
});
assert.equal(canStageDraft(draft, { licenseCheck: stageLicense }).ok, true);
const blockedStageLicense = evaluateDiamondAccess({
  license: createDiamondLicense({
    userId: "unlicensed-user",
    brandLimit: 1,
    brands: ["other-brand"],
    platformLimit: 1,
    platforms: [workspace.context.platform],
  }),
  context: workspace.context,
});
assert.equal(canStageDraft(draft, { licenseCheck: blockedStageLicense }).ok, false);

console.log("All Diamond license tests passed.");
