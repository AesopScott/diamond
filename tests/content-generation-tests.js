import assert from "node:assert/strict";
import {
  buildSlotDraftText,
  createSeedWorkspace,
} from "../src/index.js";

const workspace = createSeedWorkspace();
const strategy = workspace.contentStrategies[0];
const slot = workspace.editorialSlots[0];

const english = buildSlotDraftText({ ...slot, language: "en" }, strategy);
const spanish = buildSlotDraftText({ ...slot, language: "es" }, strategy);

assert.match(english, /World Cup/);
assert.match(english, /Join the free World Cup league/);
assert.match(spanish, /Mundial/);
assert.match(spanish, /Unete gratis/);
assert.notEqual(english, spanish);

console.log("All Diamond content generation tests passed.");
