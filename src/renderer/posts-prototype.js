import {
  buildPostBoardView,
  createPostDraft,
  createSeedWorkspace,
} from "../index.js";

const state = await loadPrototypeState();
const board = buildPostBoardView({ workspace: state });
renderBoard(board);

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
    <article class="post-card">
      <strong>${escapeHtml(post.excerpt || post.title)}</strong>
      <time datetime="${escapeHtml(post.updatedAt || post.createdAt || "")}">${formatDate(post.updatedAt || post.createdAt)}</time>
      ${post.platforms?.length ? `<div class="platform-row">${post.platforms.map((platform) => `<span>${escapeHtml(platform)}</span>`).join("")}</div>` : ""}
      ${post.tags?.length ? `<div class="tag-row">${post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
    </article>
  `;
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
