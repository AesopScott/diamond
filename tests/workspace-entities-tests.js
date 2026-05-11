import assert from "node:assert/strict";
import {
  createBrandRecord,
  createCampaignRecord,
  createCompanyRecord,
} from "../src/index.js";

const company = createCompanyRecord({ name: "Mojo AI Studio" });
assert.equal(company.id, "mojo-ai-studio");
assert.equal(company.name, "Mojo AI Studio");
assert.equal(company.defaultApprovalPolicyId, "default-risk-review");

const brand = createBrandRecord({ name: "Diamond", companyId: company.id, languages: ["en", "es"] });
assert.equal(brand.id, "diamond");
assert.equal(brand.companyId, "mojo-ai-studio");
assert.deepEqual(brand.languages, ["en", "es"]);

const campaign = createCampaignRecord({ name: "Launch", companyId: company.id, brandId: brand.id });
assert.equal(campaign.id, "launch");
assert.equal(campaign.companyId, company.id);
assert.equal(campaign.brandId, brand.id);
assert.equal(campaign.status, "planning");

assert.throws(() => createCompanyRecord({}), /Company name is required/);
assert.throws(() => createBrandRecord({ name: "No Company" }), /Brand companyId is required/);
assert.throws(() => createCampaignRecord({ name: "No Brand", companyId: company.id }), /Campaign brandId is required/);

console.log("All Diamond workspace entity tests passed.");

