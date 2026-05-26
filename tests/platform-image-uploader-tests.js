import assert from "node:assert/strict";
import {
  getPlatformImageSpec,
  validateImageForPlatform,
  buildImageUploadPayload,
  uploadImageToPlatform,
} from "../src/index.js";

// Test 1: Platform image specifications exist for all 7 platforms
const platforms = ["x", "instagram", "tiktok", "linkedin", "youtube", "facebook", "reddit"];

for (const platform of platforms) {
  const spec = getPlatformImageSpec(platform);
  assert.ok(spec, `Platform ${platform} has spec`);
  assert.ok(spec.maxSize > 0);
  assert.ok(Array.isArray(spec.formats));
  assert.ok(spec.dimensions.width > 0);
  assert.ok(spec.dimensions.height > 0);
}

// Test 2: Image validation rejects missing URLs
const noUrlResult = validateImageForPlatform(null, "instagram");
assert.equal(noUrlResult.ok, false);
assert.match(noUrlResult.error, /URL required/i);

// Test 3: Image validation rejects non-HTTPS URLs
const httpResult = validateImageForPlatform("http://example.com/image.jpg", "instagram");
assert.equal(httpResult.ok, false);
assert.match(httpResult.error, /HTTPS/i);

// Test 4: Image validation accepts valid URLs
const validResult = validateImageForPlatform("https://example.com/image.jpg", "instagram");
assert.equal(validResult.ok, true);
assert.ok(validResult.spec);

// Test 5: Image validation rejects unknown platforms
const unknownPlatform = validateImageForPlatform("https://example.com/image.jpg", "unknown-platform");
assert.equal(unknownPlatform.ok, false);
assert.match(unknownPlatform.error, /Unknown platform/);

// Test 6: Upload payload building
const payload = buildImageUploadPayload({
  imageUrl: "https://replicate.delivery/output/abc123/image.webp",
  platform: "instagram",
  prompt: "A vibrant illustration of startup success",
});
assert.equal(payload.ok, true);
assert.equal(payload.platform, "instagram");
assert.ok(payload.metadata.uploadedAt);

// Test 7: Platform-specific uploads return structured responses
const testImageUrl = "https://replicate.delivery/test/image.webp";

(async () => {
  const xResult = await uploadImageToPlatform({
    platform: "x",
    imageUrl: testImageUrl,
  });
  assert.equal(xResult.ok, true);
  assert.equal(xResult.platform, "x");
  assert.ok(xResult.mediaId);

  const igResult = await uploadImageToPlatform({
    platform: "instagram",
    imageUrl: testImageUrl,
    caption: "Test caption",
  });
  assert.equal(igResult.ok, true);
  assert.equal(igResult.platform, "instagram");
  assert.ok(igResult.mediaId);

  const ttResult = await uploadImageToPlatform({
    platform: "tiktok",
    imageUrl: testImageUrl,
  });
  assert.equal(ttResult.ok, true);
  assert.equal(ttResult.platform, "tiktok");

  const liResult = await uploadImageToPlatform({
    platform: "linkedin",
    imageUrl: testImageUrl,
    title: "Test post",
  });
  assert.equal(liResult.ok, true);
  assert.equal(liResult.platform, "linkedin");

  const ytResult = await uploadImageToPlatform({
    platform: "youtube",
    imageUrl: testImageUrl,
  });
  assert.equal(ytResult.ok, true);
  assert.equal(ytResult.platform, "youtube");

  const fbResult = await uploadImageToPlatform({
    platform: "facebook",
    imageUrl: testImageUrl,
  });
  assert.equal(fbResult.ok, true);
  assert.equal(fbResult.platform, "facebook");

  const redditResult = await uploadImageToPlatform({
    platform: "reddit",
    imageUrl: testImageUrl,
  });
  assert.equal(redditResult.ok, true);
  assert.equal(redditResult.platform, "reddit");

  // Test 8: Uploading to unknown platform returns error
  const unknownResult = await uploadImageToPlatform({
    platform: "unknown-platform",
    imageUrl: testImageUrl,
  });
  assert.equal(unknownResult.ok, false);
  assert.match(unknownResult.error, /No uploader/);

  console.log("All platform image uploader tests passed.");
})();
