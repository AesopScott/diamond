import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../src/renderer/posts-prototype.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/renderer/posts-prototype.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../src/renderer/posts-prototype.js", import.meta.url), "utf8");

assert.match(html, /Diamond Posts Prototype/);
assert.match(html, /id="posts-board"/);
assert.match(html, /Posts/);
assert.match(html, /Analytics/);
assert.match(html, /Templates/);
assert.match(html, /Calendar/);
assert.match(html, /Accounts/);
assert.match(html, /Brands/);
assert.match(html, /Settings/);

assert.match(css, /\.prototype-shell/);
assert.match(css, /\.posts-board/);
assert.match(css, /\.post-column/);
assert.match(css, /\.post-card/);
assert.match(css, /grid-template-columns: repeat\(5/);

assert.match(js, /buildPostBoardView/);
assert.match(js, /loadPrototypeState/);
assert.match(js, /buildSampleWorkspace/);
assert.match(js, /renderBoard/);

console.log("All Diamond posts prototype tests passed.");
