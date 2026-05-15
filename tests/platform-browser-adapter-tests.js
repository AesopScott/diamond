import assert from "node:assert/strict";
import {
  buildCandidateComposerScript,
  buildCandidateMediaPickerScript,
  buildInsertComposerScript,
  buildOpenMediaPickerScript,
  getPlatformBrowserAdapter,
  insertPlatformComposerText,
  openPlatformMediaPicker,
  platformCanStageInBrowser,
  platformHasCandidateComposerAdapter,
  platformHasCandidateMediaAdapter,
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
assert.equal(platformHasCandidateComposerAdapter("instagram"), true);
assert.equal(platformHasCandidateMediaAdapter("instagram"), true);
assert.equal(instagram.mediaRequired, true);
assert.equal(platformCanStageInBrowser("instagram"), true);
assert.match(buildInsertComposerScript("hello", "instagram"), /does not have an assisted composer selector yet/);
assert.match(buildCandidateComposerScript("hello", "instagram"), /caption/i);
assert.match(buildCandidateMediaPickerScript("instagram"), /platform file picker opened/);
assert.match(platformStagingPlan("instagram", { media: [] }).blockers.join(" "), /requires media/);
assert.equal(platformStagingPlan("instagram", { media: [] }).candidateTextInsert, true);
assert.equal(platformStagingPlan("instagram", { media: ["image.png"] }).mediaState, "attached");

const linkedin = getPlatformBrowserAdapter("linkedin");
assert.equal(linkedin.stageMode, "manual");
assert.equal(platformHasCandidateComposerAdapter("linkedin"), true);
assert.match(buildCandidateComposerScript("hello", "linkedin"), /ql-editor/);

const facebook = getPlatformBrowserAdapter("facebook");
assert.equal(facebook.stageMode, "manual");
assert.equal(platformHasCandidateComposerAdapter("facebook"), true);
assert.match(buildCandidateComposerScript("hello", "facebook"), /contenteditable/);

assert.equal(platformHasCandidateComposerAdapter("reddit"), false);

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
