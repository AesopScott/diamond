import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manual = readFileSync(new URL("../docs/DIAMOND_OPERATOR_MANUAL.md", import.meta.url), "utf8");

assert.match(manual, /# Diamond Operator Manual/);
assert.match(manual, /## 1\. The Basic Diamond Workflow/);
assert.match(manual, /## 3\. Posts Page/);
assert.match(manual, /## 4\. Post Detail View/);
assert.match(manual, /## 5\. Calendar/);
assert.match(manual, /## 6\. Accounts/);
assert.match(manual, /## 7\. Brands/);
assert.match(manual, /## 9\. Settings/);
assert.match(manual, /## 10\. Operator/);
assert.match(manual, /## 11\. Proof Queue/);
assert.match(manual, /## 12\. Platform Examples/);
assert.match(manual, /## 16\. Common Problems/);
assert.match(manual, /Evaluate/);
assert.match(manual, /Approve/);
assert.match(manual, /Stage in browser/i);
assert.match(manual, /Capture Proof/);
assert.match(manual, /Mark Posted/);
assert.match(manual, /manual_upload/);
assert.match(manual, /account_session/);
assert.match(manual, /auto-publish is locked/i);
assert.ok((manual.match(/Example:/g) || []).length >= 20);
assert.ok(manual.length > 20000);

console.log("All Diamond operator manual tests passed.");
