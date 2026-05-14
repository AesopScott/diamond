import {
  buildSocialAccountSetupKit,
  buildPostBoardView,
  createPlatformDraft,
  createPostDraft,
  createPostPackage,
  createSeedWorkspace,
  derivePostPackagesFromWorkspace,
  resolveComposeUrl,
  resolveLoginUrl,
} from "../index.js";

const state = await loadPrototypeState();
let prototypeModel = derivePostPackagesFromWorkspace(state);
let board = buildPostBoardView(prototypeModel);
renderBoard(board);
renderCalendar();
renderAccounts();
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
  }, {
    id: "prototype-schedule-2",
    draftId: "prototype-draft-0",
    context: workspace.context,
    status: "posted",
    scheduledAt: "2026-05-13T18:00:00.000Z",
    text: "The free World Cup league is open. Make your picks and climb the board.",
    media: [],
    createdAt: "2026-05-13T12:00:00.000Z",
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
  workspace.socialAccounts = workspace.socialAccounts.map((account) => ({
    ...account,
    accountUrl: account.platform === "x" ? "https://x.com/thecardbet" : account.accountUrl,
    sessionStatus: {
      x: "ready",
      facebook: "ready",
      tiktok: "ready",
      instagram: "needs_login",
      linkedin: "unknown",
      "youtube-shorts": "blocked",
      reddit: "monitoring",
    }[account.platform] || "unknown",
    handle: {
      x: "@thecardbet",
      instagram: "thecard.bet",
      tiktok: "thecardbet",
      facebook: "thecard.bet",
    }[account.platform] || "",
    proofCount: {
      x: 3,
      facebook: 2,
      tiktok: 2,
      instagram: 0,
      linkedin: 0,
      "youtube-shorts": 0,
      reddit: 1,
    }[account.platform] || 0,
  }));
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
  document.querySelector("#prototype-nav").addEventListener("click", handlePrototypeNav);
  document.querySelector("#create-post").addEventListener("click", openCreateDetail);
  document.querySelector("#back-to-board").addEventListener("click", () => renderBoard(board));
  document.querySelector("#posts-board").addEventListener("click", (event) => {
    const card = event.target.closest("[data-package-id]");
    if (!card) return;
    openPackageDetail(card.dataset.packageId);
  });
  document.querySelector("#idea-text").addEventListener("input", updatePreviewCopy);
  document.querySelector("#post-tags").addEventListener("input", updatePreviewTags);
  document.querySelector("#accounts-grid")?.addEventListener("click", (event) => {
    const card = event.target.closest("[data-account-id]");
    if (!card) return;
    renderAccounts(card.dataset.accountId);
  });
}

function handlePrototypeNav(event) {
  const link = event.target.closest("[data-view]");
  if (!link) return;
  event.preventDefault();
  showPrototypeView(link.dataset.view);
  document.querySelectorAll("#prototype-nav a").forEach((item) => item.classList.toggle("active", item === link));
}

function showPrototypeView(viewId) {
  document.querySelectorAll(".prototype-view").forEach((view) => {
    view.classList.toggle("hidden", view.id !== viewId);
  });
  if (viewId === "posts-view") renderBoard(board);
  if (viewId === "calendar-view") renderCalendar();
  if (viewId === "accounts-view") renderAccounts();
}

function renderCalendar() {
  const target = document.querySelector("#calendar-board");
  if (!target) return;
  const groups = calendarGroups(state.scheduledPosts || []);
  target.innerHTML = groups.map((group) => `
    <article class="calendar-group ${escapeHtml(group.id)}" aria-labelledby="calendar-${escapeHtml(group.id)}">
      <header>
        <div>
          <h2 id="calendar-${escapeHtml(group.id)}">${escapeHtml(group.label)}</h2>
          <p>${escapeHtml(group.description)}</p>
        </div>
        <span class="count">${group.items.length}</span>
      </header>
      <div class="calendar-list">
        ${group.items.length ? group.items.map(renderCalendarItem).join("") : `<div class="empty-column">No scheduled posts</div>`}
      </div>
    </article>
  `).join("");
}

