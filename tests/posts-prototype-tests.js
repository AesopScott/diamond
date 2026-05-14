import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../src/renderer/posts-prototype.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/renderer/posts-prototype.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../src/renderer/posts-prototype.js", import.meta.url), "utf8");

assert.match(html, /Diamond Posts Prototype/);
assert.match(html, /id="posts-board"/);
assert.match(html, /id="calendar-view"/);
assert.match(html, /id="calendar-board"/);
assert.match(html, /id="prototype-nav"/);
assert.match(html, /id="post-detail"/);
assert.match(html, /id="idea-text"/);
assert.match(html, /id="platform-previews"/);
assert.match(html, /Posts/);
assert.match(html, /Analytics/);
assert.match(html, /Templates/);
assert.match(html, /Calendar/);
assert.match(html, /Accounts/);
assert.match(html, /Brands/);
assert.match(html, /Settings/);

assert.match(css, /\.prototype-shell/);
assert.match(css, /\.hidden/);
assert.match(css, /\.posts-board/);
assert.match(css, /\.post-column/);
assert.match(css, /\.post-card/);
assert.match(css, /\.post-detail/);
assert.match(css, /\.platform-preview/);
assert.match(css, /\.social-preview/);
assert.match(css, /\.calendar-board/);
assert.match(css, /\.calendar-group/);
assert.match(css, /\.calendar-item/);
assert.match(css, /grid-template-columns: repeat\(5/);

assert.match(js, /buildPostBoardView/);
assert.match(js, /loadPrototypeState/);
assert.match(js, /buildSampleWorkspace/);
assert.match(js, /renderBoard/);
assert.match(js, /openCreateDetail/);
assert.match(js, /openPackageDetail/);
assert.match(js, /renderPlatformPreviews/);
assert.match(js, /handlePrototypeNav/);
assert.match(js, /renderCalendar/);
assert.match(js, /calendarGroups/);

console.log("All Diamond posts prototype tests passed.");
