import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const indexHtml = readFileSync(new URL("../src/renderer/index.html", import.meta.url), "utf8");
const switchJs = readFileSync(new URL("../src/renderer/shell-switch.js", import.meta.url), "utf8");
const legacyHtml = readFileSync(new URL("../src/renderer/legacy-shell.html", import.meta.url), "utf8");
const diamondShellHtml = readFileSync(new URL("../src/renderer/posts-prototype.html", import.meta.url), "utf8");

assert.match(indexHtml, /Diamond Shell Switch/);
assert.match(indexHtml, /href="\.\/legacy-shell\.html"/);
assert.match(indexHtml, /href="\.\/posts-prototype\.html"/);
assert.match(indexHtml, /src="\.\/shell-switch\.js"/);

assert.match(switchJs, /diamond\.shell/);
assert.match(switchJs, /DEFAULT_SHELL = "diamond"/);
assert.match(switchJs, /legacy: "\.\/legacy-shell\.html"/);
assert.match(switchJs, /diamond: "\.\/posts-prototype\.html"/);
assert.match(switchJs, /params\.get\("shell"\)/);
assert.match(switchJs, /selectedShell = requestedShell \|\| storedShell \|\| DEFAULT_SHELL/);
assert.match(switchJs, /window\.location\.replace\(SHELL_ROUTES\[selectedShell\]\)/);

assert.match(legacyHtml, /<title>Diamond<\/title>/);
assert.match(legacyHtml, /id="social-webview"/);
assert.match(legacyHtml, /src="\.\/renderer\.js"/);
assert.match(diamondShellHtml, /<title>Diamond Posts Prototype(?: v2)?<\/title>/);
assert.match(diamondShellHtml, /id="posts-board"/);
assert.match(diamondShellHtml, /src="\.\/posts-prototype\.js"/);

console.log("All Diamond shell switch tests passed.");

