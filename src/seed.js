import { createTenantContext } from "./tenant-context.js";
import { defaultComposeUrlForPlatform, defaultExpectedHostForPlatform, defaultLoginUrlForPlatform, normalizeAccountUrl } from "./social-account.js";

const EXPANSION_PLATFORMS = Object.freeze([
  "x",
  "instagram",
  "tiktok",
  "linkedin",
  "youtube-shorts",
  "facebook",
  "reddit",
]);

export function createSeedWorkspace() {
  const context = createTenantContext({
    companyId: "thecard.bet",
    brandId: "The Card",
    platform: "x",
    socialAccountId: "the-card-main",
    campaignId: "world-cup-2026",
    approvalPolicyId: "default-risk-review",
    browserProfileId: "thecard-bet-x-main",
    postingMode: "stage_for_review",
  });

  return {
    companies: [
      {
        id: context.companyId,
        name: "thecard.bet",
        defaultApprovalPolicyId: context.approvalPolicyId,
      },
    ],
    brands: [
      {
        id: context.brandId,
        companyId: context.companyId,
        name: "The Card",
        languages: ["en", "es"],
      },
    ],
    socialAccounts: EXPANSION_PLATFORMS.map((platform) => createSeedSocialAccount(context, platform)),
    campaigns: [
      {
        id: context.campaignId,
        companyId: context.companyId,
        brandId: context.brandId,
        name: "World Cup 2026",
        status: "planning",
      },
    ],
    contentStrategies: [
      {
        id: "world-cup-2026-strategy",
        companyId: context.companyId,
        brandId: context.brandId,
        campaignId: context.campaignId,
        goals: [
          "Drive free World Cup league signups.",
          "Make the leaderboard feel active before launch.",
          "Position thecard.bet as a sports prediction game, not a sportsbook.",
        ],
        audience: [
          "World Cup fans who like picks, brackets, and friendly competition.",
          "Sports fans who want a free contest with visible standings.",
        ],
        pillars: [
          "Country pride",
          "Leaderboard movement",
          "Prize clarity",
          "Matchday urgency",
          "Free-to-play onboarding",
        ],
        cta: "Join the free World Cup league at thecard.bet.",
        ctaEs: "Unete gratis a la liga del Mundial en thecard.bet.",
        offer: "$1,000 total payouts for the World Cup campaign.",
        offerEs: "$1,000 en premios totales para la campana del Mundial.",
        referenceAccounts: [
          "@FIFAWorldCup",
          "@FOXSoccer",
          "@MenInBlazers",
        ],
      },
    ],
    editorialSlots: EXPANSION_PLATFORMS.map((platform, index) => createSeedEditorialSlot(context, platform, index)),
    assetLibrary: [
      {
        id: "world-cup-leaderboard-placeholder",
        companyId: context.companyId,
        brandId: context.brandId,
        campaignId: context.campaignId,
        platform: context.platform,
        language: "en",
        type: "leaderboard",
        filePath: "assets/world-cup-leaderboard-placeholder.png",
        altText: "World Cup league leaderboard card for thecard.bet.",
        safeZone: "Keep text and flags inside center 80% for social crop safety.",
        notes: "Placeholder record until rendered templates exist.",
        doNotUse: false,
        createdAt: new Date().toISOString(),
      },
    ],
    socialTemplates: EXPANSION_PLATFORMS.flatMap((platform) => createSeedTemplates(context, platform)),
    brandLibraries: [
      {
        id: "the-card-brand-library",
        companyId: context.companyId,
        brandId: context.brandId,
        voice: "Sharp, plainspoken, sports-smart, and useful. Speak as thecard.bet, not Aesop Academy.",
        approvedPhrases: [
          "free World Cup league",
          "make your picks",
          "leaderboard",
          "thecard.bet",
        ],
        bannedPhrases: [
          "guaranteed win",
          "risk-free profit",
          "Aesop Academy",
        ],
        links: [
          "https://thecard.bet",
        ],
        identityRules: [
          "Post as thecard.bet.",
          "Do not pretend to be an individual fan.",
          "Do not call The Card a sportsbook or gambling product.",
        ],
      },
    ],
    claimLibraries: [
      {
        id: "the-card-claim-library",
        companyId: context.companyId,
        brandId: context.brandId,
        prizeLanguage: [
          "$1,000 total payouts",
          "$500 to the winner",
          "$250 to the runner-up",
          "$100 to third place",
          "$50 for fourth through sixth",
        ],
        freeToPlayLanguage: [
          "free to play",
          "free World Cup league",
          "no purchase required",
          "gratis para jugar",
          "liga gratis del Mundial",
          "no se requiere compra",
        ],
        requiresReviewClaims: [
          "prize",
          "payout",
          "winner",
          "cash",
          "paid league",
          "membership",
          "investment",
          "equity",
        ],
        blockedClaims: [
          "guaranteed profit",
          "guaranteed payout",
          "risk-free",
          "licensed sportsbook",
        ],
      },
    ],
    approvalPolicies: [
      {
        id: context.approvalPolicyId,
        companyId: context.companyId,
        reviewRequiredFlags: [
          "money",
          "prize",
          "gambling",
          "regulatory",
          "legal",
          "equity",
          "investment",
          "support_sensitive",
          "hostile",
        ],
        blockedFlags: [],
      },
    ],
    cadencePolicies: [
      {
        id: "world-cup-2026-cadence",
        companyId: context.companyId,
        brandId: context.brandId,
        campaignId: context.campaignId,
        maxPostsPerDay: 3,
        maxRepliesPerHour: 8,
        quietHoursStart: 22,
        quietHoursEnd: 7,
        cooldownMinutes: 45,
        duplicateLookbackDays: 14,
        doNotEngageTerms: [
          "lawsuit",
          "subpoena",
          "chargeback",
          "scam",
          "fraud",
        ],
        escalationTerms: [
          "regulator",
          "attorney",
          "press",
          "investor",
          "threat",
        ],
      },
    ],
    context,
  };
}

