import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../src/renderer/index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/renderer/styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../src/renderer/renderer.js", import.meta.url), "utf8");

assert.match(html, /<a class="skip-link" href="#main-workspace">Skip to workspace<\/a>/);
assert.match(html, /<aside class="sidebar" aria-label="Diamond controls">/);
assert.match(html, /<main id="main-workspace" class="workspace" tabindex="-1" aria-label="Diamond workspace">/);
assert.match(html, /id="jump-user-guide"[^>]+aria-controls="user-guide-panel"/);
assert.match(html, /id="jump-editorial-calendar"[^>]+aria-controls="editorial-calendar-panel"/);
assert.match(html, /id="jump-schedule-calendar"[^>]+aria-controls="schedule-calendar-panel"/);
assert.match(html, /id="risk-card"[^>]+role="status"[^>]+aria-live="polite"/);
assert.match(html, /id="run-log"[^>]+role="log"[^>]+aria-live="polite"/);
assert.match(html, /id="browser-tabs"[^>]+role="tablist"[^>]+aria-label="Social browser tabs"/);
assert.match(html, /id="social-webview"[^>]+aria-label="Visible social browser"/);
assert.match(html, /id="user-guide-panel"[^>]+tabindex="-1"[^>]+aria-labelledby="user-guide-heading"/);
assert.match(html, /id="editorial-calendar-panel"[^>]+tabindex="-1"[^>]+aria-labelledby="editorial-calendar-heading"/);
assert.match(html, /id="schedule-calendar-panel"[^>]+tabindex="-1"[^>]+aria-labelledby="schedule-calendar-heading"/);

assert.match(css, /\.skip-link/);
assert.match(css, /:focus-visible/);
assert.match(css, /--muted: #a9b5c7/);
assert.match(css, /--focus: #7dd3fc/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(css, /scroll-behavior: auto !important/);

assert.match(js, /prefersReducedMotion/);
assert.match(js, /button\.role = "tab"/);
assert.match(js, /aria-selected/);
assert.match(js, /target\.focus\(\{ preventScroll: true \}\)/);
assert.match(js, /behavior: prefersReducedMotion \? "auto" : "smooth"/);

console.log("All Diamond accessibility baseline tests passed.");
