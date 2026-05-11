import assert from "node:assert/strict";
import {
  getDiamondLegalDocuments,
  validateLegalDocuments,
} from "../src/index.js";

const documents = getDiamondLegalDocuments();
assert.equal(documents.length, 2);
assert.deepEqual(documents.map((document) => document.id), ["terms", "privacy"]);
assert.ok(documents.every((document) => document.status === "draft"));
assert.ok(documents.find((document) => document.id === "terms").sections.some((section) => /passwords/i.test(section.body)));
assert.ok(documents.find((document) => document.id === "privacy").sections.some((section) => /browser session/i.test(section.title)));

const validation = validateLegalDocuments(documents);
assert.equal(validation.ok, true);
assert.deepEqual(validation.issues, []);

const invalid = validateLegalDocuments([{ id: "terms", status: "final", sections: [] }]);
assert.equal(invalid.ok, false);
assert.match(invalid.issues.join("\n"), /must clearly be marked draft/);

console.log("All Diamond legal content tests passed.");

