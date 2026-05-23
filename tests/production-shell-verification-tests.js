import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../src/renderer/posts-prototype.html", import.meta.url), "utf8");
const js = readFileSync(new URL("../src/renderer/posts-prototype.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/renderer/posts-prototype.css", import.meta.url), "utf8");
const preload = readFileSync(new URL("../src/electron/preload.cjs", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/electron/main.cjs", import.meta.url), "utf8");

const staticButtons = [...html.matchAll(/<button\b[^>]*>/g)].map((match) => match[0]);
const riskyButtons = staticButtons.filter((button) => {
  const hasHandlerContract = /\bid=|\bdata-[a-z0-9-]+=|\bdisabled\b/i.test(button);
  return !hasHandlerContract;
});

assert.deepEqual(riskyButtons, [], "Every static shell button should have a handler contract or be disabled.");
assert.match(js, /calendar-create-schedule/);
assert.match(js, /analytics-export/);
assert.match(js, /attachMediaToActiveDrafts/);
assert.match(js, /addPlatformToActivePackage/);
assert.match(js, /pickMedia/);
assert.match(preload, /inspectMedia/);
assert.match(preload, /inspectAccountSession/);
assert.match(preload, /dashlaneSearch/);
assert.match(preload, /dashlaneCopyField/);
assert.match(main, /diamond:dashlane-search/);
assert.match(main, /diamond:inspect-account-session/);
assert.match(main, /inspectAccountSession/);
assert.match(main, /authCookieNamesForPlatform/);
assert.match(main, /li_at/);
assert.match(main, /c_user/);
assert.match(main, /diamond:dashlane-copy-field/);
assert.match(main, /dashlaneCommandCandidates/);
assert.match(main, /C:\\\\Tools\\\\Dashlane\\\\dcli\.exe/);
assert.match(main, /DIAMOND_DASHLANE_CLI/);
assert.match(main, /try \{\s*child = execFile/);
assert.match(main, /dashlaneErrorReason\(error, ""\)/);
assert.match(main, /error\?\.code === "EINVAL"/);
assert.match(main, /runDashlaneCandidate/);
assert.match(main, /redactDashlaneEntry/);
assert.match(js, /browserPartitionId/);
assert.match(js, /accountBrowserPartition/);
assert.match(js, /Persistent session/);
assert.match(main, /attachBrowserPartitions/);
assert.match(main, /resolveBrowserPartitionId/);
assert.match(main, /Partitions/);
assert.match(html, /disabled title="Filtering lands after the default shell flip\."/);
assert.match(html, /disabled title="List view lands after the default shell flip\."/);
assert.match(css, /button:disabled/);
assert.match(css, /opacity: 0\.52/);

console.log("All Diamond production shell verification tests passed.");
