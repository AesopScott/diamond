import assert from "node:assert/strict";
import {
  createPolarisBridgeDescriptor,
  createSeedWorkspace,
  triggerDiamondRoutine,
} from "../src/index.js";

const workspace = createSeedWorkspace();
workspace.editorialSlots[0].plannedAt = "2026-05-11T12:00:00.000Z";
const { workspace: next, result } = triggerDiamondRoutine(workspace, {
  routine: "run-due-slots",
  context: workspace.context,
  now: "2026-05-11T12:05:00.000Z",
});

assert.equal(result.routine, "run-due-slots");
assert.equal(result.generatedCount, 1);
assert.equal(result.skippedCount, 0);
assert.equal(result.generatedDraftIds.length, 1);
assert.equal(next.drafts.length, 1);
assert.equal(next.editorialSlots[0].status, "drafted");
assert.equal(next.routineRuns.length, 1);
assert.equal(result.syncSummary.postDrafts, 1);

const future = createSeedWorkspace();
future.editorialSlots[0].plannedAt = "2026-05-11T14:00:00.000Z";
const futureRun = triggerDiamondRoutine(future, {
  routine: "run-due-slots",
  context: future.context,
  now: "2026-05-11T12:05:00.000Z",
});
assert.equal(futureRun.result.generatedCount, 0);
assert.equal(futureRun.result.skippedCount, 1);

const forced = triggerDiamondRoutine(future, {
  routine: "generate-next-slot",
  context: future.context,
  now: "2026-05-11T12:05:00.000Z",
});
assert.equal(forced.result.generatedCount, 1);

const descriptor = createPolarisBridgeDescriptor({ statePath: "C:/Users/scott/AppData/Roaming/Diamond/state.json" });
assert.equal(descriptor.standaloneFallback, true);
assert.match(descriptor.routineCommand, /npm run bridge/);
assert.ok(descriptor.syncCollections.includes("postDrafts"));

console.log("All Diamond Polaris bridge tests passed.");
