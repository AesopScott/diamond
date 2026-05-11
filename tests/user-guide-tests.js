import assert from "node:assert/strict";
import {
  buildTourVoiceoverScript,
  createElevenLabsSpeechRequest,
  getDiamondGuideSections,
  getDiamondTourSteps,
  validateDiamondTourSteps,
} from "../src/index.js";

const guideSections = getDiamondGuideSections();
assert.ok(guideSections.length >= 6);
assert.equal(guideSections[0].title.startsWith("1."), true);
assert.ok(guideSections.every((section) => section.summary && section.steps.length >= 3));

const tourSteps = getDiamondTourSteps();
assert.ok(tourSteps.length >= 8);
assert.deepEqual(tourSteps.map((step) => step.order), [1, 2, 3, 4, 5, 6, 7, 8]);

const validation = validateDiamondTourSteps(tourSteps);
assert.equal(validation.ok, true);
assert.deepEqual(validation.issues, []);

const invalid = validateDiamondTourSteps([{ id: "broken" }]);
assert.equal(invalid.ok, false);
assert.match(invalid.issues.join("\n"), /missing a title/);
assert.match(invalid.issues.join("\n"), /missing a target selector/);
assert.match(invalid.issues.join("\n"), /missing voiceover text/);

const script = buildTourVoiceoverScript(tourSteps);
assert.match(script, /Start with the Active target/);
assert.match(script, /Use the visible browser/);

const request = createElevenLabsSpeechRequest({
  voiceId: "voice_123",
  text: script,
});
assert.equal(request.ok, true);
assert.equal(request.provider, "elevenlabs");
assert.equal(request.method, "POST");
assert.equal(request.apiKeyHeader, "xi-api-key");
assert.equal(request.apiKeyEnvVar, "ELEVENLABS_API_KEY");
assert.match(request.endpoint, /https:\/\/api\.elevenlabs\.io\/v1\/text-to-speech\/voice_123/);
assert.equal(request.body.model_id, "eleven_multilingual_v2");
assert.equal(request.body.language_code, "en");
assert.equal(request.body.text, script);

const missingText = createElevenLabsSpeechRequest({ voiceId: "voice_123" });
assert.equal(missingText.ok, false);
assert.match(missingText.reason, /text is required/);

const missingVoice = createElevenLabsSpeechRequest({ text: "Hello" });
assert.equal(missingVoice.ok, false);
assert.match(missingVoice.reason, /voiceId is required/);

console.log("All Diamond user guide tests passed.");

