import { createTenantContext } from "./tenant-context.js";

export function createSeedWorkspace() {
  const context = createTenantContext({
    companyId: "Aesop Academy",
    brandId: "The Card",
    platform: "x",
    socialAccountId: "the-card-main",
    campaignId: "world-cup-2026",
    approvalPolicyId: "default-risk-review",
    browserProfileId: "aesop-the-card-x-main",
    postingMode: "stage_for_review",
  });

  return {
    companies: [
      {
        id: context.companyId,
        name: "Aesop Academy",
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
