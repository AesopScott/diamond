# Diamond Current UI Archive

Archived on 2026-05-14 before the Diamond-style redesign planning work.

Reference commit: `98f71a9`

## Purpose

This folder preserves the current Diamond interface so we can compare the new redesign against the working app that existed before the redesign started.

This is not the primary rollback mechanism. Git remains the source of truth for restoring code, but this archive makes the old UI easy to inspect without hunting through history.

## Archived Files

- `src-renderer/index.html`
- `src-renderer/renderer.js`
- `src-renderer/styles.css`
- `BUILD_PLAN.md`
- `style-mockups.html`

## Restore Notes

To restore the archived UI manually, copy the three files in `src-renderer/` back to `src/renderer/`.

To restore through Git, use commit `98f71a9` as the pre-redesign reference point.

