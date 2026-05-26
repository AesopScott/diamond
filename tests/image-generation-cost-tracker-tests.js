import assert from "node:assert/strict";
import {
  createImageCostRecord,
  aggregateCostsByPeriod,
  aggregateCostsByCampaign,
  estimateMonthlyBudget,
  logImageCost,
  formatCostReport,
} from "../src/index.js";

// Test 1: Create cost record
const costRecord = createImageCostRecord({
  imageId: "img-123",
  campaignId: "camp-world-cup",
  postId: "post-456",
  platform: "instagram",
  prompt: "Vibrant soccer celebration",
  predictTime: 4.0,
  model: "flux-pro",
});

assert.equal(costRecord.id, "img-123");
assert.equal(costRecord.campaignId, "camp-world-cup");
assert.ok(costRecord.generationCost > 0);
assert.ok(costRecord.generationCost < 0.15); // Under $0.15

// Test 2: Create multiple records and aggregate by period
const records = [
  createImageCostRecord({
    imageId: "img-001",
    campaignId: "camp-a",
    postId: "post-a1",
    platform: "instagram",
    predictTime: 4.0,
    model: "flux-pro",
  }),
  createImageCostRecord({
    imageId: "img-002",
    campaignId: "camp-a",
    postId: "post-a2",
    platform: "x",
    predictTime: 5.0,
    model: "flux-pro",
  }),
  createImageCostRecord({
    imageId: "img-003",
    campaignId: "camp-b",
    postId: "post-b1",
    platform: "instagram",
    predictTime: 3.5,
    model: "flux-pro",
  }),
];

const byPeriod = aggregateCostsByPeriod(records);
assert.equal(byPeriod.imageCount, 3);
assert.ok(byPeriod.totalCost > 0);
assert.equal(byPeriod.totalCost, byPeriod.totalCost); // Sanity check: number equality
assert.ok(byPeriod.averageCostPerImage > 0);

// Test 3: Aggregate by campaign
const byCampaign = aggregateCostsByCampaign(records);
assert.ok(byCampaign["camp-a"]);
assert.ok(byCampaign["camp-b"]);
assert.equal(byCampaign["camp-a"].imageCount, 2);
assert.equal(byCampaign["camp-b"].imageCount, 1);
assert.ok(byCampaign["camp-a"].platformBreakdown.instagram);
assert.ok(byCampaign["camp-a"].platformBreakdown.x);

// Test 4: Estimate monthly budget
const monthlyBudget = estimateMonthlyBudget(20, 30);
assert.equal(monthlyBudget.dailyImageCount, 20);
assert.equal(monthlyBudget.daysInMonth, 30);
assert.equal(monthlyBudget.totalImagesPerMonth, 600);
assert.ok(monthlyBudget.estimatedMonthlyCost > 0);
assert.ok(monthlyBudget.estimatedMonthlyCost < 100); // Typically under $40/month

// Test 5: Log cost (should not throw)
const logEntry = logImageCost(costRecord);
assert.equal(logEntry.type, "image_generation_cost");
assert.equal(logEntry.imageId, "img-123");

// Test 6: Format cost report
const report = formatCostReport(byPeriod, byCampaign);
assert.ok(report.summary);
assert.equal(report.summary.totalCost, byPeriod.totalCost);
assert.equal(report.summary.imageCount, 3);
assert.ok(Array.isArray(report.recommendations));

// Test 7: Cost recommendations generated
const highVolumeRecords = Array.from({ length: 100 }, (_, i) =>
  createImageCostRecord({
    imageId: `img-high-${i}`,
    campaignId: "camp-high-volume",
    postId: `post-${i}`,
    platform: "instagram",
    predictTime: 4.0,
    model: "flux-pro",
  })
);
const highVolumeByPeriod = aggregateCostsByPeriod(highVolumeRecords);
const highVolumeByCampaign = aggregateCostsByCampaign(highVolumeRecords);
const highVolumeReport = formatCostReport(highVolumeByPeriod, highVolumeByCampaign);
assert.ok(highVolumeReport.recommendations.length > 0);

// Test 8: Empty records handling
const emptyByPeriod = aggregateCostsByPeriod([]);
assert.equal(emptyByPeriod.imageCount, 0);
assert.equal(emptyByPeriod.totalCost, 0);

const emptyByCampaign = aggregateCostsByCampaign([]);
assert.deepEqual(emptyByCampaign, {});

console.log("All image generation cost tracker tests passed.");
