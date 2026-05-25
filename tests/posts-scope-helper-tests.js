import assert from "node:assert/strict";
import {
  TOGGLEABLE_PLATFORMS,
  computeCompanyCascade,
  computeBrandCascade,
  applyDraftScope,
  platformDraftExists,
  removePlatformDraft,
} from "../src/renderer/posts-scope-helpers.js";

// ── TOGGLEABLE_PLATFORMS ──────────────────────────────────────────────────────

assert.ok(Array.isArray(TOGGLEABLE_PLATFORMS), "is an array");
assert.ok(!TOGGLEABLE_PLATFORMS.includes("reddit"), "reddit excluded");
assert.ok(TOGGLEABLE_PLATFORMS.includes("x"), "x included");
assert.ok(TOGGLEABLE_PLATFORMS.includes("instagram"), "instagram included");
assert.ok(TOGGLEABLE_PLATFORMS.includes("linkedin"), "linkedin included");
assert.ok(TOGGLEABLE_PLATFORMS.includes("youtube-shorts"), "youtube-shorts included");
assert.ok(TOGGLEABLE_PLATFORMS.includes("facebook"), "facebook included");
assert.ok(TOGGLEABLE_PLATFORMS.includes("pinterest"), "pinterest included");

// ── computeCompanyCascade ─────────────────────────────────────────────────────

const brands = [
  { id: "brand-a", companyId: "co-1" },
  { id: "brand-b", companyId: "co-2" },
];
const campaigns = [
  { id: "camp-a1", companyId: "co-1", brandId: "brand-a" },
  { id: "camp-b1", companyId: "co-2", brandId: "brand-b" },
];

// Matching brand and campaign — full cascade.
const cc1 = computeCompanyCascade("co-1", brands, campaigns);
assert.equal(cc1.companyId, "co-1");
assert.equal(cc1.brandId, "brand-a");
assert.equal(cc1.campaignId, "camp-a1");

// No matching brand → brand and campaign default to empty string (no cross-company fallback).
const cc2 = computeCompanyCascade("co-99", brands, campaigns);
assert.equal(cc2.companyId, "co-99");
assert.equal(cc2.brandId, "");
assert.equal(cc2.campaignId, "");

// Empty companyId → all empty.
const cc3 = computeCompanyCascade("", brands, campaigns);
assert.equal(cc3.companyId, "");
assert.equal(cc3.brandId, "");
assert.equal(cc3.campaignId, "");

// Brand exists but no campaign yet → campaign is empty, not undefined.
const noCampaignBrands = [{ id: "brand-z", companyId: "co-3" }];
const cc4 = computeCompanyCascade("co-3", noCampaignBrands, campaigns);
assert.equal(cc4.brandId, "brand-z");
assert.equal(cc4.campaignId, "");
assert.equal(typeof cc4.campaignId, "string", "campaignId is always a string");

// Empty arrays — all empty.
const cc5 = computeCompanyCascade("co-1", [], []);
assert.equal(cc5.brandId, "");
assert.equal(cc5.campaignId, "");

// ── computeBrandCascade ───────────────────────────────────────────────────────

// Matching campaign.
const bc1 = computeBrandCascade("co-1", "brand-a", campaigns);
assert.equal(bc1.companyId, "co-1");
assert.equal(bc1.brandId, "brand-a");
assert.equal(bc1.campaignId, "camp-a1");

// No matching campaign → empty string, not undefined.
const bc2 = computeBrandCascade("co-1", "brand-z", campaigns);
assert.equal(bc2.campaignId, "");
assert.equal(typeof bc2.campaignId, "string");

// Empty brandId → campaignId empty.
const bc3 = computeBrandCascade("co-1", "", campaigns);
assert.equal(bc3.brandId, "");
assert.equal(bc3.campaignId, "");

// ── applyDraftScope ───────────────────────────────────────────────────────────

