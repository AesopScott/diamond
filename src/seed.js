import { createTenantContext } from "./tenant-context.js";

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
    socialAccounts: [
      {
        id: context.socialAccountId,
        companyId: context.companyId,
        brandId: context.brandId,
        platform: context.platform,
        accountUrl: "https://x.com/",
        loginUrl: "https://x.com/i/flow/login",
        composeUrl: "https://x.com/compose/post",
        expectedHost: "x.com",
        sessionStatus: "unknown",
        browserProfileId: context.browserProfileId,
      },
    ],
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
        offer: "$1,000 total payouts for the World Cup campaign.",
        referenceAccounts: [
          "@FIFAWorldCup",
          "@FOXSoccer",
          "@MenInBlazers",
        ],
      },
    ],
    editorialSlots: [
      {
        id: "slot-world-cup-launch",
        companyId: context.companyId,
        brandId: context.brandId,
        campaignId: context.campaignId,
        platform: context.platform,
        socialAccountId: context.socialAccountId,
        topic: "World Cup free league launch",
        language: "en",
        assetNeed: "country leaderboard image",
        status: "planned",
        plannedAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        approvalDeadline: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ],
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
    socialTemplates: [
      {
        id: "world-cup-leaderboard-template",
        companyId: context.companyId,
        brandId: context.brandId,
        campaignId: context.campaignId,
        platform: context.platform,
        type: "leaderboard",
        language: "en",
        safeZone: "Center 80%; avoid text at top/bottom edges.",
        notes: "Template record for later image renderer build.",
        createdAt: new Date().toISOString(),
      },
    ],
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
    context,
  };
}
