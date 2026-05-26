// Image generation cost tracking and metrics
// Logs per-image costs, aggregates by campaign and time period

import { extractGenerationCost } from "./replicate-image-service.js";

// Flux Pro pricing model
const COST_PER_SECOND = 0.015; // ~$0.06 for 4-second image
const ESTIMATED_COST_PER_IMAGE = 0.06;

export function createImageCostRecord({
  imageId,
  campaignId,
  postId,
  platform,
  prompt,
  predictTime,
  model,
  cost, // explicit cost from caller; derived from predictTime when absent
}) {
  const generationCost = cost !== undefined ? cost : extractGenerationCost({ predictTime, model });

  return {
    id: imageId || `img-${Date.now()}`,
    campaignId,
    postId,
    platform,
    prompt: prompt || "",
    generationCost,
    predictTime,
    model,
    timestamp: new Date().toISOString(),
    status: "completed",
  };
}

export function aggregateCostsByPeriod(costRecords, periodDays = 30) {
  const now = new Date();
  const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

  const filtered = costRecords.filter((record) => new Date(record.timestamp) >= periodStart);

  const totalCost = filtered.reduce((sum, record) => sum + (record.generationCost || 0), 0);
  const imageCount = filtered.length;

  return {
    periodDays,
    periodStart: periodStart.toISOString(),
    periodEnd: now.toISOString(),
    totalCost: Math.round(totalCost * 100) / 100,
    imageCount,
    averageCostPerImage: imageCount > 0 ? Math.round((totalCost / imageCount) * 100) / 100 : 0,
    estimatedDailyCost: imageCount > 0 ? Math.round((totalCost / periodDays) * 100) / 100 : 0,
    records: filtered,
  };
}

export function aggregateCostsByCampaign(costRecords) {
  const campaigns = {};

  for (const record of costRecords) {
    if (!campaigns[record.campaignId]) {
      campaigns[record.campaignId] = {
        campaignId: record.campaignId,
        totalCost: 0,
        imageCount: 0,
        platformBreakdown: {},
        records: [],
      };
    }

    campaigns[record.campaignId].totalCost += record.generationCost || 0;
    campaigns[record.campaignId].imageCount += 1;
    campaigns[record.campaignId].records.push(record);

    if (!campaigns[record.campaignId].platformBreakdown[record.platform]) {
      campaigns[record.campaignId].platformBreakdown[record.platform] = {
        platform: record.platform,
        cost: 0,
        count: 0,
      };
    }

    campaigns[record.campaignId].platformBreakdown[record.platform].cost += record.generationCost || 0;
    campaigns[record.campaignId].platformBreakdown[record.platform].count += 1;
  }

  // Sort and round
  for (const campaignId in campaigns) {
    const campaign = campaigns[campaignId];
    campaign.totalCost = Math.round(campaign.totalCost * 100) / 100;
    for (const platform in campaign.platformBreakdown) {
      campaign.platformBreakdown[platform].cost = Math.round(campaign.platformBreakdown[platform].cost * 100) / 100;
    }
  }

  return campaigns;
}

export function estimateMonthlyBudget(dailyImageCount = 20, daysInMonth = 30) {
  const totalImages = dailyImageCount * daysInMonth;
  const estimatedCost = totalImages * ESTIMATED_COST_PER_IMAGE;
  return {
    dailyImageCount,
    daysInMonth,
    totalImagesPerMonth: totalImages,
    estimatedMonthlyCost: Math.round(estimatedCost * 100) / 100,
    costPerImage: ESTIMATED_COST_PER_IMAGE,
  };
}

export function logImageCost(costRecord) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: "image_generation_cost",
    imageId: costRecord.id,
    campaignId: costRecord.campaignId,
    postId: costRecord.postId,
    platform: costRecord.platform,
    cost: costRecord.generationCost,
    predictTime: costRecord.predictTime,
    model: costRecord.model,
  };

  return logEntry;
}

export function formatCostReport(aggregatedByPeriod, aggregatedByCampaign) {
  return {
    summary: {
      totalCost: aggregatedByPeriod.totalCost,
      imageCount: aggregatedByPeriod.imageCount,
      averageCostPerImage: aggregatedByPeriod.averageCostPerImage,
      estimatedDailyCost: aggregatedByPeriod.estimatedDailyCost,
      period: `${aggregatedByPeriod.periodDays} days (${aggregatedByPeriod.periodStart.split("T")[0]} to ${aggregatedByPeriod.periodEnd.split("T")[0]})`,
    },
    byCampaign: aggregatedByCampaign,
    recommendations: generateCostRecommendations(aggregatedByPeriod),
  };
}

function generateCostRecommendations(aggregatedByPeriod) {
  const dailyCost = aggregatedByPeriod.estimatedDailyCost;
  const monthlyCost = dailyCost * 30;

  const recommendations = [];

  if (monthlyCost > 100) {
    recommendations.push(
      `Monthly costs are estimated at $${monthlyCost.toFixed(2)}. Consider switching to HeyGen Creator ($29/month) if video generation is needed instead.`
    );
  }

  if (aggregatedByPeriod.imageCount === 0) {
    recommendations.push("No image generation detected. Enable image generation in campaign settings to begin.");
  }

  if (aggregatedByPeriod.averageCostPerImage > 0.08) {
    recommendations.push("Average cost per image is higher than expected. Check for long prompts or high-resolution requests.");
  }

  return recommendations.length > 0
    ? recommendations
    : [
        `Current pace: ${(monthlyCost).toFixed(2)}/month. Image generation is within expected budget.`,
      ];
}
