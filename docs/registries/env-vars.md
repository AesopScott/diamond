# Environment Variables Registry

Every environment variable used in Diamond. For each: producers, consumers, status. Update whenever an env var is added, removed, or its usage changes.

---

## `REPLICATE_API_KEY`

API authentication key for Replicate.com image generation service (Flux Pro model).

**Type:** string (Bearer token format)

**Producer**
- `.env.local` (local development) or secret manager (production) — set by operator before app startup

**Consumers**
- `src/replicate-image-service.js:22` — `authenticateReplicateRequest()` reads and validates presence

**Constraints:**
- Required for image generation to work
- Must be a valid Replicate API key (format: `rep_...`)
- Never logged or exposed in error messages
- Loaded at app startup; missing key should fail gracefully with user-facing error

**Status:** ✓ wired — consumer implementation complete (task #9), producer is environment config

---

## Summary

| Variable | Producer | Consumer | Status |
|---|---|---|---|
| `REPLICATE_API_KEY` | .env.local / secret manager | replicate-image-service.js | ✓ |

---

## Audit Trail — Proof of Registry Verification

**Last audit:** 2026-05-25T18:00:00Z (by /cross-boundary-audit)

**Boundaries checked:** Environment variables used for external API authentication

**Evidence recorded:**
- 1 entry total (new for task #9)
- 1 entry with complete producer/consumer pair ✓
- 0 orphan producers/consumers
- New identifiers introduced on task #9: `REPLICATE_API_KEY`

**Gaps identified:** None

**Status:** Audit complete — consumer implementation wired, producer is environment config
