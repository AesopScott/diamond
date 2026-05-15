const CHECKLIST = [
  {
    id: "strategy",
    label: "Strategy",
    checks: ["campaign goals", "audience", "pillars", "CTA"],
  },
  {
    id: "calendar",
    label: "Calendar",
    checks: ["editorial slots", "scheduled posts", "due-window routine"],
  },
  {
    id: "brand_safety",
    label: "Brand Safety",
    checks: ["approved phrases", "banned phrases", "claim library", "approval policy"],
  },
  {
    id: "assets",
    label: "Assets",
    checks: ["media records", "render templates", "alt text", "safe zones"],
  },
  {
    id: "approvals",
    label: "Approvals",
    checks: ["draft approval", "human gate", "proof capture", "manual publish boundary"],
  },
  {
    id: "reply_triage",
    label: "Reply Triage",
    checks: ["reply capture", "classification", "response drafts", "escalation"],
  },
  {
    id: "cadence",
    label: "Cadence",
    checks: ["max posts", "max replies", "quiet hours", "cooldowns"],
  },
  {
    id: "metrics",
    label: "Metrics",
    checks: ["post URL", "screenshots", "impressions", "clicks", "signups"],
  },
  {
    id: "memory",
    label: "Memory",
    checks: ["posted history", "duplicate prevention", "performance notes"],
  },
  {
    id: "multitenancy",
    label: "Multitenancy",
    checks: ["companies", "brands", "campaigns", "social accounts"],
  },
  {
    id: "audit_logs",
    label: "Audit Logs",
    checks: ["runs", "operator logs", "proof sessions", "sync exports"],
  },
  {
    id: "platform_safety",
    label: "Platform Safety",
    checks: ["platform adapters", "monitoring-only limits", "assisted staging boundaries"],
  },
];

export function getDiamondExpertChecklist() {
  return CHECKLIST.map((item) => ({ ...item, checks: [...item.checks] }));
}

export function evaluateExpertChecklist(workspace = {}) {
  const items = getDiamondExpertChecklist().map((item) => ({
    ...item,
    ...evaluateChecklistItem(item.id, workspace),
  }));
  const counts = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, { ready: 0, needs_review: 0, blocked: 0 });
  return {
    status: counts.blocked ? "blocked" : counts.needs_review ? "needs_review" : "ready",
    counts,
    reviewedAt: new Date().toISOString(),
    items,
  };
}

export function expertChecklistMarkdown(review) {
  const lines = [
    "# Diamond Expert Checklist Review",
    "",
    `Status: ${titleCase(review.status)}`,
    `Ready: ${review.counts.ready}`,
    `Needs review: ${review.counts.needs_review}`,
    `Blocked: ${review.counts.blocked}`,
    `Reviewed: ${review.reviewedAt}`,
    "",
  ];
  for (const item of review.items || []) {
    lines.push(`- ${item.label}: ${titleCase(item.status)} - ${item.summary}`);
  }
  return lines.join("\n");
}

