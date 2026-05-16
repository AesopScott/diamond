import { normalizeId } from "./ids.js";
import {
  defaultComposeUrlForPlatform,
  defaultExpectedHostForPlatform,
  defaultLoginUrlForPlatform,
  normalizeAccountUrl,
  normalizeBrowserProfileId,
  platformLabel,
} from "./social-account.js";

export const ACCOUNT_SETUP_STATUSES = Object.freeze({
  not_started: "Not started",
  kit_ready: "Kit ready",
  signup_opened: "Signup opened",
  created: "Created",
  blocked: "Blocked",
});

export const SOCIAL_SIGNUP_URLS = Object.freeze({
  x: "https://x.com/i/flow/signup",
  instagram: "https://www.instagram.com/accounts/emailsignup/",
  tiktok: "https://www.tiktok.com/signup",
  linkedin: "https://www.linkedin.com/signup",
  "youtube-shorts": "https://accounts.google.com/signup/v2/webcreateaccount",
  "youtube-longform": "https://accounts.google.com/signup/v2/webcreateaccount",
  facebook: "https://www.facebook.com/r.php",
  pinterest: "https://www.pinterest.com/business/create/",
  reddit: "https://www.reddit.com/register/",
});

export function signupUrlForPlatform(platform) {
  return SOCIAL_SIGNUP_URLS[normalizeId(platform, "platform")] || "";
}

export function setupStatusLabel(status) {
  return ACCOUNT_SETUP_STATUSES[normalizeId(status, "status")] || ACCOUNT_SETUP_STATUSES.not_started;
}

