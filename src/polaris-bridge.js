import { buildSlotDraftText } from "./content-generation.js";
import { createPostDraft } from "./draft.js";
import { validateRoutineSlot } from "./failure-controls.js";
import { buildFirestoreSyncBundle, summarizeFirestoreSyncBundle } from "./firebase-sync.js";

export function triggerDiamondRoutine(workspace = {}, input = {}) {
  const next = clone(workspace);
  const context = input.context || next.context || {};
  const routine = input.routine || "run-due-slots";
  const now = input.now || new Date().toISOString();
  const dueWindowMs = Number.isFinite(input.dueWindowMs) ? input.dueWindowMs : 15 * 60 * 1000;
  const slots = matchingSlots(next, context, routine, now, dueWindowMs);
  const generated = [];
  const skipped = [];

  slots.forEach((slot, index) => {
    const readiness = validateRoutineSlot(slot, {
      strategy: findStrategy(next, slot),
      now,
      dueWindowMs,
    });
    if (!readiness.ok && routine !== "generate-next-slot") {
      slot.status = "skipped";
      slot.skipReason = readiness.reason;
      slot.skippedAt = now;
      skipped.push(recordRoutineRun(next, context, {
        idSuffix: `skipped-${index}`,
        status: "skipped",
        slotId: slot.id,
        note: readiness.reason,
        now,
      }));
      return;
    }
    const result = generateDraftFromSlot(next, slot, context, now, index);
    generated.push(result);
  });

  if (!slots.length) {
    skipped.push(recordRoutineRun(next, context, {
      idSuffix: "empty",
      status: "skipped",
      note: routine === "generate-next-slot" ? "No planned editorial slot matched the requested context." : "No due editorial slots matched the requested context.",
      now,
    }));
  }

  const syncBundle = buildFirestoreSyncBundle(next);
  return {
    workspace: next,
    result: {
      routine,
      generatedCount: generated.length,
      skippedCount: skipped.length,
      generatedDraftIds: generated.map((item) => item.draft.id),
      routineRunIds: [...generated.map((item) => item.run.id), ...skipped.map((run) => run.id)],
      syncSummary: summarizeFirestoreSyncBundle(syncBundle),
    },
  };
}

export function createPolarisBridgeDescriptor(input = {}) {
  return {
    app: "Diamond",
    mode: "standalone-electron-with-cli-bridge",
    routineCommand: "npm run bridge -- --routine run-due-slots --state <state.json> --write",
    launchCommand: "npm start",
    env: {
      firebaseAdminJson: "DIAMOND_FIREBASE_ADMIN_JSON or GOOGLE_APPLICATION_CREDENTIALS",
      firebaseProjectId: "FIREBASE_PROJECT_ID",
    },
    statePath: input.statePath || "%APPDATA%/Diamond/state.json",
    syncCollections: [
      "postDrafts",
      "scheduledPosts",
      "postRuns",
      "metrics",
      "socialReplies",
      "socialResponseDrafts",
      "postMemory",
    ],
    standaloneFallback: true,
  };
}

function generateDraftFromSlot(workspace, slot, context, now, index) {
  const strategy = findStrategy(workspace, slot);
  const text = buildSlotDraftText(slot, strategy);
  const draftId = `${slot.platform}-${Date.parse(now) || Date.now()}-${index}`;
  const draft = createPostDraft({
    draftId,
    context: contextForSlot(slot, context),
    text,
    language: slot.language || "en",
    media: [],
    approvalPolicy: findApprovalPolicy(workspace, context),
    brandLibrary: findBrandLibrary(workspace, slot),
    claimLibrary: findClaimLibrary(workspace, slot),
  });
  draft.editorialSlotId = slot.id;
  workspace.drafts ||= [];
  workspace.drafts.unshift(draft);
  slot.status = "drafted";
  slot.draftId = draft.id;
  slot.draftedAt = draft.createdAt;
  delete slot.skipReason;
  const run = recordRoutineRun(workspace, draft.context, {
    idSuffix: `drafted-${index}`,
    status: draft.status === "blocked" ? "blocked" : "drafted",
    slotId: slot.id,
    draftId: draft.id,
    note: `Generated ${draft.id} from planned slot "${slot.topic}".`,
    now,
  });
  return { draft, run };
}

function matchingSlots(workspace, context, routine, now, dueWindowMs) {
  const slots = (workspace.editorialSlots || [])
    .filter((slot) => slotMatchesContext(slot, context))
    .filter((slot) => routine === "generate-next-slot" ? slot.status === "planned" : ["planned", "skipped"].includes(slot.status))
    .sort((a, b) => new Date(a.plannedAt).getTime() - new Date(b.plannedAt).getTime());
  if (routine === "generate-next-slot") return slots.slice(0, 1);
  const dueCutoff = new Date(now).getTime() + dueWindowMs;
  return slots.filter((slot) => {
    const planned = new Date(slot.plannedAt).getTime();
    return Number.isNaN(planned) || planned <= dueCutoff;
  });
}

function recordRoutineRun(workspace, context, input) {
  workspace.routineRuns ||= [];
  const run = {
    id: `routine-${Date.parse(input.now) || Date.now()}-${input.idSuffix}`,
    name: "diamond-polaris-bridge",
    context,
    status: input.status,
    slotId: input.slotId || null,
    draftId: input.draftId || null,
    note: input.note || "",
    createdAt: input.now || new Date().toISOString(),
  };
  workspace.routineRuns.unshift(run);
  return run;
}

function slotMatchesContext(slot, context) {
  return slot.companyId === context.companyId
    && slot.brandId === context.brandId
    && slot.campaignId === context.campaignId
    && slot.platform === context.platform
    && slot.socialAccountId === context.socialAccountId;
}

function contextForSlot(slot, fallback) {
  return {
    ...fallback,
    companyId: slot.companyId,
    brandId: slot.brandId,
    campaignId: slot.campaignId,
    platform: slot.platform,
    socialAccountId: slot.socialAccountId,
  };
}

function findStrategy(workspace, slot) {
  return (workspace.contentStrategies || []).find((strategy) => strategy.companyId === slot.companyId
    && strategy.brandId === slot.brandId
    && strategy.campaignId === slot.campaignId) || {};
}

function findApprovalPolicy(workspace, context) {
  return (workspace.approvalPolicies || []).find((policy) => policy.id === context.approvalPolicyId || policy.companyId === context.companyId) || {};
}

function findBrandLibrary(workspace, slot) {
  return (workspace.brandLibraries || []).find((library) => library.companyId === slot.companyId && library.brandId === slot.brandId) || {};
}

function findClaimLibrary(workspace, slot) {
  return (workspace.claimLibraries || []).find((library) => library.companyId === slot.companyId && library.brandId === slot.brandId) || {};
}

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}