function evaluateChecklistItem(id, workspace) {
  switch (id) {
    case "strategy":
      return readyIf(
        hasStrategy(workspace),
        "Campaign strategy has goals, audience, pillars, and CTA.",
        "Campaign strategy needs goals, audience, pillars, and CTA before scale."
      );
    case "calendar":
      return readyIf(
        hasRows(workspace, "editorialSlots") || hasRows(workspace, "scheduledPosts"),
        "Editorial calendar or schedule queue is populated.",
        "Add editorial slots or scheduled posts so routines have a source of truth."
      );
    case "brand_safety":
      return readyIf(
        hasRows(workspace, "brandLibraries") && hasRows(workspace, "claimLibraries") && hasRows(workspace, "approvalPolicies"),
        "Brand, claim, and approval libraries are available.",
        "Brand safety needs brand, claim, and approval library records."
      );
    case "assets":
      return readyIf(
        hasRows(workspace, "mediaLibrary") || hasRows(workspace, "assetLibrary") || hasRows(workspace, "socialTemplates"),
        "Asset library or render templates are available.",
        "Asset workflow needs media records or rendering templates."
      );
    case "approvals":
      return readyIf(
        hasRows(workspace, "approvalPolicies") && (hasRows(workspace, "platformDrafts") || hasRows(workspace, "drafts")),
        "Drafts are covered by approval policy and manual publish boundary.",
        "Approvals need draft records plus an approval policy."
      );
    case "reply_triage":
      return readyIf(
        hasRows(workspace, "socialReplies") || hasRows(workspace, "socialResponseDrafts"),
        "Reply capture and response drafts are present.",
        "Reply triage needs captured replies or response drafts."
      );
    case "cadence":
      return readyIf(
        hasRows(workspace, "cadencePolicies"),
        "Cadence policy is configured.",
        "Cadence controls need at least one policy."
      );
    case "metrics":
      return readyIf(
        hasRows(workspace, "postMetrics") || hasRunsWithMetrics(workspace),
        "Metrics are being stored with posts or runs.",
        "Metrics need post metric records or run metric fields."
      );
    case "memory":
      return readyIf(
        hasRows(workspace, "postMemory") || hasRows(workspace, "postRuns") || hasRows(workspace, "drafts"),
        "Post memory can use run or draft history.",
        "Memory needs posted history, draft history, or explicit memory records."
      );
    case "multitenancy":
      return readyIf(
        hasRows(workspace, "companies") && hasRows(workspace, "brands") && hasRows(workspace, "campaigns") && hasRows(workspace, "socialAccounts"),
        "Company, brand, campaign, and account records are present.",
        "Multitenancy needs company, brand, campaign, and social account records."
      );
    case "audit_logs":
      return readyIf(
        hasRows(workspace, "postRuns") || hasRows(workspace, "operatorLogs") || hasRows(workspace, "platformProofs"),
        "Audit records exist through runs, operator logs, or proof records.",
        "Audit trail needs run, operator log, or proof records."
      );
    case "platform_safety":
      return readyIf(
        hasRows(workspace, "socialAccounts") && hasPlatformBoundaries(workspace),
        "Platform accounts include explicit posting or monitoring boundaries.",
        "Platform safety needs account records with explicit staging or monitoring boundaries."
      );
    default:
      return {
        status: "needs_review",
        summary: "This checklist item needs a manual review rule.",
      };
  }
}

function readyIf(condition, readySummary, reviewSummary) {
  return {
    status: condition ? "ready" : "needs_review",
    summary: condition ? readySummary : reviewSummary,
  };
}

function hasRows(workspace, key) {
  return Array.isArray(workspace[key]) && workspace[key].length > 0;
}

function hasStrategy(workspace) {
  return [...(workspace.campaignStrategies || []), ...(workspace.contentStrategies || [])].some((strategy) => (
    hasText(strategy.goals || strategy.goal)
      && hasText(strategy.audience)
      && hasList(strategy.pillars || strategy.contentPillars)
      && hasText(strategy.primaryCta || strategy.cta)
  ));
}

function hasRunsWithMetrics(workspace) {
  return (workspace.postRuns || []).some((run) => (
    run.metrics
      || run.postUrl
      || Number.isFinite(run.impressions)
      || Number.isFinite(run.clicks)
      || Number.isFinite(run.signups)
  ));
}

function hasPlatformBoundaries(workspace) {
  return (workspace.socialAccounts || []).some((account) => (
    account.monitoringOnly
      || account.platform === "reddit"
      || account.postingMode
      || account.stageMode
      || account.composeUrl
  ));
}

function hasText(value) {
  if (Array.isArray(value)) return value.some(hasText);
  return typeof value === "string" && value.trim().length > 0;
}

function hasList(value) {
  return Array.isArray(value) ? value.length > 0 : hasText(value);
}

function titleCase(value) {
  return String(value || "")
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
