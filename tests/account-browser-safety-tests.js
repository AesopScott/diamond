import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const js = readFileSync(new URL("../src/renderer/posts-prototype.js", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/electron/main.cjs", import.meta.url), "utf8");

function functionBody(name) {
  const start = js.indexOf(`function ${name}`);
  assert.notEqual(start, -1, `${name} should exist`);
  const bodyStart = js.indexOf("{", start);
  let depth = 0;
  for (let index = bodyStart; index < js.length; index += 1) {
    const char = js[index];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return js.slice(bodyStart + 1, index);
  }
  throw new Error(`${name} body was not closed`);
}

const accountBrowserFunctions = [
  "initializeAccountLoginWebview",
  "wireAccountLoginWebviewEvents",
  "sizeAccountLoginWebview",
  "scheduleAccountLoginResizePasses",
  "refreshAccountLoginWebviewBounds",
  "forceRefreshAccountLoginWebviewBounds",
  "accountVisibleBrowserUrl",
  "reloadAccountLoginPanel",
  "loadAccountLoginPanelUrl",
  "destroyAccountLoginWebview",
].map((name) => [name, functionBody(name)]);

const joinedAccountBrowserCode = accountBrowserFunctions.map(([, body]) => body).join("\n");

assert.doesNotMatch(
  joinedAccountBrowserCode,
  /refreshAccountLoginWebviewBounds\(\{\s*force:\s*true/,
  "Account browser must not force-rebuild a live social webview.",
);
assert.doesNotMatch(
  functionBody("sizeAccountLoginWebview"),
  /executeJavaScript/,
  "Account browser sizing must not inject JavaScript into remote login pages.",
);
assert.doesNotMatch(
  functionBody("destroyAccountLoginWebview"),
  /about:blank/,
  "Closing the account browser must not navigate the remote page to about:blank first.",
);
assert.doesNotMatch(
  functionBody("wireAccountLoginWebviewEvents"),
  /reload\(|setAttribute\("src"|\.src\s*=/,
  "Webview load events must not trigger automatic remote navigation or reload.",
);
assert.doesNotMatch(
  functionBody("refreshAccountLoginWebviewBounds"),
  /replaceWith|document\.createElement\("webview"\)|setAttribute\("src"/,
  "Resizing the account browser must not recreate or reload a live social webview.",
);
assert.doesNotMatch(
  functionBody("renderAccountLoginBrowser"),
  /account\.loginPanelUrl \|\| account\.currentUrl \|\| loginUrl/,
  "Selecting an account must not automatically load the platform login page.",
);
assert.match(
  functionBody("accountAutoRestoreUrl"),
  /sessionStatus !== "ready"/,
  "Only accounts marked ready should automatically restore a platform page.",
);
assert.doesNotMatch(
  functionBody("accountAutoRestoreUrl"),
  /loginUrl|normalizeLoginUrl|resolveLoginUrl/,
  "Automatic account restore must not choose the platform login URL.",
);
assert.match(
  functionBody("accountVisibleBrowserUrl"),
  /accountBrowserLoadedAccountIds\.has/,
  "Manual account loads should survive the save/render cycle for the selected account.",
);
assert.match(
  js,
  /accountBrowserLoadedAccountIds\.add\(account\.id\)/,
  "Load actions should mark the selected account as intentionally loaded in this app session.",
);
assert.match(
  js,
  /ACCOUNT_LOGIN_ACTION_COOLDOWNS/,
  "Manual login controls should remain rate-limited.",
);
assert.match(
  functionBody("forceRefreshAccountLoginWebviewBounds"),
  /sizeAccountLoginWebview/,
  "Fit browser should only resize the surface, not reload or recreate it.",
);
assert.doesNotMatch(
  main,
  /repairVolatileChromiumStorage\(\)|Service Worker|QuotaManager|fs\.rmSync\(target/,
  "App startup must not delete Chromium storage that can hold social login state.",
);

console.log("All Diamond account browser safety tests passed.");
