import assert from "node:assert/strict";
import {
  PLATFORMS,
  createSeedWorkspace,
  defaultComposeUrlForPlatform,
  defaultExpectedHostForPlatform,
  defaultLoginUrlForPlatform,
  isMonitoringOnlyPlatform,
  normalizeAccountUrl,
  platformLabel,
  resolveComposeUrl,
  resolveLoginUrl,
} from "../src/index.js";

const expectedPlatforms = ["x", "instagram", "tiktok", "linkedin", "youtube-shorts", "facebook", "reddit"];
assert.deepEqual(PLATFORMS, expectedPlatforms);

assert.equal(platformLabel("x"), "X");
assert.equal(platformLabel("instagram"), "Instagram");
assert.equal(platformLabel("youtube-shorts"), "YouTube Shorts");

assert.equal(defaultLoginUrlForPlatform("instagram"), "https://www.instagram.com/accounts/login/");
assert.equal(defaultComposeUrlForPlatform("tiktok"), "https://www.tiktok.com/upload");
assert.equal(defaultExpectedHostForPlatform("linkedin"), "linkedin.com");
assert.equal(normalizeAccountUrl("thecard", "instagram"), "https://www.instagram.com/thecard");
assert.equal(normalizeAccountUrl("thecard", "facebook"), "https://www.facebook.com/thecard");
assert.equal(normalizeAccountUrl("thecard", "reddit"), "https://www.reddit.com/user/thecard");
assert.equal(isMonitoringOnlyPlatform("reddit"), true);
assert.equal(isMonitoringOnlyPlatform("facebook"), false);

const workspace = createSeedWorkspace();
const seededPlatforms = workspace.socialAccounts.map((account) => account.platform);
assert.deepEqual(seededPlatforms, expectedPlatforms);
assert.equal(new Set(workspace.socialAccounts.map((account) => account.browserProfileId)).size, expectedPlatforms.length);

expectedPlatforms.forEach((platform) => {
  const account = workspace.socialAccounts.find((item) => item.platform === platform);
  assert.ok(account, `${platform} account should exist`);
  assert.equal(account.companyId, workspace.context.companyId);
  assert.equal(account.brandId, workspace.context.brandId);
  assert.equal(resolveLoginUrl(account), defaultLoginUrlForPlatform(platform));
  assert.equal(resolveComposeUrl(account), defaultComposeUrlForPlatform(platform));
});

const templatePlatforms = new Set(workspace.socialTemplates.map((template) => template.platform));
assert.deepEqual([...templatePlatforms], expectedPlatforms);

const slotPlatforms = new Set(workspace.editorialSlots.map((slot) => slot.platform));
assert.deepEqual([...slotPlatforms], expectedPlatforms);
assert.equal(workspace.editorialSlots.find((slot) => slot.platform === "reddit").assetNeed, "monitoring brief");

console.log("All Diamond platform expansion tests passed.");

