# Diamond Session Handoff - 2026-05-16

Use this file to brief a fresh Codex session on what happened in the Diamond build and what matters next.

## Current Repo

- Repo: `C:\Users\scott\Code\diamond`
- Branch: `main`
- Remote: `https://github.com/AesopScott/diamond.git`
- Working tree at handoff: clean
- Latest pushed commit: `89606ab fix: align brand guidance module grid`

## High-Level Product Direction

Diamond is a standalone Electron app for managing social media operations across multiple companies and brands. It should later plug into Polaris, but Diamond must work on its own.

Important product constraints:

- Diamond and Polaris are separate products.
- Diamond licensing is independent and will eventually be checked from Firebase.
- The app needs multitenancy: companies, brands, campaigns, accounts, templates, schedules, and post guidance must be scoped correctly.
- Social accounts are per company/brand.
- The app should not use social platform APIs for posting. It should use visible browser sessions and human review.
- Be extremely careful with live social accounts. Do not create hidden refresh loops, repeated login checks, forced webview rebuilds, or automatic page loads that could trigger platform anti-abuse systems.

## Recent User Context

The user is testing Diamond with:

- Project name: `Care Guide`
- Company/product/brand: `Parental Care Guide`
- Website: `parentalcareguide.com`
- The old `thecard.bet / The Card` data should remain in Diamond, but the user is now working through a new brand setup for Parental Care Guide.

The user does not want explanations full of engineering jargon. They need simple, direct explanations and concrete UI behavior.

## Safety Lessons From This Session

The user had serious trouble with social platform accounts:

- X account was suspended after previous Diamond login/browser behavior.
- TikTok showed maximum login attempt/suspension behavior.
- The user believes Diamond caused this by flashing/reloading login pages or running repeated login checks.

Never casually automate live social login pages.

Important safety rules now in code:

- Account browser resizing must not recreate or reload a live social webview.
- Selecting an account must not automatically load the platform login page.
- Closing the account browser must not navigate the live page to `about:blank`.
- Webview load events must not trigger automatic reloads/navigation.
- Manual login controls are rate-limited.

Relevant test:

- `tests/account-browser-safety-tests.js`

## Commits From This Diamond Session

Recent pushed commits:

- `89606ab fix: align brand guidance module grid`
- `2e64b55 fix: initialize guidance modules before startup`
- `e1f5dd1 feat: add brand guidance modules`
- `1cb29a0 feat: restore account platform status board`
- `5b2f297 test: guard account browser remote safety`
- `aaf9232 feat: add account composer navigation`
- `b1f6d05 feat: add youtube longform and pinterest platforms`
- `8a88912 fix: lock account browser session partitions`
- `e038ad3 fix: restore canonical account browser profiles`
- `c6d0362 feat: add platform slots to account selector`
- `dccae93 fix: add account browser address controls`
- `21e7337 fix: stop account login browser refresh loop`

## Account Page Work Completed

The old Diamond Accounts page had a useful view showing all platforms and whether each one was logged in or not. That behavior has been restored as a platform status board.

Current Accounts behavior:

- Shows every supported platform for selected company/brand.
- Shows status at a glance: ready, needs login, unknown, blocked, not added.
- Clicking a platform selects it or creates the account record.
- Clicking a platform does not automatically load or refresh the social login page.
- Login pages load only when the user explicitly clicks a load/go action.
- YouTube Shorts and YouTube Long Form both exist and share the same Google/YouTube browser session.
- Pinterest was added.

Supported platforms:

- X
- Instagram
- TikTok
- LinkedIn
- YouTube Shorts
- YouTube Long Form
- Facebook
- Pinterest
- Reddit

Files touched:

- `src/renderer/posts-prototype.js`
- `src/renderer/posts-prototype.css`
- `tests/posts-prototype-tests.js`
- `tests/account-browser-safety-tests.js`

## Browser Persistence And Account Safety

Recent work restored safer persistent account browser profiles:

- Browser sessions are locked to stable partitions.
- YouTube Shorts and YouTube Long Form share the same partition.
- The account browser has an address bar and explicit buttons.
- The browser panel should not resize by reloading/recreating live platform pages.

User still needs to manually verify persistence across restarts. Avoid touching live accounts unless the user explicitly asks.

## Brand Guidance Modules

The old Brands page had hard-coded right-side windows such as:

- Voice
- Approved phrases
- Banned phrases
- Prize language
- Free-to-play language
- Requires review
- Blocked claims

The user found this confusing because fields like prize language and free-to-play language are specific to The Card, not every brand.

Decision:

Call these panes **Guidance Modules**.

Current behavior:

