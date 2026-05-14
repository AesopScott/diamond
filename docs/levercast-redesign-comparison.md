# Diamond Levercast-Style Redesign Comparison

Date: 2026-05-14

## Captures

- Archived current UI: `docs/levercast-redesign-comparison/01-archived-current-ui.png`
- New posts board: `docs/levercast-redesign-comparison/02-new-posts-board.png`
- New operator drawer: `docs/levercast-redesign-comparison/03-new-operator-drawer.png`

## Summary

The prototype is ready to move from isolated comparison toward replacing the current renderer shell, with one caution: the replacement should happen behind a rollback-friendly integration step rather than by deleting the old production surface.

## What Improved

- The primary workflow is clearer. The new shell starts with posts, status columns, filters, and creation instead of mixing tenant setup, post package controls, browser controls, logs, and active target state into one screen.
- Navigation is easier to understand. Posts, Analytics, Templates, Calendar, Accounts, Brands, and Settings are now separate destinations instead of stacked panels.
- The account and operator work is less visually noisy. Browser staging, validation, Firebase, license, proof, and run-log controls now live in explicit places.
- The prototype has a better mental model for the product. A post package is the source idea, while platform drafts become children of that package.
- The archive remains usable. The previous renderer files are preserved under `docs/archive/diamond-current-ui-2026-05-14/`.

## What Still Needs Attention

- The posts board currently has uneven vertical rhythm when the Failed column wraps to a second row at 1440px. This is acceptable for the prototype, but the replacement shell should tune board layout before production.
- The Operator drawer is readable, but long preflight content can push important controls below the fold. It should gain section collapsing or sticky actions later.
- The old interface still contains working production browser controls. The new prototype has the layout and model, but some controls are still presentational until wired into the production renderer.
- The production app needs an explicit rollback path before replacement, ideally by keeping the old renderer route reachable for one release.

## Replacement Recommendation

Proceed to the replacement planning step.

Recommended path:

1. Add a feature switch that can load either the current renderer shell or the Levercast-style shell.
2. Move the prototype shell into the production renderer file structure without removing the archived current UI.
3. Wire the new shell to the existing renderer actions one page at a time: Posts first, then Accounts, then Calendar, then Settings, then Operator.
4. Keep the old shell available as `legacy` until the staging, account setup, and schedule flows are verified in the new shell.
5. After manual verification, make the new shell default and leave the archive docs intact.

## Decision

Step 13 is complete. The prototype is visually and structurally strong enough to advance to step 14: decide and plan the production shell replacement.