const original = {
  id: "draft-1",
  postPackageId: "pkg-1",
  platform: "x",
  text: "hello",
  context: {
    companyId: "old-co",
    brandId: "old-brand",
    campaignId: "old-camp",
    platform: "x",
    socialAccountId: "acct-1",
  },
  companyId: "old-co",
  brandId: "old-brand",
  campaignId: "old-camp",
  generationStatus: "ok",
  extra: "preserved",
};

const scope = { companyId: "new-co", brandId: "new-brand", campaignId: "new-camp" };
const updated = applyDraftScope(original, scope);

// Returns a new object — input is never mutated.
assert.notStrictEqual(updated, original, "returns new object");
assert.equal(original.companyId, "old-co", "original.companyId unchanged");
assert.equal(original.brandId, "old-brand", "original.brandId unchanged");
assert.equal(original.campaignId, "old-camp", "original.campaignId unchanged");
assert.equal(original.generationStatus, "ok", "original.generationStatus unchanged");
assert.deepEqual(
  original.context,
  { companyId: "old-co", brandId: "old-brand", campaignId: "old-camp", platform: "x", socialAccountId: "acct-1" },
  "original.context unchanged"
);

// Scope fields updated.
assert.equal(updated.companyId, "new-co");
assert.equal(updated.brandId, "new-brand");
assert.equal(updated.campaignId, "new-camp");
assert.equal(updated.context.companyId, "new-co");
assert.equal(updated.context.brandId, "new-brand");
assert.equal(updated.context.campaignId, "new-camp");

// Non-scope context fields preserved.
assert.equal(updated.context.platform, "x");
assert.equal(updated.context.socialAccountId, "acct-1");

// generationStatus always set to "needs-attention".
assert.equal(updated.generationStatus, "needs-attention");

// Other top-level fields preserved.
assert.equal(updated.id, "draft-1");
assert.equal(updated.platform, "x");
assert.equal(updated.text, "hello");
assert.equal(updated.extra, "preserved");

// Empty scope values → empty strings (not undefined).
const empty = applyDraftScope(original, { companyId: "", brandId: "", campaignId: "" });
assert.equal(empty.companyId, "");
assert.equal(empty.brandId, "");
assert.equal(empty.campaignId, "");
assert.equal(empty.context.companyId, "");
assert.equal(empty.generationStatus, "needs-attention");

// ── platformDraftExists ───────────────────────────────────────────────────────

const drafts = [
  { postPackageId: "pkg-1", platform: "x" },
  { postPackageId: "pkg-1", platform: "instagram" },
  { postPackageId: "pkg-2", platform: "x" },
];

assert.equal(platformDraftExists(drafts, "pkg-1", "x"), true, "matching package+platform");
assert.equal(platformDraftExists(drafts, "pkg-1", "tiktok"), false, "platform absent");
assert.equal(platformDraftExists(drafts, "pkg-99", "x"), false, "package absent");
assert.equal(platformDraftExists([], "pkg-1", "x"), false, "empty array");

// ── removePlatformDraft ───────────────────────────────────────────────────────

const after = removePlatformDraft(drafts, "pkg-1", "x");

// Correct count.
assert.equal(after.length, 2, "removes exactly one draft");

// Target removed.
assert.ok(!after.some((d) => d.postPackageId === "pkg-1" && d.platform === "x"), "target removed");

// Other drafts preserved.
assert.ok(after.some((d) => d.postPackageId === "pkg-1" && d.platform === "instagram"), "same-package other platform preserved");
assert.ok(after.some((d) => d.postPackageId === "pkg-2" && d.platform === "x"), "other-package same platform preserved");

// Original array not mutated.
assert.equal(drafts.length, 3, "input array unchanged");

// No-op when draft not found.
const noop = removePlatformDraft(drafts, "pkg-1", "tiktok");
assert.equal(noop.length, 3, "no-op when not found");

// Empty array.
const fromEmpty = removePlatformDraft([], "pkg-1", "x");
assert.equal(fromEmpty.length, 0, "empty array no-op");

console.log("All Diamond posts-scope-helper tests passed.");
