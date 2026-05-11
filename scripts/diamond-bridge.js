import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createSeedWorkspace, triggerDiamondRoutine } from "../src/index.js";

const args = parseArgs(process.argv.slice(2));
const defaultState = path.join(process.env.APPDATA || os.homedir(), "Diamond", "state.json");
const statePath = args.state || defaultState;
const routine = args.routine || "run-due-slots";
const write = Boolean(args.write);
const workspace = fs.existsSync(statePath)
  ? JSON.parse(fs.readFileSync(statePath, "utf8"))
  : createSeedWorkspace();

const { workspace: nextWorkspace, result } = triggerDiamondRoutine(workspace, {
  routine,
  context: workspace.context,
  now: args.now,
  dueWindowMs: args.dueWindowMs ? Number(args.dueWindowMs) : undefined,
});

if (write) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(nextWorkspace, null, 2), "utf8");
}

console.log(JSON.stringify({
  ok: true,
  routine,
  statePath,
  wroteState: write,
  result,
}, null, 2));

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    if (key === "write") {
      parsed.write = true;
      continue;
    }
    parsed[key] = values[index + 1];
    index += 1;
  }
  return parsed;
}
