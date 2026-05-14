# Diamond Production Shell Replacement Plan

Date: 2026-05-14

## Decision

Replace the current Diamond renderer shell with the Diamond-style shell.

The replacement should proceed, but not as a one-shot overwrite. The current shell still has working production wiring for browser staging, account setup, session checks, logs, validation, and scheduling. The new shell has the better product structure, so the right move is to make it the production shell while keeping the current shell reachable as a legacy fallback during integration.

## Replacement Rule

The new shell becomes the default only after these flows are working inside it:

- Create and edit a post package.
- Generate and edit platform drafts.
- Evaluate, approve, schedule, stage, and mark a post.
- Open and use platform account sessions.
- View and change company, brand, campaign, and account scope.
- Review schedule/calendar status.
- Read license, Firebase, legal, accessibility, and routine settings.
- Open Operator tools for browser staging, validation, sync checks, and run logs.

## Integration Sequence

1. Add a shell switch. Built with `src/renderer/index.html`, `src/renderer/shell-switch.js`, and `src/renderer/legacy-shell.html`.
   - Keep the existing `src/renderer/index.html` reachable as the legacy shell.
   - Add a route or query flag for the new shell.
   - Default to the legacy shell until the wiring steps below are done.

2. Move the prototype shell into production file structure.
   - Promote the prototype layout, CSS, and navigation to production-owned files.
   - Preserve `posts-prototype.html` as a reference until the production shell is verified.
   - Keep archive files in `docs/archive/diamond-current-ui-2026-05-14/`.

3. Wire Posts first. First pass built: the Diamond shell now hydrates saved app state, prefers persisted `postPackages/platformDrafts`, and saves newly created packages through `window.diamond.saveState`.
   - Use existing post package helpers.
   - Replace prototype sample state with persisted app state.
   - Ensure board cards open real package detail.
   - Keep platform-specific drafts editable.
   - First action pass built: platform drafts can be evaluated, approved, scheduled, staged, marked posted, or abandoned from the Diamond post detail.

4. Wire Accounts and Brands next. First pass built: the Diamond shell can add companies, brands, campaigns, and social accounts; edit account URLs/session status; edit brand workspace fields; and set the active account or brand scope.
   - Make company, brand, campaign, and social account state persistent.
   - Keep accounts scoped per company and brand.
   - Restore add company, add brand, add account, save, and session-check actions.

5. Wire Calendar and Scheduling. First pass built: Calendar now reads real scheduled records, scopes them to the active company/brand/campaign, and supports load, stage, mark posted, and cancel actions.
   - Connect scheduled post records to the Calendar page.
   - Make Schedule post create or update a persisted scheduled post.
   - Keep calendar scoped by active company, brand, campaign, and platform.

6. Wire Settings. First pass built: Settings now has real action buttons for saving settings, checking Firebase, syncing the Firebase license cache, exporting the Firestore sync bundle, and copying legal summaries.
   - Move Firebase Admin, License, Legal Drafts, theme, accessibility, and routine due-window settings into the Settings page.
   - Keep the temporary unlimited license active until the shop exists.
   - Keep license checks backed by Firebase when available and offline grace when not.
   - Save editable license identity, theme, accessibility baseline fields, and routine cadence limits from the Diamond shell.

7. Wire Operator drawer. First pass built: Operator buttons now open account pages, update session status, run Playwright-assisted staging, record proof runs, validate active packages, sync license, check Firebase, and export Firestore bundles.
   - Connect Evaluate, Approve, Stage in browser, Worker stage, Capture run, and proof controls.
   - Keep the visible browser out of the main post board.
   - Put advanced validation and run logs in the drawer.

8. Manual verification pass. First pass built: static shell buttons now either have handler contracts or are visibly disabled, and `tests/production-shell-verification-tests.js` keeps that gate in `npm test`.
   - Verify X, Facebook, and TikTok logged-in sessions still survive app restarts.
   - Verify the embedded browser can use the full visible window.
   - Verify every visible button either works or is clearly disabled.
   - Verify smaller screens do not clip button text.
   - Header actions for scheduling and analytics export now route to real work; post-detail media/platform controls are wired.

9. Flip the default. Built: `src/renderer/shell-switch.js` now defaults to the Diamond shell while preserving explicit `?shell=legacy` rollback.
   - Make the Diamond-style shell the default renderer.
   - Keep `legacy` available for one release.
   - Remove legacy only after the user confirms the new shell is doing the real work.

## Rollback

Rollback should not require Git surgery.

- Open `index.html?shell=legacy` to force the legacy route and store it as the selected shell.
- Open `index.html?shell=diamond` to return to the Diamond default if legacy was stored locally.
- Full restore remains possible from the archive or Git commit `98f71a9`.

## Immediate Next Build

Run the Diamond default shell smoke pass from `docs/diamond-default-shell-smoke-checklist.md`, then decide whether to keep legacy for one release or remove it after confirmation. Use `npm run smoke` for the automated gate before opening the app.

