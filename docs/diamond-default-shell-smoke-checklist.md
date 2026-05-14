# Diamond Default Shell Smoke Checklist

Date: 2026-05-14

## Automated Gate

Run this before opening the app:

```powershell
npm run smoke
```

This verifies that the Diamond shell is the default route, legacy remains available, static shell buttons are either wired or visibly disabled, and the build validation still permits staging.

## App Launch

1. Run `npm start`.
2. Confirm the app opens to the Diamond posts-first shell by default.
3. If the legacy shell opens because it was stored locally, open `index.html?shell=diamond` once to restore Diamond as the selected shell.
4. Confirm rollback still works with `index.html?shell=legacy`.

## Posts Flow

1. Click `Create`.
2. Enter a short post idea.
3. Confirm platform draft previews appear.
4. Click `Evaluate`, `Approve`, `Schedule`, and `Stage` on a draft.
5. Confirm the post card status changes and the Calendar sees the scheduled post.

## Account And Brand Flow

1. Open `Accounts`.
2. Select X, Facebook, and TikTok accounts if present.
3. Confirm company, brand, campaign, handle, browser profile, login URL, compose URL, and expected host are visible.
4. Click `Save account`, `Set active`, and `Mark ready`.
5. Open `Brands` and confirm company, brand, and campaign fields persist after saving.

## Calendar And Analytics

1. Open `Calendar`.
2. Use `Load`, `Stage`, `Posted`, and `Cancel` on a scheduled item where available.
3. Open `Analytics`.
4. Click `Export` and confirm the Firestore bundle path appears in Settings after export.

## Settings And Operator

1. Open `Settings`.
2. Click `Check Firebase`, `Sync license`, `Export Firestore bundle`, and `Copy legal summary`.
3. Open `Operator`.
4. Confirm `Open account`, `Check session`, `Validate package`, `Check Firebase`, and `Export bundle` show status feedback.
5. Only run `Stage in browser` when you are ready for Playwright to open the platform compose page.

## Layout

1. Resize the app narrow enough to approximate a small laptop.
2. Confirm button text wraps or shrinks instead of clipping.
3. Confirm disabled placeholder controls look disabled and show explanatory titles on hover.

## Pass Criteria

- The default shell is Diamond.
- Legacy rollback still opens.
- No visible enabled button is dead.
- Create, evaluate, approve, schedule, stage, settings sync, and operator validation all produce visible state changes.
- Existing X, Facebook, and TikTok sessions are not lost by the default-shell change.
