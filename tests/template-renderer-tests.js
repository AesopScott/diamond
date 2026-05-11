import assert from "node:assert/strict";
import {
  buildGeneratedAssetRecord,
  createSeedWorkspace,
  renderWorldCupAssetSvg,
  renderWorldCupLeaderboardSvg,
  renderWorldCupPrizeSvg,
  renderWorldCupCountrySvg,
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

const prizeSvg = renderWorldCupPrizeSvg({ title: "$1,000 World Cup Payouts" });
assert.match(prizeSvg, /\$500/);
assert.match(prizeSvg, /Runner-up/);
assert.match(renderWorldCupAssetSvg("prize"), /\$1,000 World Cup Payouts/);

const countrySvg = renderWorldCupCountrySvg({ country: "USA", flag: "US" });
assert.match(countrySvg, /USA needs you on the board/);
assert.match(countrySvg, /Free league leaderboard/);
assert.match(renderWorldCupAssetSvg("country", { country: "Mexico", flag: "MX" }), /Mexico needs you on the board/);

const spanishLeaderboard = renderWorldCupAssetSvg("leaderboard", { language: "es" });
assert.match(spanishLeaderboard, /Liga del Mundial/);
assert.match(spanishLeaderboard, /Unete en thecard\.bet/);

const spanishPrize = renderWorldCupPrizeSvg({ language: "es" });
assert.match(spanishPrize, /Ganador/);
assert.match(spanishPrize, /premios del Mundial/);

const spanishCountry = renderWorldCupCountrySvg({ language: "es", country: "Mexico", flag: "MX" });
assert.match(spanishCountry, /Mexico te necesita en la tabla/);
assert.match(spanishCountry, /Tabla de la liga gratis/);

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

const prizeAsset = buildGeneratedAssetRecord({
  template: { ...template, id: "world-cup-prize-template", type: "prize" },
  filePath: "C:/Diamond/generated-assets/prize.svg",
  type: "prize",
});
assert.match(prizeAsset.altText, /prize payout/);

const countryAsset = buildGeneratedAssetRecord({
  template: { ...template, id: "world-cup-country-template", type: "country" },
  filePath: "C:/Diamond/generated-assets/country.svg",
  type: "country",
});
assert.match(countryAsset.altText, /country leaderboard/);

const spanishAsset = buildGeneratedAssetRecord({
  template,
  filePath: "C:/Diamond/generated-assets/spanish.svg",
  language: "es",
  type: "leaderboard",
});
assert.match(spanishAsset.altText, /Tarjeta de tabla/);

console.log("All Diamond template renderer tests passed.");
