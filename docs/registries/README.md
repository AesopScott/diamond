# Cross-Boundary Registries

This directory contains registries of cross-boundary names in Diamond — places where two pieces of code, config, or infrastructure refer to the same name independently and can disagree.

## What Is a Boundary?

A **boundary** exists wherever a name (collection name, field name, environment variable, API endpoint, etc.) is produced in one place and consumed in another, with no syntactic constraint forcing them to match.

**Examples:**
- A Firestore collection name like `"postPackages"` is used in `src/firebase-sync.js` to write documents and in `src/renderer/posts-prototype.js` to read them. If someone renames the collection in one place but not the other, the app silently breaks.
- An environment variable like `REPLICATE_API_KEY` is set in `.env.local` but read in `src/replicate-image-service.js`. Typos or mismatches go undetected by the compiler.
- A campaign schema field like `imageGenerationSettings` is written by the campaign UI and read by the content generation engine. If the field is removed from one place but the other still expects it, runtime errors occur.

## Registry Files

Each file in this directory documents one boundary kind:

| File | Scope |
|---|---|
| `env-vars.md` | Environment variables used in Diamond (API keys, config paths, etc.) |
| `firestore-collections.md` | Firestore collection and sub-collection names, schema overview |
| `campaign-schema.md` | Top-level fields in campaign documents |
| `post-schema.md` | Fields in post package and platform draft documents |

## Registry Format

Each registry lists every name in the boundary kind, with:

- **Description** — what the name is for
- **Schema/Type** — the expected structure (for Firestore fields, API requests, etc.)
- **Producers** — every `file:line` that writes/sets/emits this name
- **Consumers** — every `file:line` that reads/checks/subscribes to this name
- **Status** — ✓ (wired correctly), ⚠ (gap: orphan producer/consumer, shape mismatch, or misnamed)
- **Audit Trail** — timestamp of the last `/cross-boundary-audit` verification run

## Maintenance Rules

**When adding a new name (collection, field, env var, etc.),** update the relevant registry in the same commit:

1. Decide which registry it belongs to (or create a new one if a new boundary kind).
2. Add the name, producers, consumers, schema, and status (`⚠ NEW`).
3. Link it from the Summary table.
4. Commit with a message like:
   ```
   docs: add {name} to {registry-kind} registry
   
   New boundary for task #{n}: {description}
   ```

**When renaming a name,** update all references in the registry and all producers/consumers in code simultaneously. Commit both together.

**When removing a name,** delete it from the registry and from all producers/consumers. Commit in one change.

**When a producer or consumer moves or changes,** update the registry's `file:line` references and re-run `/cross-boundary-audit` to verify no new gaps.

## Verification Workflow

To verify that registries match the current code:

```bash
/cross-boundary-audit
```

This skill:
1. Scans the codebase for all producers and consumers of registered names
2. Reports any orphan producers (names written but never read) or consumers (names read but never written)
3. Checks for shape mismatches between producer and consumer (e.g., producer writes `{x: boolean}` but consumer expects `{x: string}`)
4. Updates the Audit Trail section in each registry with verification results and timestamp
5. Lists any gaps that need fixing or accepting (with notes)

## Gap Categories

| Status | Meaning | Action |
|---|---|---|
| ✓ | Producer(s) and consumer(s) exist, shapes match | No action needed |
| ⚠ orphan producer | Name is produced but never consumed | Likely dead code; refactor or document the intentional bypass (e.g., feature flag set but not yet checked) |
| ⚠ orphan consumer | Name is consumed but never produced | **Critical gap.** Code will fail at runtime when it tries to use the name. Add the producer or remove the consumer. |
| ⚠ shape mismatch | Producer and consumer agree on the name but not the structure (fields, types) | Data corruption or runtime error. Reconcile the two definitions. |
| ⚠ misnamed | Same logical concept spelled differently in different places (e.g., `familyGroups` vs `family_groups`) | Consistent naming failure. Rename one and update the registry. |
| ⚠ NEW | Name was added in a recent plan and producers/consumers are still being implemented | Expected during active development. Re-audit after code lands to verify producers/consumers exist. |

## Design Philosophy

Registries are **living documents**, not aspirational specs. They document what the code actually does. Every PR that touches a registered name must update the registry in the same commit, so registries and code stay in sync.

Registries are **inputs to architecture review** — they reveal gaps (orphan producers/consumers) that indicate bugs or unfinished work. Run `/cross-boundary-audit` before merging a task branch to catch these gaps early.

Registries are **not contracts** — they don't constrain how you write code, they just document what cross-references exist so you can reason about correctness.

---

## Gaps from Recent Audits

The most recent `/cross-boundary-audit` run (2026-05-25T13:45:00Z) recorded these gaps as expected during task #9 planning:

- ⚠ `REPLICATE_API_KEY` — env var added, consumer implementation deferred to task #9 build session
- ⚠ `images` collection — planned for task #9, producers/consumers to be implemented
- ⚠ `imageGenerationSettings` field — planned for task #9, producers/consumers to be implemented
- ⚠ `imageToggleOverrides` field — planned for task #9, producers/consumers to be implemented
- ⚠ `generatedImageMetadata` field — planned for task #9, producers/consumers to be implemented

These gaps are intentional and expected. Re-run `/cross-boundary-audit` after task #9 build completes to verify all producers and consumers exist.

---

Last updated: 2026-05-25 by `/cross-boundary-audit`
