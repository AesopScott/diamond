import { normalizeId } from "./ids.js";
import { assertTenantContext, companyPath } from "./tenant-context.js";

export const POST_PACKAGE_STATUSES = Object.freeze([
  "draft",
  "needs_review",
  "approved",
  "scheduled",
  "staged",
  "published",
  "failed",
  "abandoned",
  "blocked",
]);

export const POST_BOARD_COLUMNS = Object.freeze([
  { id: "draft", label: "Draft" },
  { id: "needs_review", label: "Needs Review" },
  { id: "scheduled", label: "Scheduled" },
  { id: "staged", label: "Staged" },
  { id: "published", label: "Published" },
  { id: "failed", label: "Failed" },
]);

export function createPostPackage(input = {}) {
  const context = assertTenantContext(input.context);
  const ideaText = cleanText(input.ideaText || input.text);
  if (!ideaText) throw new Error("Post idea text is required");
  const now = input.now || new Date().toISOString();
  const id = normalizeId(input.id || input.packageId || `package-${Date.now()}`, "postPackageId");
  const status = normalizePackageStatus(input.status || "draft");

  return {
    id,
    context,
    companyId: context.companyId,
    brandId: context.brandId,
    campaignId: context.campaignId,
    ideaText,
    title: cleanText(input.title) || excerpt(ideaText, 64),
    tags: normalizeTags(input.tags),
    status,
    source: input.source || "diamond",
    sourceDraftIds: normalizeIds(input.sourceDraftIds || input.sourceDraftId),
    platformDraftIds: normalizeIds(input.platformDraftIds),
    firestorePath: companyPath(context, "postPackages", id).join("/"),
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}

export function createPlatformDraft(input = {}) {
  const context = assertTenantContext(input.context || input.postPackage?.context);
  const postPackage = input.postPackage || {};
  const platform = normalizeId(input.platform || context.platform, "platform");
  const socialAccountId = normalizeId(input.socialAccountId || context.socialAccountId, "socialAccountId");
  const text = cleanText(input.text || postPackage.ideaText);
  if (!text) throw new Error("Platform draft text is required");
  const now = input.now || new Date().toISOString();
  const id = normalizeId(input.id || `${postPackage.id || "package"}-${platform}-${Date.now()}`, "platformDraftId");
  const draftContext = {
    ...context,
    platform,
    socialAccountId,
  };

  return {
    id,
    postPackageId: postPackage.id || input.postPackageId || "",
    context: draftContext,
    companyId: draftContext.companyId,
    brandId: draftContext.brandId,
    campaignId: draftContext.campaignId,
    platform,
    socialAccountId,
    text,
    media: Array.isArray(input.media) ? input.media : [],
    status: normalizePackageStatus(input.status || "draft"),
    charLimit: Number.isFinite(Number(input.charLimit)) ? Number(input.charLimit) : defaultCharLimit(platform),
    scheduledAt: input.scheduledAt || null,
    publishedAt: input.publishedAt || null,
    runId: input.runId || null,
    sourceDraftId: input.sourceDraftId || null,
    firestorePath: companyPath(draftContext, "platformDrafts", id).join("/"),
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}

export function derivePostPackagesFromWorkspace(workspace = {}) {
  const packages = new Map();
  const platformDrafts = [];

  (workspace.drafts || []).forEach((draft) => {
    if (!draft?.context || !draft.text) return;
    const postPackage = packageFromDraft(draft);
    packages.set(postPackage.id, postPackage);
    platformDrafts.push(platformDraftFromDraft(draft, postPackage));
  });

  (workspace.scheduledPosts || []).forEach((schedule) => {
    if (!schedule?.context || !schedule.text) return;
    const packageId = schedule.draftId ? packageIdForDraftId(schedule.draftId) : `package-${normalizeId(schedule.id, "scheduledPostId")}`;
    const existing = packages.get(packageId);
    const postPackage = existing ? {
      ...existing,
      status: prioritizePackageStatus(existing.status, "scheduled"),
      updatedAt: latestDate(existing.updatedAt, schedule.createdAt || schedule.scheduledAt),
    } : createPostPackage({
      id: packageId,
      context: schedule.context,
      ideaText: schedule.text,
      status: "scheduled",
      source: "scheduled-post",
      sourceDraftId: schedule.draftId,
      createdAt: schedule.createdAt || schedule.scheduledAt,
      updatedAt: schedule.updatedAt || schedule.createdAt || schedule.scheduledAt,
    });
    packages.set(packageId, postPackage);
    upsertPlatformDraft(platformDrafts, platformDraftFromSchedule(schedule, postPackage));
  });

  (workspace.postRuns || []).forEach((run) => {
    if (!run?.context || !run.text) return;
    const packageId = run.draftId ? packageIdForDraftId(run.draftId) : `package-${normalizeId(run.id, "runId")}`;
    const runStatus = packageStatusForRun(run);
    const existing = packages.get(packageId);
    const postPackage = existing ? {
      ...existing,
      status: prioritizePackageStatus(existing.status, runStatus),
      updatedAt: latestDate(existing.updatedAt, run.createdAt),
    } : createPostPackage({
      id: packageId,
      context: run.context,
      ideaText: run.text,
      status: runStatus,
      source: "post-run",
      sourceDraftId: run.draftId,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt || run.createdAt,
    });
    packages.set(packageId, postPackage);
    upsertPlatformDraft(platformDrafts, platformDraftFromRun(run, postPackage));
  });

  return {
    postPackages: [...packages.values()].map((postPackage) => ({
      ...postPackage,
      platformDraftIds: platformDrafts.filter((draft) => draft.postPackageId === postPackage.id).map((draft) => draft.id),
    })),
    platformDrafts,
  };
}

export function buildPostBoardView(input = {}) {
  const source = input.postPackages ? {
    postPackages: input.postPackages,
    platformDrafts: input.platformDrafts || [],
  } : derivePostPackagesFromWorkspace(input.workspace || input);
  const columns = POST_BOARD_COLUMNS.map((column) => ({
    ...column,
    posts: [],
  }));
  const columnMap = new Map(columns.map((column) => [column.id, column]));

  source.postPackages.forEach((postPackage) => {
    const status = boardColumnForStatus(postPackage.status);
    const column = columnMap.get(status) || columnMap.get("draft");
    column.posts.push(postCardForPackage(postPackage, source.platformDrafts));
  });

  columns.forEach((column) => {
    column.posts.sort((left, right) => new Date(right.updatedAt || right.createdAt).getTime() - new Date(left.updatedAt || left.createdAt).getTime());
    column.count = column.posts.length;
  });

  return columns;
}

export function normalizePackageStatus(status) {
  const clean = normalizeId(status, "status");
  if (["posted", "published"].includes(clean)) return "published";
  if (["needs-manual-finish", "error"].includes(clean)) return "failed";
  if (["review-required", "review"].includes(clean)) return "needs_review";
  const underscored = clean.replace(/-/g, "_");
  return POST_PACKAGE_STATUSES.includes(underscored) ? underscored : "draft";
}

function packageFromDraft(draft) {
  return createPostPackage({
    id: packageIdForDraftId(draft.id),
    context: draft.context,
    ideaText: draft.text,
    tags: draft.tags || [],
    status: packageStatusForDraft(draft),
    source: "legacy-draft",
    sourceDraftId: draft.id,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt || draft.createdAt,
  });
}

function platformDraftFromDraft(draft, postPackage) {
  return createPlatformDraft({
    id: platformDraftIdForDraft(draft.id, draft.context.platform),
    postPackage,
    context: draft.context,
    platform: draft.context.platform,
    socialAccountId: draft.context.socialAccountId,
    text: draft.text,
    media: draft.media,
    status: packageStatusForDraft(draft),
    scheduledAt: draft.scheduledAt,
    runId: draft.lastRunId,
    sourceDraftId: draft.id,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt || draft.createdAt,
  });
}

function platformDraftFromSchedule(schedule, postPackage) {
  return createPlatformDraft({
    id: platformDraftIdForDraft(schedule.draftId || schedule.id, schedule.context.platform),
    postPackage,
    context: schedule.context,
    platform: schedule.context.platform,
    socialAccountId: schedule.context.socialAccountId,
    text: schedule.text,
    media: schedule.media,
    status: "scheduled",
    scheduledAt: schedule.scheduledAt,
    sourceDraftId: schedule.draftId,
    createdAt: schedule.createdAt || schedule.scheduledAt,
    updatedAt: schedule.updatedAt || schedule.createdAt || schedule.scheduledAt,
  });
}

function platformDraftFromRun(run, postPackage) {
  return createPlatformDraft({
    id: platformDraftIdForDraft(run.draftId || run.id, run.context.platform),
    postPackage,
    context: run.context,
    platform: run.context.platform,
    socialAccountId: run.context.socialAccountId,
    text: run.text,
    media: run.media,
    status: packageStatusForRun(run),
    runId: run.id,
    sourceDraftId: run.draftId,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt || run.createdAt,
  });
}

function postCardForPackage(postPackage, platformDrafts) {
  const drafts = platformDrafts.filter((draft) => draft.postPackageId === postPackage.id);
  return {
    id: postPackage.id,
    title: postPackage.title || excerpt(postPackage.ideaText, 64),
    excerpt: excerpt(postPackage.ideaText, 120),
    status: postPackage.status,
    tags: postPackage.tags || [],
    platforms: [...new Set(drafts.map((draft) => draft.platform).filter(Boolean))],
    platformDraftCount: drafts.length,
    createdAt: postPackage.createdAt,
    updatedAt: postPackage.updatedAt,
  };
}

function upsertPlatformDraft(platformDrafts, next) {
  const index = platformDrafts.findIndex((draft) => draft.id === next.id);
  if (index >= 0) {
    platformDrafts[index] = {
      ...platformDrafts[index],
      ...next,
      status: prioritizePackageStatus(platformDrafts[index].status, next.status),
      updatedAt: latestDate(platformDrafts[index].updatedAt, next.updatedAt),
    };
    return;
  }
  platformDrafts.push(next);
}

function packageStatusForDraft(draft) {
  if (draft.status === "blocked") return "blocked";
  if (draft.approvalLevel === "review_required" && draft.status === "draft") return "needs_review";
  return normalizePackageStatus(draft.status);
}

function packageStatusForRun(run) {
  if (["posted", "published"].includes(run.status)) return "published";
  if (["abandoned"].includes(run.status)) return "abandoned";
  if (["needs_manual_finish", "failed", "error"].includes(run.status)) return "failed";
  return normalizePackageStatus(run.status || "staged");
}

function prioritizePackageStatus(left, right) {
  const priority = ["blocked", "failed", "published", "staged", "scheduled", "approved", "needs_review", "draft", "abandoned"];
  const leftIndex = priority.indexOf(normalizePackageStatus(left));
  const rightIndex = priority.indexOf(normalizePackageStatus(right));
  return (rightIndex >= 0 && (leftIndex < 0 || rightIndex < leftIndex)) ? normalizePackageStatus(right) : normalizePackageStatus(left);
}

function boardColumnForStatus(status) {
  const normalized = normalizePackageStatus(status);
  if (normalized === "approved") return "draft";
  if (normalized === "blocked") return "needs_review";
  if (normalized === "abandoned") return "failed";
  return POST_BOARD_COLUMNS.some((column) => column.id === normalized) ? normalized : "draft";
}

function packageIdForDraftId(draftId) {
  return `package-${normalizeId(draftId, "draftId")}`;
}

function platformDraftIdForDraft(draftId, platform) {
  return `platform-draft-${normalizeId(draftId, "draftId")}-${normalizeId(platform, "platform")}`;
}

function normalizeTags(tags = []) {
  const list = Array.isArray(tags) ? tags : String(tags || "").split(",");
  return [...new Set(list.map((tag) => cleanText(tag).toLowerCase()).filter(Boolean))];
}

function normalizeIds(ids = []) {
  const list = Array.isArray(ids) ? ids : [ids];
  return [...new Set(list.map((id) => cleanText(id)).filter(Boolean))];
}

function defaultCharLimit(platform) {
  if (platform === "x") return 280;
  if (platform === "tiktok") return 2200;
  if (platform === "instagram") return 2200;
  return null;
}

function excerpt(value, length) {
  const text = cleanText(value);
  return text.length > length ? `${text.slice(0, Math.max(0, length - 3))}...` : text;
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function latestDate(left, right) {
  if (!left) return right || new Date().toISOString();
  if (!right) return left;
  return new Date(right).getTime() > new Date(left).getTime() ? right : left;
}
