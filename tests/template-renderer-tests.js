import assert from "node:assert/strict";
import {
  buildGeneratedAssetRecord,
  createSeedWorkspace,
  renderWorldCupLeaderboardSvg,
  validateTemplateForRender,
} from "../src/index.js";

const workspace = createSeedWorkspace();
const template = workspace.socialTemplates[0];

assert.equal(validateTemplateForRender(null).ok, false);
assert.equal(validateTemplateForRender({ ...template, safeZone: "" }).ok, false);
assert.equal(validateTemplateForRender(template).ok, true);

const svg = renderWorldCupLeaderboardSvg({
  title: "World Cup Leaderboard",
  subtitle: "Free league standings",
  cta: "Join at thecard.bet",
  rows: [{ name: "Scott", country: "USA", score: "+$500" }],
});
assert.match(svg, /<svg/);
assert.match(svg, /World Cup Leaderboard/);
assert.match(svg, /Scott/);
assert.match(svg, /thecard\.bet/);

const asset = buildGeneratedAssetRecord({
  template,
  filePath: "C:/Diamond/generated-assets/world-cup.svg",
  language: "en",
  type: "leaderboard",
});
assert.equal(asset.companyId, template.companyId);
assert.equal(asset.generatedFromTemplateId, template.id);
assert.equal(asset.type, "leaderboard");
assert.equal(asset.doNotUse, false);
assert.ok(asset.altText);
assert.ok(asset.safeZone);

console.log("All Diamond template renderer tests passed.");
