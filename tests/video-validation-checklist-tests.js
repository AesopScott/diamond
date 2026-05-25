import assert from "assert";
import fs from "fs";
import path from "path";

console.log("Testing Video Generation Validation Checklist Unit 11...");

// Read the validation checklist
const checklistPath = path.resolve(process.cwd(), "docs/VIDEO-GENERATION-VALIDATION.md");
const checklistContent = fs.readFileSync(checklistPath, "utf-8");

// Verify checklist structure
assert(
  checklistContent.includes("# Video Generation Feature"),
  "Checklist should have main title"
);

assert(
  checklistContent.includes("## Configuration & Setup"),
  "Checklist should include Configuration section"
);

assert(
  checklistContent.includes("## Campaign Configuration"),
  "Checklist should include Campaign Configuration section"
);

assert(
  checklistContent.includes("## Post Creation"),
  "Checklist should include Post Creation section"
);

assert(
  checklistContent.includes("## Video Generation"),
  "Checklist should include Video Generation section"
);

assert(
  checklistContent.includes("## Post Draft State"),
  "Checklist should include Post Draft State section"
);

assert(
  checklistContent.includes("## Error Handling"),
  "Checklist should include Error Handling section"
);

assert(
  checklistContent.includes("## Email Notifications"),
  "Checklist should include Email Notifications section"
);

assert(
  checklistContent.includes("## API Error Recovery"),
  "Checklist should include API Error Recovery section"
);

// Count checkbox items
const checkboxCount = (checklistContent.match(/- \[ \]/g) || []).length;
assert(
  checkboxCount > 50,
  "Checklist should have more than 50 validation items"
);

// Verify critical sections
const criticalSections = [
  "Configuration & Setup",
  "Campaign Configuration (Unit 4-5)",
  "Post Creation (Unit 3, Unit 6)",
  "Video Generation (Unit 1-2, Unit 7)",
  "Error Handling (Unit 9)",
  "Email Notifications (Unit 10)",
];

criticalSections.forEach((section) => {
  assert(
    checklistContent.includes(section),
    `Checklist should include ${section}`
  );
});

// Verify proof units are referenced
const requiredReferences = [
  "Campaign Configuration",
  "Post Creation",
  "Video Generation",
  "Post Draft State",
  "Error Handling",
  "Email Notifications",
  "API Error Recovery",
];

requiredReferences.forEach((reference) => {
  assert(
    checklistContent.includes(reference),
    `Checklist should include ${reference}`
  );
});

console.log(`✓ Validation checklist verified (${checkboxCount} items)`);
console.log("✓ All Diamond video validation checklist tests passed.");
