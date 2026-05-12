const assert = require("node:assert/strict");
const {
  firestoreDocumentToPlainObject,
  licenseFromFirestoreDocument,
  licenseFirebasePath,
} = require("../src/firebase-license.cjs");

const document = {
  name: "projects/diamond/databases/(default)/documents/products/diamond/licenses/scott",
  fields: {
    product: { stringValue: "diamond" },
    userId: { stringValue: "scott" },
    email: { stringValue: "scott@example.com" },
    role: { stringValue: "user" },
    status: { stringValue: "active" },
    brandLimit: { integerValue: "3" },
    brands: { arrayValue: { values: [{ stringValue: "the-card" }, { stringValue: "diamond" }] } },
    platformLimit: { integerValue: "4" },
    platforms: { arrayValue: { values: [{ stringValue: "x" }, { stringValue: "instagram" }] } },
    automationPlatforms: { arrayValue: { values: [{ stringValue: "x" }] } },
    entitlements: {
      mapValue: {
        fields: {
          automationDefault: { booleanValue: false },
        },
      },
    },
  },
};

const plain = firestoreDocumentToPlainObject(document);
assert.equal(plain.brandLimit, 3);
assert.deepEqual(plain.brands, ["the-card", "diamond"]);
assert.equal(plain.entitlements.automationDefault, false);

const license = licenseFromFirestoreDocument(document);
assert.equal(license.product, "diamond");
assert.equal(license.firebasePath, "products/diamond/licenses/scott");
assert.equal(license.source, "firebase");
assert.ok(license.lastVerifiedAt);
assert.equal(licenseFirebasePath("Scott User"), "products/diamond/licenses/scott-user");

console.log("All Diamond Firebase license tests passed.");
