import {
  buildPostBoardView,
  createPlatformDraft,
  createPostDraft,
  createPostPackage,
  createSeedWorkspace,
  derivePostPackagesFromWorkspace,
} from "../index.js";

const state = await loadPrototypeState();
let prototypeModel = derivePostPackagesFromWorkspace(state);
let board = buildPostBoardView(prototypeModel);
renderBoard(board);
wirePrototypeControls();

async function loadPrototypeState() {
  const saved = await window.diamond?.getState?.();
  if (hasPostData(saved)) return saved;
  return buildSampleWorkspace();
}

function hasPostData(workspace) {
  return Boolean(
    workspace
    && ((workspace.drafts || []).length
      || (workspace.scheduledPosts || []).length
      || (workspace.postRuns || []).length
      || (workspace.postPackages || []).length),
  );
}

function buildSampleWorkspace() {
  const workspace = createSeedWorkspace();
  const samples = [
    ["draft", "World Cup fans can join the free leaderboard before the opening match.", "2026-05-14T11:00:00.000Z"],
    ["needs_review", "$1,000 in total payouts makes the World Cup league feel real.", "2026-05-14T10:30:00.000Z"],
    ["scheduled", "Show your country on the board before matchday.", "2026-05-15T18:00:00.000Z"],
    ["published", "The free World Cup league is open. Make your picks and climb the board.", "2026-05-13T18:00:00.000Z"],
    ["failed", "Live markets need a cleaner Spanish variant before posting.", "2026-05-12T18:00:00.000Z"],
  ];
  workspace.drafts = samples.map(([status, text, createdAt], index) => {
    const draft = createPostDraft({
      context: workspace.context,
      text,
      approvalPolicy: workspace.approvalPolicies[0],
      draftId: `prototype-${status}-${index}`,
    });
    draft.status = status === "published" ? "posted" : status;
    draft.createdAt = createdAt;
    draft.updatedAt = createdAt;
    draft.tags = status === "published" ? ["World Cup", "Launch"] : ["World Cup"];
    return draft;
  });
  workspace.scheduledPosts = [{
    id: "prototype-schedule-1",
    draftId: "prototype-scheduled-2",
    context: workspace.context,
    status: "scheduled",
    scheduledAt: "2026-05-15T18:00:00.000Z",
    text: "Show your country on the board before matchday.",
    media: [],
    createdAt: "2026-05-14T12:00:00.000Z",
  }];
  workspace.postRuns = [{
    id: "prototype-run-1",
    draftId: "prototype-published-3",
    context: workspace.context,
    status: "posted",
    text: "The free World Cup league is open. Make your picks and climb the board.",
    media: [],
    createdAt: "2026-05-13T18:00:00.000Z",
  }];
  return workspace;
}

function renderBoard(columns) {
  document.querySelector("#posts-board").classList.remove("hidden");
  document.querySelector(".prototype-toolbar").classList.remove("hidden");
  document.querySelector("#post-detail").classList.add("hidden");
  const target = document.querySelector("#posts-board");
  target.innerHTML = columns.map((column) => `
    <article class="post-column" aria-labelledby="column-${escapeHtml(column.id)}">
      <header>
        <h2 id="column-${escapeHtml(column.id)}">${escapeHtml(column.label)}</h2>
        <span class="count">${column.count}</span>
      </header>
      <div class="post-list">
        ${column.posts.length ? column.posts.map(renderCard).join("") : `<div class="empty-column">No posts</div>`}
      </div>
    </article>
  `).join("");
}

