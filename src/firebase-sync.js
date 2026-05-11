export function resolveFirebaseAdminConfig(input = {}) {
  const env = input.env || {};
  const files = Array.isArray(input.files) ? input.files : [];
  const configuredPath = input.configPath || env.DIAMOND_FIREBASE_ADMIN_JSON || env.GOOGLE_APPLICATION_CREDENTIALS || "";
  const candidates = [
    configuredPath,
    ...files,
  ].filter(Boolean);
  const selectedPath = candidates[0] || "";
  return {
    ok: Boolean(selectedPath),
    source: configuredPath ? "env" : files.length ? "workspace" : "missing",
    path: selectedPath,
    redactedPath: redactPath(selectedPath),
    projectId: input.projectId || env.FIREBASE_PROJECT_ID || "",
    reason: selectedPath ? "Firebase admin JSON path configured." : "No Firebase admin JSON path configured.",
  };
}

export function buildFirestoreSyncBundle(workspace = {}) {
  return {
    generatedAt: new Date().toISOString(),
    collections: {
      postDrafts: scopedRows(workspace.drafts),
      scheduledPosts: scopedRows(workspace.scheduledPosts),
      postRuns: scopedRows(workspace.postRuns),
      metrics: scopedRows((workspace.postRuns || []).filter((run) => run.metrics).map((run) => ({
        id: `metrics-${run.id}`,
        runId: run.id,
        context: run.context,
        ...run.metrics,
      }))),
      socialReplies: scopedRows(workspace.socialReplies),
      socialResponseDrafts: scopedRows(workspace.socialResponseDrafts),
      postMemory: scopedRows(workspace.postMemory),
    },
  };
}

export function summarizeFirestoreSyncBundle(bundle = {}) {
  const collections = bundle.collections || {};
  return Object.fromEntries(Object.entries(collections).map(([name, rows]) => [name, Array.isArray(rows) ? rows.length : 0]));
}

function scopedRows(rows = []) {
  return (Array.isArray(rows) ? rows : []).filter((row) => row?.context?.companyId || row?.companyId);
}

function redactPath(value) {
  const path = String(value || "");
  if (!path) return "";
  const parts = path.split(/[\\/]/).filter(Boolean);
  if (parts.length <= 2) return `.../${parts.at(-1) || ""}`;
  return `.../${parts.at(-2)}/${parts.at(-1)}`;
}
