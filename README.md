# Diamond

Diamond is a standalone multitenant social operating system. It is being built to generate campaign content, manage approvals, stage posts in visible browser sessions, and eventually coordinate replies and metrics across multiple companies and social accounts.

Polaris is an integration target, not a runtime dependency. Diamond should have every component it needs to run by itself.

## Current Slice

This first build slice adds the local project core:

- tenant context validation
- company/brand/social account identity rules
- browser profile path isolation
- draft creation
- risk flag detection
- approval gating
- seed workspace
- validation and test scripts
- standalone Electron shell
- visible social browser webviews
- local state persistence

## Commands

```powershell
npm install
npm start
npm test
npm run validate
```