- The Brands page has a top bar of guidance module buttons.
- Clicking a module button enables/disables that module for the selected brand.
- Enabled modules appear as panels.
- Disabled modules are hidden but preserved.
- There is a `+ Add guidance module` button.
- Each module panel has a `Delete module` button.
- Enable/disable, add, and delete save immediately per brand.
- Editing module text/content requires clicking `Save brand`.

Important user-facing rule:

- Module on/off state: autosaves immediately.
- Module text/content: click `Save brand`.

## Guidance Modules And Post Creation

The user asked whether new posts should always reference all guidance modules.

Implemented:

- New post packages carry a snapshot of enabled brand guidance modules.
- New platform drafts carry a snapshot of enabled brand guidance modules.
- Draft evaluation reads enabled guidance modules.
- Legacy risk/claim checks still work through synced fields.

This means a post has a record of the guidance it was created/evaluated against.

Files touched:

- `src/post-package.js`
- `src/renderer/posts-prototype.js`
- `src/seed.js`
- `tests/posts-prototype-tests.js`

## Guidance Module Grid Fix

The user showed a screenshot where only two enabled guidance modules were floating too low and the panels were uneven sizes.

Implemented:

- Guidance panels now start immediately below the guidance module button bar.
- Panels flow from top-left to top-right, then the next row left-to-right.
- If only one or two modules are enabled, they stay pinned at the top.
- Guidance panels use the same fixed card height.
- The textarea fills the panel and no longer changes the card height.

Latest commit:

- `89606ab fix: align brand guidance module grid`

## Startup Bug Fixed

After adding guidance modules, navigation broke because the app crashed on startup before click handlers were attached.

Cause:

- `DEFAULT_GUIDANCE_MODULES` was defined below the startup call to `renderBrands()`.
- `renderBrands()` ran before the constant was initialized.

Fix:

- Moved `DEFAULT_GUIDANCE_MODULES` above startup rendering.
- Added a regression assertion in `tests/posts-prototype-tests.js`.

Commit:

- `2e64b55 fix: initialize guidance modules before startup`

## Known UI Preferences From User

The user wants:

- Clean layouts with visual hierarchy and color separation.
- Buttons that work and do not get text clipped.
- Dropdowns that actually open/select.
- Less clutter on account detail pages.
- Company/brand/campaign hierarchy to be visually clear.
- Brands under companies, campaigns under brands, connected with simple L-style hierarchy lines.
- Templates should be under Posts, not Analytics.
- Accounts should be near the top of the left nav.
- Analytics near the end before Settings.
- Campaign fields should live on the Campaigns page, not Brands.
- Brand guidance modules should be optional and brand-specific.

## Current Verification Commands

Before pushing or declaring done, run:

```powershell
node --check src\renderer\posts-prototype.js
node tests\posts-prototype-tests.js
node tests\account-browser-safety-tests.js
npm test
npm run validate
```

Recent runs passed:

- `node --check src\renderer\posts-prototype.js`
- `node tests\posts-prototype-tests.js`
- `node tests\post-package-tests.js`
- `npm test`
- `npm run validate`

## Important Files

- Main renderer: `src/renderer/posts-prototype.js`
- Main CSS: `src/renderer/posts-prototype.css`
- Seed workspace: `src/seed.js`
- Post package model: `src/post-package.js`
- Safety tests: `tests/account-browser-safety-tests.js`
- Renderer coverage: `tests/posts-prototype-tests.js`
- Operator manual: `docs/DIAMOND_OPERATOR_MANUAL.md`
- Main build plan: `BUILD_PLAN.md`

## Likely Next Work

Potential next items:

1. Manually verify the Brands guidance module layout in the running app.
2. Decide whether guidance module text should autosave or continue requiring `Save brand`.
3. Add clearer UI help explaining what guidance modules are.
4. Add drag/drop or explicit ordering for guidance modules.
5. Continue account-page cleanup, but avoid live-login automation risk.
6. Continue Care Guide onboarding: company, brand, accounts, templates, campaigns, guidance modules, and social account creation flow.
7. Add system map completion indicators if the user returns to that question.

## Tone And Collaboration Notes

The user is frustrated when buttons break, when UI concepts are unclear, or when changes affect live social accounts. Be direct, own mistakes, and fix first.

Avoid saying things like “it acts like a browser” unless proven. For social sites, say exactly what Diamond does: it embeds a browser/webview with persistent partitioned session storage, but platforms may still detect unusual embedded or automated behavior.

When explaining, use simple product language:

- “This saves immediately.”
- “This needs Save brand.”
- “This does not load the social page until you click Load login.”
- “This is per brand.”

Do not over-explain internals unless asked.
