import assert from "node:assert/strict";
import {
  buildInsertComposerScript,
  buildOpenMediaPickerScript,
  getPlatformBrowserAdapter,
  insertPlatformComposerText,
  openPlatformMediaPicker,
  platformCanStageInBrowser,
  platformStagingPlan,
} from "../src/index.js";

const x = getPlatformBrowserAdapter("x");
assert.equal(x.stageMode, "assisted");
assert.equal(x.supportsTextInsert, true);
assert.equal(x.supportsMediaPicker, true);
assert.equal(x.mediaRequired, false);
assert.equal(platformCanStageInBrowser("x"), true);
assert.equal(platformStagingPlan("x", { media: [] }).mediaState, "optional");

const instagram = getPlatformBrowserAdapter("instagram");
assert.equal(instagram.stageMode, "manual");
assert.equal(instagram.supportsTextInsert, false);
assert.equal(instagram.mediaRequired, true);
assert.equal(platformCanStageInBrowser("instagram"), true);
assert.match(buildInsertComposerScript("hello", "instagram"), /does not have an assisted composer selector yet/);
assert.match(platformStagingPlan("instagram", { media: [] }).blockers.join(" "), /requires media/);
assert.equal(platformStagingPlan("instagram", { media: ["image.png"] }).mediaState, "attached");

const reddit = getPlatformBrowserAdapter("reddit");
assert.equal(reddit.stageMode, "monitoring_only");
assert.equal(platformCanStageInBrowser("reddit"), false);
assert.match(platformStagingPlan("reddit").blockers.join(" "), /monitoring-only/);

assert.deepEqual(
  await insertPlatformComposerText({
    executeJavaScript: async () => ({ ok: true, reason: "composer text inserted" }),
  }, "hello", "x"),
  { ok: true, reason: "composer text inserted" },
);

assert.deepEqual(
  await insertPlatformComposerText({}, "hello", "linkedin"),
  { ok: false, manual: true, reason: "LinkedIn compose opened. Paste the copied draft manually until its adapter is proven." },
);

assert.deepEqual(
  await openPlatformMediaPicker({}, "facebook"),
  { ok: false, manual: true, reason: "Facebook media upload is manual until its adapter is proven." },
);

assert.deepEqual(
  await insertPlatformComposerText({}, "hello", "reddit"),
  { ok: false, manual: false, reason: "Reddit is monitoring-only." },
);

assert.match(buildOpenMediaPickerScript("x"), /media input selector missing/);
assert.match(buildOpenMediaPickerScript("tiktok"), /does not have an assisted media picker selector yet/);

console.log("All Diamond platform browser adapter tests passed.");
