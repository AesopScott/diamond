import { evaluatePlatformProof, platformProofId } from "./platform-proof.js";

export const AUTO_PUBLISH_DECISION_VERSION = "2026-05-14";

export function createAutoPublishPolicy(input = {}) {
  return {
    id: input.id || "auto-publish-policy",
    version: input.version || AUTO_PUBLISH_DECISION_VERSION,
    status: input.status || "locked",
    enabled: Boolean(input.enabled),
    requiredStagingProofSessions: whole(input.requiredStagingProofSessions, 3),
    requireWorkflowSignoff: input.requireWorkflowSignoff !== false,
    requirePlatformProof: input.requirePlatformProof !== false,
    requireAutomationLicense: input.requireAutomationLicense !== false,
    allowedApprovalLevels: normalizeList(input.allowedApprovalLevels || ["auto_allowed"]),
    allowedQualityGates: normalizeList(input.allowedQualityGates || ["pass", "review", ""]),
    notes: input.notes || "Auto-publish remains locked until repeated proof and Scott workflow signoff exist.",
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
}

export function evaluateAutoPublishReadiness(input = {}) {
  const workspace = input.workspace || {};
  const context = input.context || workspace.context || {};
  const policy = createAutoPublishPolicy(input.policy || workspace.autoPublishPolicy || {});
  const proof = input.proof || findProof(workspace, context);
  const proofResult = proof ? evaluatePlatformProof(proof) : { ok: false, summary: "No platform proof record found." };
  const licenseCheck = input.licenseCheck || { ok: false, reason: "Automation license has not been checked." };
  const workflowSignoff = input.workflowSignoff ?? workspace.workflowSignoff ?? workspace.scottWorkflowSignoff ?? null;
  const checks = [
    {
      id: "policy_enabled",
      label: "Policy enabled",
      ok: Boolean(policy.enabled && policy.status === "enabled"),
      reason: policy.enabled && policy.status === "enabled"
        ? "Auto-publish policy is explicitly enabled."
        : "Auto-publish policy is locked.",
    },
    {
      id: "workflow_signoff",
      label: "Scott workflow signoff",
      ok: !policy.requireWorkflowSignoff || signoffAccepted(workflowSignoff),
      reason: signoffAccepted(workflowSignoff)
        ? "Workflow signoff is recorded."
        : "Scott workflow signoff is required before auto-publish.",
    },
    {
      id: "platform_proof",
      label: "Platform proof",
      ok: !policy.requirePlatformProof || Boolean(proofResult.ok),
      reason: proofResult.summary || "Platform proof is required.",
    },
    {
      id: "automation_license",
      label: "Automation license",
      ok: !policy.requireAutomationLicense || Boolean(licenseCheck.ok),
      reason: licenseCheck.ok ? "Automation license permits this platform." : licenseCheck.reason || "Automation license is required.",
    },
  ];
  const blocked = checks.filter((check) => !check.ok);
  return {
    ok: blocked.length === 0,
    status: blocked.length ? "locked" : "ready",
    policy,
    checks,
    blockers: blocked.map((check) => check.reason),
    summary: blocked.length
      ? `Auto-publish locked: ${blocked.map((check) => check.label).join(", ")}.`
      : "Auto-publish prerequisites are complete.",
  };
}

export function canAutoPublishDraft(draft, input = {}) {
  if (!draft) return { ok: false, reason: "Missing draft" };
  const readiness = evaluateAutoPublishReadiness(input);
  if (!readiness.ok) return { ok: false, reason: readiness.summary, readiness };
  const policy = readiness.policy;
  if (!policy.allowedApprovalLevels.includes(draft.approvalLevel || "")) {
    return { ok: false, reason: `Approval level is not allowed for auto-publish: ${draft.approvalLevel || "missing"}.`, readiness };
  }
  if (!policy.allowedQualityGates.includes(draft.qualityGate || "")) {
    return { ok: false, reason: `Quality gate is not allowed for auto-publish: ${draft.qualityGate || "missing"}.`, readiness };
  }
  if (!["approved", "staged"].includes(draft.status)) {
    return { ok: false, reason: "Draft must be approved or staged before auto-publish.", readiness };
  }
  return { ok: true, reason: "Draft can be auto-published.", readiness };
}

export function autoPublishDecisionMarkdown(readiness) {
  const lines = [
    "# Diamond Auto-Publish Decision",
    "",
    `Status: ${titleCase(readiness.status)}`,
    `Summary: ${readiness.summary}`,
    "",
  ];
  for (const check of readiness.checks || []) {
    lines.push(`- ${check.label}: ${check.ok ? "Ready" : "Blocked"} - ${check.reason}`);
  }
  return lines.join("\n");
}

function findProof(workspace, context) {
  const id = platformProofId({
    companyId: context.companyId,
    brandId: context.brandId,
    platform: context.platform,
    socialAccountId: context.socialAccountId,
  });
  return (workspace.platformProofs || []).find((proof) => proof.id === id)
    || (workspace.platformProofs || []).find((proof) => (
      proof.companyId === context.companyId
        && proof.brandId === context.brandId
        && proof.platform === context.platform
    ));
}

function signoffAccepted(value) {
  if (value === true) return true;
  if (!value || typeof value !== "object") return false;
  return value.status === "accepted" || value.status === "signed_off" || value.accepted === true;
}

function normalizeList(value = []) {
  const list = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(list.map((item) => String(item || "").trim()).filter((item) => item !== undefined))];
}

function whole(value, fallback) {
  const number = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function titleCase(value) {
  return String(value || "")
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
