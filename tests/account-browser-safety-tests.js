import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const js = readFileSync(new URL("../src/renderer/posts-prototype.js", import.meta.url), "utf8");

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

console.log("All Diamond account browser safety tests passed.");
