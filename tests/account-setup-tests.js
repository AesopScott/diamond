import assert from "node:assert/strict";
import {
  buildSocialAccountSetupKit,
  createSeedWorkspace,
  formatSocialAccountSetupKit,
  normalizeDesiredHandle,
  setupStatusLabel,
  signupUrlForPlatform,
} from "../src/index.js";

const workspace = createSeedWorkspace();
const account = workspace.socialAccounts.find((item) => item.platform === "x");
const kit = buildSocialAccountSetupKit({
  company: workspace.companies[0],
  brand: workspace.brands[0],
  campaign: workspace.campaigns[0],
  account,
  strategy: workspace.contentStrategies[0],
  now: "2026-05-11T12:00:00.000Z",
});

assert.equal(signupUrlForPlatform("x"), "https://x.com/i/flow/signup");
assert.equal(signupUrlForPlatform("instagram"), "https://www.instagram.com/accounts/emailsignup/");
assert.equal(setupStatusLabel("created"), "Created");
assert.equal(setupStatusLabel("unknown-value"), "Not started");
assert.equal(normalizeDesiredHandle("The Card!", "x"), "@TheCard");
assert.equal(normalizeDesiredHandle("@The.Card", "instagram"), "The.Card");
assert.equal(kit.companyId, "thecard-bet");
assert.equal(kit.platformName, "X");
assert.equal(kit.signupUrl, "https://x.com/i/flow/signup");
assert.ok(kit.bio.length <= 150);
assert.ok(kit.checklist.some((item) => item.includes("CAPTCHA")));

const formatted = formatSocialAccountSetupKit(kit);
assert.match(formatted, /Official signup: https:\/\/x\.com\/i\/flow\/signup/);
assert.match(formatted, /Human-controlled steps:/);
assert.match(formatted, /Do not reuse passwords/);

console.log("account setup tests passed");