function calendarGroups(schedules) {
  const now = new Date();
  const groups = [
    { id: "overdue", label: "Overdue", description: "Scheduled windows that need attention.", items: [] },
    { id: "today", label: "Ready Today", description: "Posts due today.", items: [] },
    { id: "upcoming", label: "Upcoming", description: "Planned posts after today.", items: [] },
    { id: "completed", label: "Completed", description: "Posted or closed schedule records.", items: [] },
  ];
  schedules.forEach((schedule) => {
    const scheduledAt = new Date(schedule.scheduledAt);
    if (["posted", "published", "completed"].includes(schedule.status)) {
      groups[3].items.push(schedule);
    } else if (scheduledAt.getTime() < now.getTime() && !isSameLocalDay(scheduledAt, now)) {
      groups[0].items.push(schedule);
    } else if (isSameLocalDay(scheduledAt, now)) {
      groups[1].items.push(schedule);
    } else {
      groups[2].items.push(schedule);
    }
  });
  groups.forEach((group) => {
    group.items.sort((left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime());
  });
  return groups;
}

function renderCalendarItem(item) {
  return `
    <article class="calendar-item">
      <strong>${escapeHtml(item.text || "Untitled scheduled post")}</strong>
      <time datetime="${escapeHtml(item.scheduledAt || "")}">${formatDateTime(item.scheduledAt)}</time>
      <div class="platform-row">
        <span>${escapeHtml(item.context?.platform || "x")}</span>
        <span>${escapeHtml(item.status || "scheduled")}</span>
      </div>
    </article>
  `;
}

function renderAccounts(selectedAccountId) {
  const target = document.querySelector("#accounts-grid");
  const detail = document.querySelector("#account-detail");
  if (!target || !detail) return;
  const accounts = state.socialAccounts || [];
  const selected = accounts.find((account) => account.id === selectedAccountId) || accounts[0];
  target.innerHTML = accounts.map((account) => renderAccountCard(account, selected?.id)).join("");
  detail.innerHTML = selected ? renderAccountDetail(selected) : `<div class="empty-column">No social accounts configured.</div>`;
}

function renderAccountCard(account, selectedAccountId) {
  const status = account.sessionStatus || "unknown";
  return `
    <button class="account-card ${account.id === selectedAccountId ? "active" : ""}" type="button" data-account-id="${escapeHtml(account.id)}">
      <span class="platform-mark">${platformIcon(account.platform)}</span>
      <span>
        <strong>${escapeHtml(platformLabel(account.platform))}</strong>
        <small>${escapeHtml(account.handle || account.id)}</small>
      </span>
      <em class="session-pill ${escapeHtml(status)}">${escapeHtml(titleCase(status))}</em>
    </button>
  `;
}

function renderAccountDetail(account) {
  const company = (state.companies || []).find((item) => item.id === account.companyId);
  const brand = (state.brands || []).find((item) => item.id === account.brandId);
  const campaign = (state.campaigns || []).find((item) => item.id === state.context?.campaignId);
  const strategy = (state.contentStrategies || []).find((item) => item.campaignId === campaign?.id);
  const kit = buildSocialAccountSetupKit({ company, brand, campaign, account, strategy });
  return `
    <article class="account-detail-card">
      <header>
        <div>
          <span class="eyebrow">Active account</span>
          <h2>${escapeHtml(platformLabel(account.platform))}</h2>
          <p>${escapeHtml(account.handle || account.accountUrl || account.id)}</p>
        </div>
        <em class="session-pill ${escapeHtml(account.sessionStatus || "unknown")}">${escapeHtml(titleCase(account.sessionStatus || "unknown"))}</em>
      </header>
      <dl class="account-meta">
        <div><dt>Browser profile</dt><dd>${escapeHtml(account.browserProfileId || "Not assigned")}</dd></div>
        <div><dt>Public account</dt><dd>${escapeHtml(account.accountUrl || "Not saved")}</dd></div>
        <div><dt>Login URL</dt><dd>${escapeHtml(resolveLoginUrl(account) || "Not configured")}</dd></div>
        <div><dt>Compose URL</dt><dd>${escapeHtml(resolveComposeUrl(account) || "Not configured")}</dd></div>
        <div><dt>Proof captures</dt><dd>${escapeHtml(account.proofCount || 0)}</dd></div>
        <div><dt>Mode</dt><dd>${account.monitoringOnly ? "Monitoring only" : "Posting enabled"}</dd></div>
      </dl>
      <section class="account-actions" aria-label="Account actions">
        <button type="button">Open login</button>
        <button type="button">Check session</button>
        <button type="button">Capture proof</button>
        <button type="button">Open composer</button>
      </section>
      <section class="setup-kit" aria-labelledby="setup-kit-heading">
        <h3 id="setup-kit-heading">Setup kit</h3>
        <p>${escapeHtml(kit.summary)}</p>
        <ul>
          ${kit.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    </article>
  `;
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
    instagram: "IG",
    tiktok: "TT",
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

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function isSameLocalDay(left, right) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
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
