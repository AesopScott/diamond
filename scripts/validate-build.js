import { createPostDraft, createSeedWorkspace, browserProfilePath, canStageDraft } from "../src/index.js";

const workspace = createSeedWorkspace();
const draft = createPostDraft({
  context: workspace.context,
  text: "Join the free World Cup league and chase the leaderboard.",
  approvalPolicy: workspace.approvalPolicies[0],
});

const stageCheck = canStageDraft(draft);

console.log("Diamond validation");
console.log(`company=${workspace.context.companyId}`);
console.log(`brand=${workspace.context.brandId}`);
console.log(`platform=${workspace.context.platform}`);
console.log(`profile=${browserProfilePath(workspace.context)}`);
console.log(`draftApproval=${draft.approvalLevel}`);
console.log(`canStage=${stageCheck.ok}`);

if (draft.approvalLevel !== "auto_allowed") {
  throw new Error(`Expected safe draft to be auto_allowed, got ${draft.approvalLevel}`);
}
if (!stageCheck.ok) {
  throw new Error(`Expected safe draft to be stageable, got ${stageCheck.reason}`);
}
