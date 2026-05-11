import assert from "node:assert/strict";
import {
  buildInsertComposerScript,
  buildOpenMediaPickerScript,
  insertComposerText,
  openMediaPicker,
} from "../src/index.js";

assert.match(buildInsertComposerScript("hello"), /composer selector missing/);
assert.match(buildInsertComposerScript("hello"), /composer is not editable/);
assert.match(buildInsertComposerScript("hello"), /composer insert command failed/);
assert.match(buildOpenMediaPickerScript(), /media input selector missing/);

assert.deepEqual(
  await insertComposerText(null, "hello"),
  { ok: false, reason: "embedded browser does not support script execution" },
);
assert.deepEqual(
  await openMediaPicker({}),
  { ok: false, reason: "embedded browser does not support script execution" },
);

assert.deepEqual(
  await insertComposerText({
    executeJavaScript: async () => ({ ok: false, reason: "composer selector missing" }),
  }, "hello"),
  { ok: false, reason: "composer selector missing" },
);

assert.deepEqual(
  await insertComposerText({
    executeJavaScript: async () => ({ ok: false, reason: "composer is not editable" }),
  }, "hello"),
  { ok: false, reason: "composer is not editable" },
);

assert.deepEqual(
  await insertComposerText({
    executeJavaScript: async () => ({ ok: false, reason: "composer insert command failed" }),
  }, "hello"),
  { ok: false, reason: "composer insert command failed" },
);

assert.deepEqual(
  await insertComposerText({
    executeJavaScript: async () => ({ ok: true, reason: "composer text inserted" }),
  }, "hello"),
  { ok: true, reason: "composer text inserted" },
);

assert.deepEqual(
  await openMediaPicker({
    executeJavaScript: async () => ({ ok: false, reason: "media input selector missing" }),
  }),
  { ok: false, reason: "media input selector missing" },
);

assert.deepEqual(
  await openMediaPicker({
    executeJavaScript: async () => ({ ok: true, reason: "platform file picker opened" }),
  }),
  { ok: true, reason: "platform file picker opened" },
);

assert.deepEqual(
  await insertComposerText({
    executeJavaScript: async () => { throw new Error("guest frame refused script"); },
  }, "hello"),
  { ok: false, reason: "guest frame refused script" },
);

console.log("All Diamond X browser adapter tests passed.");
