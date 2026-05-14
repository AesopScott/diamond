import assert from "node:assert/strict";
import {
  buildFirestoreSyncBundle,
  createDiamondLicense,
  createSeedWorkspace,
  resolveFirebaseAdminConfig,
  summarizeFirestoreSyncBundle,
} from "../src/index.js";

const missing = resolveFirebaseAdminConfig({ env: {} });
assert.equal(missing.ok, false);
assert.equal(missing.source, "missing");

const fromGoogle = resolveFirebaseAdminConfig({
  env: {
    GOOGLE_APPLICATION_CREDENTIALS: "C:/secrets/service-account.json",
    FIREBASE_PROJECT_ID: "diamond-test",
  },
});
assert.equal(fromGoogle.ok, true);
assert.equal(fromGoogle.source, "env");
assert.equal(fromGoogle.projectId, "diamond-test");
assert.match(fromGoogle.redactedPath, /service-account\.json$/);
assert.ok(!fromGoogle.redactedPath.includes("secrets") || fromGoogle.redactedPath.startsWith(".../"));

const workspace = createSeedWorkspace();
workspace.drafts = [{ id: "draft-1", context: workspace.context, text: "Hello" }];
workspace.postPackages = [{ id: "package-1", context: workspace.context, ideaText: "Hello" }];
workspace.platformDrafts = [{ id: "platform-draft-1", context: workspace.context, postPackageId: "package-1", text: "Hello" }];
workspace.scheduledPosts = [{ id: "schedule-1", context: workspace.context }];
workspace.postRuns = [{ id: "run-1", context: workspace.context, metrics: { impressions: 100, clicks: 10 } }];
workspace.socialReplies = [{ id: "reply-1", context: workspace.context }];
workspace.socialResponseDrafts = [{ id: "response-1", context: workspace.context }];
workspace.postMemory = [{ id: "memory-1", context: workspace.context }];
workspace.licenseCache = createDiamondLicense({ userId: "scott", brands: ["the-card"], platforms: ["x"] });

const bundle = buildFirestoreSyncBundle(workspace);
const summary = summarizeFirestoreSyncBundle(bundle);
assert.equal(summary.postDrafts, 1);
assert.equal(summary.postPackages, 1);
assert.equal(summary.platformDrafts, 1);
assert.equal(summary.scheduledPosts, 1);
assert.equal(summary.postRuns, 1);
assert.equal(summary.metrics, 1);
assert.equal(summary.socialReplies, 1);
assert.equal(summary.socialResponseDrafts, 1);
assert.equal(summary.postMemory, 1);
assert.equal(summary.licensePortal, 1);
assert.equal(bundle.collections.metrics[0].runId, "run-1");
assert.equal(bundle.collections.licensePortal[0].path, "products/diamond/licenses/scott");

console.log("All Diamond Firebase sync tests passed.");
