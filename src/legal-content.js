const legalUpdatedAt = "2026-05-11";

export function getDiamondLegalDocuments() {
  return [
    {
      id: "terms",
      title: "Terms of Service",
      status: "draft",
      updatedAt: legalUpdatedAt,
      summary: "Operator-facing draft terms for Diamond licensing, browser-assisted posting, approvals, acceptable use, and account security.",
      sections: [
        {
          title: "Product",
          body: "Diamond is a social media operating tool that helps licensed users plan, draft, review, stage, schedule, and measure social media activity for their own companies, brands, campaigns, and accounts.",
        },
        {
          title: "Human Approval",
          body: "Diamond is designed to stage work for review. Users remain responsible for reviewing, approving, publishing, and removing content. Auto-publishing, if ever enabled, must remain limited by license, proof, and approval controls.",
        },
        {
          title: "Accounts And Credentials",
          body: "Diamond uses visible browser sessions and isolated browser profiles. It must not store raw social media passwords. Users are responsible for platform account access, two-factor authentication, and compliance with each platform's rules.",
        },
        {
          title: "Acceptable Use",
          body: "Users may not use Diamond to bypass CAPTCHAs, two-factor authentication, platform rate limits, legal restrictions, privacy rights, or account security checks. Users may not use Diamond to impersonate people, fabricate personal experiences, or publish unlawful, deceptive, harassing, or infringing content.",
        },
        {
          title: "Licensing",
          body: "Diamond access is licensed separately from Polaris and other projects. License limits may include brand count, platform count, automation add-ons, user roles, and offline grace windows.",
        },
        {
          title: "No Professional Advice",
          body: "Diamond may help draft marketing and support content, but it does not provide legal, financial, investment, regulatory, tax, or compliance advice. Users should get qualified review for regulated claims, promotions, prizes, equity, billing, privacy, and platform compliance.",
        },
        {
          title: "Audit Trail",
          body: "Diamond may store drafts, schedules, run logs, screenshots, metrics, proof records, replies, and approvals to support review, troubleshooting, and accountability.",
        },
        {
          title: "Draft Status",
          body: "This Terms of Service text is a product draft for implementation and review. It should be reviewed by counsel before public launch or paid distribution.",
        },
      ],
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      status: "draft",
      updatedAt: legalUpdatedAt,
      summary: "Operator-facing draft privacy policy for Diamond data, local browser sessions, Firebase license checks, and social workflow records.",
      sections: [
        {
          title: "Data Diamond Handles",
          body: "Diamond may handle company records, brand records, campaign strategy, social account metadata, browser profile identifiers, drafts, media paths, schedules, replies, response drafts, metrics, screenshots, proof records, and run logs.",
        },
        {
          title: "Local Browser Sessions",
          body: "Diamond stores authenticated browser session data in local Electron browser profiles. Diamond should not store raw social media passwords. Session access remains on the operator's machine unless the operator or platform syncs it elsewhere.",
        },
        {
          title: "License And Sync Data",
          body: "Diamond may check license records in Firebase and may export or sync Firestore-shaped bundles for drafts, schedules, runs, metrics, replies, responses, proof records, and memory. Service account secrets must stay outside the renderer.",
        },
        {
          title: "Content And Media",
          body: "Users control the social content, media paths, generated assets, and approval decisions they add to Diamond. Users are responsible for removing sensitive or unnecessary data from draft packages and media libraries.",
        },
        {
          title: "Retention",
          body: "Diamond keeps local records so users can audit what was drafted, staged, scheduled, posted, abandoned, or escalated. Retention controls should be defined before public launch.",
        },
        {
          title: "Third Parties",
          body: "Diamond interacts with social platforms through user-controlled browser sessions and may use services such as Firebase, Mojo AI Studio, and ElevenLabs where configured. Each third-party service has its own terms and privacy practices.",
        },
        {
          title: "Draft Status",
          body: "This Privacy Policy text is a product draft for implementation and review. It should be reviewed by counsel before public launch or paid distribution.",
        },
      ],
    },
  ];
}

export function validateLegalDocuments(documents = getDiamondLegalDocuments()) {
  const issues = [];
  documents.forEach((document) => {
    if (!document.id) issues.push("A legal document is missing an id.");
    if (!document.title) issues.push(`${document.id || "Document"} is missing a title.`);
    if (document.status !== "draft") issues.push(`${document.title || document.id} must clearly be marked draft.`);
    if (!document.summary) issues.push(`${document.title || document.id} is missing a summary.`);
    if (!Array.isArray(document.sections) || document.sections.length < 5) {
      issues.push(`${document.title || document.id} needs at least five sections.`);
    }
    (document.sections || []).forEach((section) => {
      if (!section.title || !section.body) issues.push(`${document.title || document.id} has an incomplete section.`);
    });
  });
  return {
    ok: issues.length === 0,
    issues,
  };
}

