# Polaris Validation Notes

## Findings

- Polaris is an Electron app with a Node server process.
- `main.js` enables `webviewTag: true`, so an embedded visible social browser is compatible with the current Electron shell.
- Polaris already has Firebase MCP catalog support through `firebase-tools@latest mcp`.
- Firebase service account JSON selection maps to `GOOGLE_APPLICATION_CREDENTIALS` in `resources/mcp-catalog.json`.
- Existing routine documentation and server code indicate scheduled routines are currently single-turn DeepSeek jobs without tools.
- Polaris also has launch paths for agent sessions, so Diamond should start as a local tool/worker that Polaris can call intentionally instead of assuming existing routines can operate browsers directly.

## Build Implication

Diamond should be built as a standalone Electron app with:

- tenant-safe data models
- draft/risk/approval logic
- browser profile identity rules
- validation scripts
- visible social browser webviews
- local state persistence
- its own UI and workflow

The Polaris bridge should come after Diamond can prove one company, one brand, one platform, one browser profile, and one staged post without relying on Polaris-provided components.