function renderCard(post) {
  return `
    <button class="post-card" type="button" data-package-id="${escapeHtml(post.id)}">
      <strong>${escapeHtml(post.excerpt || post.title)}</strong>
      <time datetime="${escapeHtml(post.updatedAt || post.createdAt || "")}">${formatDate(post.updatedAt || post.createdAt)}</time>
      ${post.platforms?.length ? `<div class="platform-row">${post.platforms.map((platform) => `<span>${escapeHtml(platform)}</span>`).join("")}</div>` : ""}
      ${post.tags?.length ? `<div class="tag-row">${post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
    </button>
  `;
}

function wirePrototypeControls() {
  document.querySelector("#create-post").addEventListener("click", openCreateDetail);
  document.querySelector("#back-to-board").addEventListener("click", () => renderBoard(board));
  document.querySelector("#posts-board").addEventListener("click", (event) => {
    const card = event.target.closest("[data-package-id]");
    if (!card) return;
    openPackageDetail(card.dataset.packageId);
  });
  document.querySelector("#idea-text").addEventListener("input", updatePreviewCopy);
  document.querySelector("#post-tags").addEventListener("input", updatePreviewTags);
}

function openCreateDetail() {
  const context = state.context;
  const postPackage = createPostPackage({
    id: `prototype-new-${Date.now()}`,
    context,
    ideaText: "Write the core post idea here, then generate platform versions.",
    tags: ["draft"],
    source: "prototype-create",
  });
  const platforms = ["linkedin", "x"];
  const drafts = platforms.map((platform) => createPlatformDraft({
    postPackage,
    context,
    platform,
    socialAccountId: socialAccountIdForPlatform(platform),
    text: platformCopy(postPackage.ideaText, platform),
    status: "draft",
  }));
  openDetail(postPackage, drafts);
}

function openPackageDetail(packageId) {
  const postPackage = prototypeModel.postPackages.find((item) => item.id === packageId);
  if (!postPackage) return;
  const drafts = prototypeModel.platformDrafts.filter((draft) => draft.postPackageId === postPackage.id);
  openDetail(postPackage, drafts.length ? drafts : [createPlatformDraft({
    postPackage,
    context: postPackage.context,
    platform: postPackage.context.platform,
    socialAccountId: postPackage.context.socialAccountId,
    text: postPackage.ideaText,
    status: postPackage.status,
  })]);
}

function openDetail(postPackage, drafts) {
  document.querySelector("#posts-board").classList.add("hidden");
  document.querySelector(".prototype-toolbar").classList.add("hidden");
  document.querySelector("#post-detail").classList.remove("hidden");
  document.querySelector("#post-detail-heading").textContent = postPackage.title || "Draft";
  document.querySelector("#detail-status").textContent = titleCase(postPackage.status);
  document.querySelector("#detail-status").className = `status-badge ${postPackage.status}`;
  document.querySelector("#idea-text").value = postPackage.ideaText || "";
  document.querySelector("#post-tags").value = (postPackage.tags || []).join(", ");
  renderPlatformButtons(drafts);
  renderPlatformPreviews(drafts);
}

function renderPlatformButtons(drafts) {
  const target = document.querySelector("#platform-buttons");
  target.innerHTML = drafts.map((draft) => `
    <button type="button" class="platform-button active">${platformIcon(draft.platform)} ${escapeHtml(platformLabel(draft.platform))}</button>
  `).join("");
}

function renderPlatformPreviews(drafts) {
  const target = document.querySelector("#platform-previews");
  target.innerHTML = drafts.map((draft) => `
    <article class="platform-preview" data-preview-platform="${escapeHtml(draft.platform)}">
      <header>
        <strong>${platformIcon(draft.platform)} ${escapeHtml(platformLabel(draft.platform))}</strong>
        ${draft.charLimit ? `<span>${draft.text.length}/${draft.charLimit}</span>` : ""}
      </header>
      <textarea rows="${draft.platform === "x" ? 4 : 7}">${escapeHtml(draft.text)}</textarea>
      <button type="button" class="media-button">+ Media</button>
      <div class="social-preview">
        <div class="avatar"></div>
        <div>
          <strong>Your Name</strong>
          <p>Your headline<br>now</p>
        </div>
        <p>${escapeHtml(draft.text)}</p>
      </div>
    </article>
  `).join("");
}

function updatePreviewCopy() {
  const idea = document.querySelector("#idea-text").value;
  document.querySelectorAll("[data-preview-platform]").forEach((preview) => {
    const platform = preview.dataset.previewPlatform;
    const text = platformCopy(idea, platform);
    const textarea = preview.querySelector("textarea");
    textarea.value = text;
    const counter = preview.querySelector("header span");
    if (counter) counter.textContent = `${text.length}/${platform === "x" ? 280 : 2200}`;
    preview.querySelector(".social-preview > p").textContent = text;
  });
}

function updatePreviewTags() {
  const value = document.querySelector("#post-tags").value;
  document.querySelector("#detail-status").title = `Tags: ${value || "none"}`;
}

function platformCopy(idea, platform) {
  const text = String(idea || "").trim();
  if (platform === "x") return text.length > 220 ? `${text.slice(0, 217)}...` : text;
  if (platform === "linkedin") return text;
  return text;
}

function socialAccountIdForPlatform(platform) {
  return (state.socialAccounts || []).find((account) => account.platform === platform)?.id || state.context.socialAccountId;
}

function platformIcon(platform) {
  return {
    linkedin: "in",
    x: "X",
    instagram: "◎",
    tiktok: "♪",
    facebook: "f",
  }[platform] || "+";
}

function platformLabel(platform) {
  return {
    linkedin: "LinkedIn",
    x: "X",
    instagram: "Instagram",
    tiktok: "TikTok",
    facebook: "Facebook",
  }[platform] || platform;
}

function titleCase(value) {
  return String(value || "draft").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString([], { month: "numeric", day: "numeric", year: "numeric" });
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  }[char]));
}
