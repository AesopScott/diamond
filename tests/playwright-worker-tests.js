import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  buildPlaywrightProfilePath,
  stagePostWithPlaywright,
  validatePlaywrightStageInput,
} from "../src/playwright-worker.js";
import { createSeedWorkspace } from "../src/seed.js";

const workspace = createSeedWorkspace();
const context = workspace.context;
const account = workspace.socialAccounts.find((item) => item.id === context.socialAccountId);
const root = fs.mkdtempSync(path.join(os.tmpdir(), "diamond-worker-"));
const mediaPath = path.join(root, "asset.png");
fs.writeFileSync(mediaPath, "fake-png");

const profilePath = buildPlaywrightProfilePath(root, context);
assert.match(profilePath, /browser-profiles/);
assert.match(profilePath, /playwright/);

const validInput = {
  appDir: root,
  screenshotsDir: path.join(root, "screenshots"),
  context,
  account,
  composeUrl: account.composeUrl,
  text: "Join the free World Cup league at thecard.bet.",
  media: [mediaPath],
  screenshotName: "worker-test",
  headless: true,
};
assert.equal(validatePlaywrightStageInput(validInput).ok, true);
assert.equal(validatePlaywrightStageInput({ ...validInput, media: [path.join(root, "missing.png")] }).ok, false);
assert.equal(validatePlaywrightStageInput({ ...validInput, account: { ...account, platform: "instagram" } }).ok, false);
assert.equal(validatePlaywrightStageInput({
  ...validInput,
  context: { ...context, platform: "instagram" },
  account: { ...workspace.socialAccounts.find((item) => item.platform === "instagram"), browserProfileId: "ig-profile" },
  composeUrl: "https://www.instagram.com/",
  allowCandidateAdapters: true,
}).ok, true);

const actions = [];
const fakePage = {
  goto: async (url) => actions.push(["goto", url]),
  locator: (selector) => ({
    first: () => ({
      waitFor: async (input) => actions.push(["waitFor", selector, input.state]),
      click: async () => actions.push(["click", selector]),
      fill: async (text) => actions.push(["fill", text]),
      innerText: async () => validInput.text,
      setInputFiles: async (files) => actions.push(["setInputFiles", files]),
    }),
  }),
  screenshot: async ({ path: target }) => {
    fs.writeFileSync(target, "fake-screenshot");
    actions.push(["screenshot", target]);
  },
  url: () => validInput.composeUrl,
};
const fakeContext = {
  pages: () => [fakePage],
  close: async () => actions.push(["close"]),
};
const fakeDriver = {
  launchPersistentContext: async (userDataDir, options) => {
    actions.push(["launch", userDataDir, options.headless]);
    return fakeContext;
  },
};

const result = await stagePostWithPlaywright(validInput, fakeDriver);
assert.equal(result.ok, true);
assert.equal(result.status, "staged");
assert.match(result.reason, /Composer text inserted/);
assert.match(result.reason, /Attached 1 media/);
assert.equal(fs.existsSync(result.screenshotPath), true);
assert.deepEqual(actions.map((item) => item[0]), [
  "launch",
  "goto",
  "waitFor",
  "click",
  "fill",
  "waitFor",
  "setInputFiles",
  "screenshot",
  "close",
]);

const instagramAccount = workspace.socialAccounts.find((item) => item.platform === "instagram");
const candidateResult = await stagePostWithPlaywright({
  ...validInput,
  context: { ...context, platform: "instagram", socialAccountId: instagramAccount.id, browserProfileId: instagramAccount.browserProfileId },
  account: instagramAccount,
  composeUrl: "https://www.instagram.com/",
  allowCandidateAdapters: true,
}, fakeDriver);
assert.equal(candidateResult.ok, true);
assert.equal(candidateResult.candidateAdapter, true);

console.log("All Diamond Playwright worker tests passed.");