export function buildSocialAccountSetupKit({
  company,
  brand,
  campaign,
  account,
  strategy,
  now = new Date().toISOString(),
} = {}) {
  const platform = normalizeId(account?.platform || "x", "platform");
  const platformName = platformLabel(platform);
  const desiredHandle = normalizeDesiredHandle(account?.handle || brand?.name || company?.name || "new account", platform);
  const displayName = compactText(brand?.name || company?.name || desiredHandle.replace(/^@/, ""));
  const signupUrl = account?.signupUrl || signupUrlForPlatform(platform);
  const cta = compactText(strategy?.cta || strategy?.offer || "Join the free league and follow the campaign.");
  const bio = buildProfileBio({ brand, campaign, cta });
  const website = firstUrl([
    ...(brand?.links || []),
    ...(strategy?.referenceAccounts || []),
    strategy?.cta,
    strategy?.offer,
  ]);

  return {
    id: `setup-${account?.id || platform}-${now.replace(/[^0-9a-z]/gi, "-")}`,
    companyId: company?.id || "",
    companyName: company?.name || "",
    brandId: brand?.id || "",
    brandName: brand?.name || "",
    campaignId: campaign?.id || "",
    campaignName: campaign?.name || "",
    socialAccountId: account?.id || "",
    platform,
    platformName,
    signupUrl,
    desiredHandle,
    displayName,
    bio,
    website,
    cta,
    checklist: [
      "Create the account only on the official platform signup page.",
      "Keep CAPTCHA, email verification, phone verification, and 2FA human-controlled.",
      "Use an isolated Diamond browser profile for this company, brand, platform, and account.",
      "After creation, save the public account URL and run Check session.",
      "Do not reuse passwords across brands or platforms.",
    ],
    summary: `${platformName} setup kit for ${displayName}: ${desiredHandle}`,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildSocialAccountCreationPlan({
  company,
  brand,
  campaign,
  account,
  strategy,
  platform = account?.platform || "x",
  desiredHandle = account?.handle || brand?.name || company?.name || "",
  now = new Date().toISOString(),
} = {}) {
  const normalizedPlatform = normalizeId(platform, "platform");
  const platformName = platformLabel(normalizedPlatform);
  const handle = normalizeDesiredHandle(desiredHandle, normalizedPlatform);
  const displayName = compactText(brand?.name || company?.name || handle.replace(/^@/, "") || "New brand account");
  const accountUrl = account?.accountUrl || normalizeAccountUrl(handle, normalizedPlatform);
  const signupUrl = account?.signupUrl || signupUrlForPlatform(normalizedPlatform);
  const loginUrl = account?.loginUrl || defaultLoginUrlForPlatform(normalizedPlatform);
  const composeUrl = account?.composeUrl || defaultComposeUrlForPlatform(normalizedPlatform);
  const expectedHost = account?.expectedHost || defaultExpectedHostForPlatform(normalizedPlatform);
  const browserProfileId = account?.browserProfileId || normalizeBrowserProfileId([
    company?.id || company?.name || "company",
    brand?.id || brand?.name || "brand",
    normalizedPlatform,
    account?.id || handle || "account",
  ].filter(Boolean).join("-"));
  const kit = buildSocialAccountSetupKit({
    company,
    brand,
    campaign,
    account: { ...account, platform: normalizedPlatform, handle, accountUrl, signupUrl },
    strategy,
    now,
  });

  return {
    ok: Boolean(signupUrl),
    id: `creation-${account?.id || normalizedPlatform}-${now.replace(/[^0-9a-z]/gi, "-")}`,
    companyId: company?.id || account?.companyId || "",
    companyName: company?.name || "",
    brandId: brand?.id || account?.brandId || "",
    brandName: brand?.name || "",
    campaignId: campaign?.id || "",
    campaignName: campaign?.name || "",
    socialAccountId: account?.id || "",
    platform: normalizedPlatform,
    platformName,
    desiredHandle: handle,
    displayName,
    bio: kit.bio,
    website: kit.website,
    accountUrl,
    signupUrl,
    loginUrl,
    composeUrl,
    expectedHost,
    browserProfileId,
    checklist: [
      {
        id: "identity",
        label: "Brand identity",
        detail: `Use display name "${displayName}" and desired handle "${handle || "brand handle"}" when the platform allows it.`,
        humanRequired: false,
      },
      {
        id: "email",
        label: "Email or phone",
        detail: "Use a company-owned email or phone number you can recover later.",
        humanRequired: true,
      },
      {
        id: "password",
        label: "Password",
        detail: "Create a unique password in your password manager. Diamond does not store passwords.",
        humanRequired: true,
      },
      {
        id: "verification",
        label: "Human verification",
        detail: "Complete CAPTCHA, email verification, SMS checks, and 2FA yourself on the official platform page.",
        humanRequired: true,
      },
      {
        id: "profile",
        label: "Profile basics",
        detail: `Add the bio, website, avatar, and header image for ${displayName}.`,
        humanRequired: false,
      },
      {
        id: "diamond-proof",
        label: "Return to Diamond",
        detail: "Save the public account URL, run Check session, and mark the session ready after you can reach the account.",
        humanRequired: false,
      },
    ],
    safetyNotes: [
      "Diamond can open the correct signup page and prepare the account details, but it cannot bypass CAPTCHA, phone, email, or identity checks.",
      "Diamond does not store social media passwords.",
      "Create one account at a time so each browser profile, brand, and platform stays cleanly separated.",
    ],
    createdAt: now,
    updatedAt: now,
  };
}

export function formatSocialAccountSetupKit(kit = {}) {
  return [
    `${kit.platformName || platformLabel(kit.platform)} account setup`,
    `Company: ${kit.companyName || kit.companyId || "Unassigned"}`,
    `Brand: ${kit.brandName || kit.brandId || "Unassigned"}`,
    `Campaign: ${kit.campaignName || kit.campaignId || "Unassigned"}`,
    `Desired handle: ${kit.desiredHandle || ""}`,
    `Display name: ${kit.displayName || ""}`,
    `Bio: ${kit.bio || ""}`,
    `Website: ${kit.website || ""}`,
    `CTA: ${kit.cta || ""}`,
    `Official signup: ${kit.signupUrl || ""}`,
    "",
    "Human-controlled steps:",
    ...(kit.checklist || []).map((item, index) => `${index + 1}. ${item}`),
  ].join("\n");
}

export function formatSocialAccountCreationPlan(plan = {}) {
  return [
    `${plan.platformName || platformLabel(plan.platform)} account creation plan`,
    `Company: ${plan.companyName || plan.companyId || "Unassigned"}`,
    `Brand: ${plan.brandName || plan.brandId || "Unassigned"}`,
    `Campaign: ${plan.campaignName || plan.campaignId || "Unassigned"}`,
    `Desired handle: ${plan.desiredHandle || ""}`,
    `Display name: ${plan.displayName || ""}`,
    `Bio: ${plan.bio || ""}`,
    `Website: ${plan.website || ""}`,
    `Official signup: ${plan.signupUrl || ""}`,
    `Public account URL: ${plan.accountUrl || ""}`,
    `Browser profile: ${plan.browserProfileId || ""}`,
    "",
    "Creation checklist:",
    ...(plan.checklist || []).map((item, index) => {
      const human = item.humanRequired ? "human required" : "Diamond-assisted";
      return `${index + 1}. ${item.label} (${human}): ${item.detail}`;
    }),
    "",
    "Safety notes:",
    ...(plan.safetyNotes || []).map((item) => `- ${item}`),
  ].join("\n");
}

export function normalizeDesiredHandle(value, platform = "x") {
  const cleaned = compactText(value)
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_.-]+/gi, "")
    .slice(0, 28);
  if (!cleaned) return "";
  return normalizeId(platform, "platform") === "x" ? `@${cleaned}` : cleaned;
}

function buildProfileBio({ brand, campaign, cta }) {
  const base = [
    brand?.name || "",
    campaign?.name ? `${campaign.name} updates` : "campaign updates",
    cta || "",
  ].filter(Boolean).join(". ");
  return compactText(base).slice(0, 150);
}

function compactText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function firstUrl(values) {
  return values.map((value) => String(value || "").match(/https?:\/\/[^\s)]+/i)?.[0]).find(Boolean) || "";
}