export function createSeedSocialAccount(context, platform) {
  const id = platform === "x" ? context.socialAccountId : `the-card-${platform}`;
  return {
    id,
    companyId: context.companyId,
    brandId: context.brandId,
    platform,
    accountUrl: platform === "x" ? "https://x.com/" : normalizeAccountUrl("", platform),
    loginUrl: defaultLoginUrlForPlatform(platform),
    composeUrl: defaultComposeUrlForPlatform(platform),
    expectedHost: defaultExpectedHostForPlatform(platform),
    sessionStatus: "unknown",
    browserProfileId: platform === "x" ? context.browserProfileId : `${context.companyId}-${platform}-${id}`,
    monitoringOnly: platform === "reddit",
  };
}

function createSeedEditorialSlot(context, platform, index) {
  const account = createSeedSocialAccount(context, platform);
  return {
    id: `slot-world-cup-launch-${platform}`,
    companyId: context.companyId,
    brandId: context.brandId,
    campaignId: context.campaignId,
    platform,
    socialAccountId: account.id,
    topic: platform === "reddit" ? "World Cup community monitoring" : "World Cup free league launch",
    language: "en",
    assetNeed: platform === "reddit" ? "monitoring brief" : "country leaderboard image",
    status: "planned",
    plannedAt: new Date(Date.now() + (index + 2) * 60 * 60 * 1000).toISOString(),
    approvalDeadline: new Date(Date.now() + (index + 1) * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };
}

function createSeedTemplates(context, platform) {
  const base = {
    companyId: context.companyId,
    brandId: context.brandId,
    campaignId: context.campaignId,
    platform,
    language: "en",
    createdAt: new Date().toISOString(),
  };
  return [
    {
      ...base,
      id: `world-cup-leaderboard-template-${platform}`,
      type: "leaderboard",
      safeZone: "Center 80%; avoid text at top/bottom edges.",
      notes: `${platform} leaderboard card template.`,
    },
    {
      ...base,
      id: `world-cup-prize-template-${platform}`,
      type: "prize",
      safeZone: "Center 80%; keep payout numbers away from all crop edges.",
      notes: `${platform} World Cup payout card template.`,
    },
    {
      ...base,
      id: `world-cup-country-template-${platform}`,
      type: "country",
      safeZone: "Flag/icon left; headline and CTA stay inside center-right safe area.",
      notes: `${platform} country leaderboard campaign card template.`,
    },
  ];
}
