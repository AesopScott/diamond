# Diamond Polaris Bridge

Diamond remains a standalone Electron app. Polaris can trigger Diamond routines through the CLI bridge and can read Firestore-shaped sync bundles exported by Diamond.

## Routine Trigger

```powershell
npm run bridge -- --routine run-due-slots --state "$env:APPDATA\Diamond\state.json" --write
```

Supported routines:

- `run-due-slots`: generate drafts for due planned slots in the active Diamond context.
- `generate-next-slot`: generate the next planned slot even if it is not due yet.

The bridge prints JSON with generated draft IDs, routine run IDs, skipped counts, and sync collection counts.

## Firebase Mapping

Diamond sync bundles map local state to:

- `postDrafts`
- `scheduledPosts`
- `postRuns`
- `metrics`
- `socialReplies`
- `socialResponseDrafts`
- `postMemory`

Service account JSON stays outside the renderer. The Electron main process checks `DIAMOND_FIREBASE_ADMIN_JSON` or `GOOGLE_APPLICATION_CREDENTIALS` and only returns redacted status to the UI.

## Launch Path

Polaris can launch Diamond with:

```powershell
npm start
```

Diamond continues to work without Polaris. Local state remains at `%APPDATA%\Diamond\state.json` unless Polaris passes a different state file to the bridge.
