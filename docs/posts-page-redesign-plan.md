# Posts Page Redesign Plan

Branch: `task/posts-page-redesign`
Author: Claude (build session)
Status: **Revised after Codex plan-review #1 — re-review pending** (model/API decided: §5d/§8)

## 1. Why this plan exists

The Posts detail view (`src/renderer/posts-prototype.html` + `posts-prototype.js`) presents five
controls. An operator audit found that three of them are dead or misleading, one capability the
product spec requires (active company/brand/campaign/account context) is hidden on another page,
and the "generation" the page promises does not actually generate anything.

This plan redesigns the Posts detail view to be honest and intuitive, and replaces the fake
generator with real brand-voice + campaign-aware, per-platform generation — which the product
spec calls for explicitly.

### Product alignment (from `BUILD_PLAN.md` and `README.md`)

- Diamond is a **multitenant social OS**: Company → Brand → Campaign → Social Account → Post.
- **`BUILD_PLAN.md:332`** — *"The UI must always show the active company, brand, platform, and
  account before a post can be staged or published."* The current detail view shows none of these.
- **`BUILD_PLAN.md:429`** — *"Routines should generate from the editorial calendar and strategy
  layer, not invent from nothing."* Generation must consume brand voice, claim library, and
  campaign strategy.
- **`BUILD_PLAN.md:486`** — bland-AI-content control requires *"examples, voice rules, banned
  phrases."* These already exist in state (`brandLibraries`, `brandGuidanceModules`,
  `campaignGuidanceModules`, `contentStrategies`, `claimLibraries`) but are never fed to a generator.
- Posting modes are `draft_only` / `stage_for_review` / `auto_publish` (locked). Generation here is
  content creation only — it does not touch the posting/staging guardrails.

## 2. Current behavior (verified in code)

| Control | File / line | Reality |
|---|---|---|
| `4 / 20 this week` cadence pill | `posts-prototype.html:72` | **Hardcoded string.** No JS reads or writes it. |
| Generation style (`Default`, `Rob's Style`, `Claude Prompt`) | `posts-prototype.html:75-79` | **No event listener.** Options are placeholder labels. Nothing consumes the value. |
| Platform chips | `posts-prototype.js:5506-5511` (`renderPlatformButtons`) | Every chip rendered with `active` class; **no click handler** — not selectable. |
| "All ready platforms" | `posts-prototype.html:83` → `addAllReadyPlatformsToActivePackage` (`:6118`) | An **action button** styled identically to a chip (`posts-prototype.css:789-791`), so it reads as a selected platform. |
| Company / Brand / Campaign | — | **Absent from Posts.** Inherited silently from `state.context`, which is only editable on the Accounts scope strip and the Brands/Campaigns pages. |
| "Generation" | `platformCopy()` (`posts-prototype.js:6543`) and `buildSlotDraftText()` (`content-generation.js`) | `platformCopy` returns the idea verbatim (truncates X to 220). `buildSlotDraftText` concatenates strategy fields. **No model anywhere.** |

## 3. Goals / non-goals

**Goals**
1. Surface Company → Brand → Campaign (+ resolved account/platform set) in the detail view, editable, per the P0 visibility requirement.
2. Make platform targeting a real, obvious multi-select; visually separate actions from targets.
3. Add an explicit **Generate** action that produces real, platform-specific copy.
4. Replace the fake generator with brand-voice + campaign-aware generation that consumes the data the app already stores, with claim/banned-phrase enforcement.
5. Remove or honestly wire the dead controls (cadence pill, generation-style).

**Non-goals**
- No change to staging/approval/publish guardrails or posting modes.
- No change to the board, Calendar, Accounts, Brands, Campaigns, Settings, or Analytics views beyond what's needed to keep `state.context` consistent.
- No auto-publish. Generation produces drafts only.
- Not adding new social platforms.

## 4. Detail view redesign

Restructure the `.detail-tools` row (`posts-prototype.html:71-89`) into three labeled, ordered zones so intent is unambiguous:

### 4a. Scope zone (new) — "Who is this for"
Three dependent selects, bound to the **post package's own** `companyId` / `brandId` / `campaignId`
(these fields already exist on the package — `post-package.js:36-38`). The detail view treats the
**package as the single source of truth** for scope and no longer silently reads `state.context`.

- **Company** → `companyOptions(selectedCompanyId)` (`posts-prototype.js:1803`).
- **Brand** → `brandOptions(companyId, selectedBrandId)` (`:1809`), filtered by company.
- **Campaign** → `campaignOptions(companyId, brandId, selectedCampaignId)` (`:1818`) — reuse this directly; do **not** generalize `calendarCampaignOptions` (Codex should-fix 1).
- Read-only line: *"N ready accounts: X, LinkedIn, …"* from `readyAccountsForPostContext(package.context)` (`:5417`), which filters by **company + brand only**. Campaign does not gate account eligibility — it only feeds generation strategy/guidance (§5b) (Codex should-fix 2).

**Context sync algorithm (resolves Codex blocker 2):**
1. **On `openDetail(package)`** (`:5492`): seed the selects from the package fields; mirror them into `state.context` (`state.context = { ...state.context, companyId, brandId, campaignId }`) so the Accounts scope strip (`:1051`), calendar filters (`:878`, `:945`), and operator drawer (`:4657`) stay consistent with the post being edited. Resolve ready accounts from `package.context`.
2. **On a scope select change**: update `package.companyId/brandId/campaignId` + `package.context`; mirror into `state.context`; re-resolve ready accounts; refresh platform chips (§4b). Changing **Company** clears Brand+Campaign; changing **Brand** clears Campaign if it no longer belongs to that brand. This **does not regenerate or wipe** draft text (§6) — affected drafts are only marked stale with a Regenerate affordance.
3. **On navigation away**: `persistActiveDetail` (§6) has already saved the package; no extra sync. `state.context` retains the last post's scope — the same behavior the Accounts scope strip already produces when it mutates global context (`:2783`).

### 4b. Platform target zone — "Where it goes"
- **New field `postPackage.targetPlatforms: string[]`** is the source of truth for selection, decoupled from which `platformDrafts` exist (today selection is *implied* by existing drafts and `platformDraftIds` is derived in `upsertPostPackage` at `:6540`). This closes the silent-data-loss gap (Codex should-fix 3). Legacy packages initialize `targetPlatforms` from their existing drafts' platforms.
- **Explicit target list**: the writable platforms from `SUPPORTED_SOCIAL_PLATFORMS` (`:309`) **minus `reddit`** (monitoring-only per `BUILD_PLAN.md`): `x, instagram, tiktok, linkedin, youtube-shorts, youtube-longform, facebook, pinterest`. No new platforms are added.
- Render **one toggle chip per writable platform**. Active iff platform ∈ `targetPlatforms` (blue glow); untargeted = muted/outlined. Each chip is a button toggling membership and `aria-pressed`.
- Toggling **on** adds the platform to `targetPlatforms` and creates its `platformDraft` if absent. Toggling **off** removes it; if that draft has generated/edited text (`textSource !== "auto"`, §6) it **confirms first** via the existing `confirm-modal` before deleting — no silent loss.
- Only platforms in `targetPlatforms` get a preview rendered.
- Demote **"All ready platforms"** to a secondary text action **"Select all ready"** (adds every ready-account platform to `targetPlatforms`) plus **"Clear"**; restyle so it is visibly not a platform chip (`posts-prototype.css:789-791` currently makes it identical). Keep `+` grouped with these actions, not the chips.

Resolves shell-redesign Open Product Question *"create all platform drafts automatically, or only selected?"* → **only targeted**.

### 4c. Generate zone — "Make it"
- **Generation style** select: replace `Rob's Style` / `Claude Prompt`. Default approach: **derive from the selected brand's voice** plus a `Default` fallback (e.g., `Default`, `<Brand> voice`, optionally `Punchy` / `Professional`). Persist `generationStyle` on the package. The value is passed to the generator (§5). If Scott prefers, the alternative is a small fixed set; this is a labeling choice, not an architectural one.
- **Generate platform versions** button (primary): runs real generation (§5) for all targeted platforms using the package idea + scope. Shows per-platform loading state; on failure, falls back to the template generator and flags the draft.
- **Cadence pill**: **remove from the detail view.** A weekly-quota meter belongs on the board/Analytics, not the per-post toolbar, and wiring a fake here adds no operator value mid-compose. (Reversible: if Scott wants it, wire it to `cadencePolicies[0]` + a real posts-this-week count and show it on the board header instead.)
- **Tags**: unchanged (already real).

## 5. Real brand-voice + campaign-aware generation

### 5a. Architecture (keys out of renderer)
Generation calls a model. Per the guardrail *"keep service account out of renderer"* and the
existing ElevenLabs pattern (`src/electron/main.cjs:374-410` reads `ELEVENLABS_API_KEY` and calls
the API from main), **the model call lives in the Electron main process** and is exposed to the
renderer over IPC (e.g., `window.diamond.generatePostDrafts(payload)`), mirroring
`inspectAccountSession`. The renderer never sees the API key.

A new module — `src/content-generation-llm.js` (main-side) — owns:
- prompt assembly from the structured inputs below,
- the two-stage writer→reviewer pipeline (§5d),
- response parsing into `{ platform, text, changeNote }[]`,
- error normalization.

The renderer keeps a thin `requestPlatformGeneration()` that calls IPC and writes results into `platformDrafts`. Existing `platformCopy()` / `buildSlotDraftText()` become the **offline/no-key fallback**, not the primary path.

### 5b. Generation inputs (all already in `state`)
Assembled by a pure function `buildGenerationContext({ package, brand, campaign })`:
- **Idea**: `postPackage.ideaText`.
- **Brand voice + rules**: `brandLibraries` (voice, approved phrases, banned phrases) + enabled `brandGuidanceModules` (already summarized by `guidanceForContext`).
- **Campaign strategy**: `contentStrategies` for the campaign (goals, audience, pillars, offer, CTA, reference accounts) + enabled `campaignGuidanceModules`.
- **Claim rules**: `claimLibraries` (approved / requires-review / banned claims) injected as hard constraints.
- **Per-platform constraints**: char limit, format, tone, from existing platform config (`SUPPORTED_SOCIAL_PLATFORMS`, `platformStagingPlan`, char limits already in drafts).
- **Style**: the `generationStyle` from §4c.
- **Language**: existing EN/ES path preserved.

### 5c. Output handling + safety
- **Stage 1 (write — Claude):** returns one tailored draft per targeted platform.
- **Stage 2 (review + adjust — OpenAI):** revises each Stage-1 draft against brand voice, claim
  rules, and platform limits, returning the adjusted final text plus a short change note. The
  adjusted text is what gets written to `platformDrafts[].text`; the change note is retained for
  operator visibility.
- **Stage 3 — deterministic enforcement (never trust either model):** write the adjusted text into
  the draft, then run the **existing** `evaluatePlatformDraft(draft)` (`posts-prototype.js:6151`) —
  the same path manual edits already use. It calls `evaluateDraftRisk` (`risk.js:31`; banned phrases
  `:36`, blocked claims `:41`, review claims `:46`) plus quality scoring, and already sets
  `draft.status` to `blocked` / `needs_review` / `draft` and populates `riskFlags` / `riskDetails`.
  There is **no `draftEvaluations` symbol** (corrects Codex blocker 1). No generated text is
  auto-approved; a blocked/needs_review draft surfaces its reason.
- Idempotent + immutable: generation returns new draft objects; no in-place mutation of inputs.

### 5d. Providers — two-stage pipeline (decided)
Dynamic generation is a **two-model pipeline**, both called from the Electron main process:

1. **Writer — Anthropic (Claude).** Drafts the platform-specific copy from the generation context
   (§5b). Default model `claude-sonnet-4-6`, overridable via `DIAMOND_WRITER_MODEL`. Key:
   `ANTHROPIC_API_KEY` in `.env.local`.
2. **Reviewer / adjuster — OpenAI.** Receives each Claude draft plus the same brand-voice / claim /
   platform constraints, then **reviews and adjusts** it — tightening voice, fixing claim or
   character-limit violations — and returns the final text plus a brief note of what it changed.
   Default model overridable via `DIAMOND_REVIEWER_MODEL`. Key: `OPENAI_API_KEY` in `.env.local`.

Both adapters sit behind one common interface so a provider/model can be swapped via env without
code changes. Model-id defaults are intentionally easy to change ("slight modifications as we go").

### 5e. IPC contract + degradation (resolves Codex blocker 3)
Mirror the existing IPC style (`main.cjs:189` `diamond:inspect-account-session`; `preload.cjs:8`):

- **preload.cjs**: `generatePostDrafts: (payload) => ipcRenderer.invoke("diamond:generate-post-drafts", payload)`.
- **main.cjs**: `ipcMain.handle("diamond:generate-post-drafts", async (_e, payload) => generatePostDrafts(payload))`, delegating to `src/content-generation-llm.js`.
- **payload** (renderer → main): `{ idea, style, language, platforms: [{ platform, charLimit }], brand: { voice, approvedPhrases, bannedPhrases }, campaign: { goals, audience, pillars, offer, cta, guidanceSummary }, claims: {…} }`. Char limit comes from each draft's `charLimit` (`post-package.js:87`, X=280) — the single limit source; `platformCopy`'s hard-coded 220 (`:6545`) is aligned to it (nit 1).
- **response** (main → renderer): `{ ok: boolean, drafts: [{ platform, text, changeNote }], degraded: "no-writer-key" | "no-reviewer-key" | null, error?: string }`. The handler **never throws to the renderer**; failures resolve `{ ok:false, error }`.
- **per-stage timeout** ~60s. **Degradation:** missing `ANTHROPIC_API_KEY` → skip Stage 1, fall back to the template generator (`platformCopy` / `buildSlotDraftText`), `degraded:"no-writer-key"`. Missing `OPENAI_API_KEY` → keep Stage-1 Claude text unreviewed, `degraded:"no-reviewer-key"`, `changeNote:"reviewer unavailable"`. Each path sets the draft's `textSource` / `generationStatus` (§6) so the UI flags it.

## 6. State / data changes
- **`postPackage`** (`createPostPackage`, `post-package.js:25`): `companyId`/`brandId`/`campaignId` already exist (`:36-38`) and become editable from the detail (§4a). Add optional **`generationStyle`** (default `"Default"`) and **`targetPlatforms: string[]`** (§4b). Backfill at runtime for legacy packages (style → `Default`; targets ← existing drafts' platforms).
- **`createPlatformDraft`** (`post-package.js:56`) gains optional fields (Codex should-fix 5): **`textSource`** `"auto" | "manual" | "llm" | "template-fallback"` (default `"auto"`), **`generationStatus`** `"idle" | "generating" | "ok" | "error" | "fallback"`, **`generationError`** (string|null), **`changeNote`** (reviewer note, string|null). Existing drafts default to `textSource:"auto"`.
- **`persistActiveDetail` fix** (`posts-prototype.js:6505`, Codex should-fix 4): today it overwrites **every** draft's `text` with `platformCopy(idea)` on each save (`:6519`), which would erase generated/edited copy. Change it to update idea/title/tags only and refresh `draft.text` from `platformCopy(idea)` **only when `draft.textSource === "auto"`**. Generated (`llm` / `template-fallback`) and manually edited (`manual`) drafts keep their text. `handlePlatformDraftTextInput` (`:6141`) sets `textSource:"manual"` when the operator edits.
- No persisted-schema migration; all new fields are optional with safe defaults. `state.context` mirroring per §4a.

## 7. Files to change
- `src/renderer/posts-prototype.html` — restructure `.detail-tools`; add scope selects, real platform zone, Generate button; remove cadence pill; relabel "All ready".
- `src/renderer/posts-prototype.js` — `openDetail` (+ scope sync), `renderPlatformButtons` (→ real toggles over `targetPlatforms`), scope-change handlers, `persistActiveDetail` gating on `textSource`, `handlePlatformDraftTextInput` sets `manual`, `requestPlatformGeneration` (IPC call + Stage-3 enforcement), wire generation-style; keep `platformCopy` as fallback.
- `src/renderer/posts-prototype.css` — platform target vs. action styling; scope row layout.
- `src/content-generation-llm.js` *(new, main-side)* — Anthropic writer + OpenAI reviewer adapters and prompt assembly.
- `src/electron/main.cjs` + `src/electron/preload.cjs` — IPC `diamond:generate-post-drafts` / `generatePostDrafts` (mirror `inspect-account-session` at `main.cjs:189` / `preload.cjs:8`).
- `src/post-package.js` — add `generationStyle` + `targetPlatforms` to `createPostPackage`; add `textSource` / `generationStatus` / `generationError` / `changeNote` to `createPlatformDraft`.
- `src/content-generation.js` — keep as fallback; optionally export `buildGenerationContext` (pure).
- `src/risk.js` — no change; `evaluateDraftRisk` reused as-is for Stage-3 enforcement.
- Tests under `tests/` for: scope filtering, platform toggle state, prompt-context assembly, the writer→reviewer pipeline (mocked providers), claim/banned enforcement on adjusted text, fallback when either key is missing.

## 8. Model/API configuration (decided)
- **Writer:** Anthropic Claude — `ANTHROPIC_API_KEY`, default `claude-sonnet-4-6` (`DIAMOND_WRITER_MODEL` to override).
- **Reviewer / adjuster:** OpenAI — `OPENAI_API_KEY`, model via `DIAMOND_REVIEWER_MODEL` (sensible GPT default; Scott can set the exact id).
- **Key location:** `.env.local`, consistent with `ELEVENLABS_API_KEY`. Never read in the renderer.
- **Degradation:** missing either key → fall back to the template generator (§5a) and flag drafts; the UI stays usable offline.

## 9. Verification / proof
- RED→GREEN unit tests per §7 list.
- Manual: open a post, change Company/Brand/Campaign, confirm ready-account line updates; toggle platforms; click Generate; confirm per-platform copy reflects brand voice + campaign CTA; confirm a banned phrase routes a draft to `needs_review`; confirm offline (no key) falls back to template text with a flag.

## 10. Rollback safety
- Additive where possible; `platformCopy`/`buildSlotDraftText` retained as fallback so removing the key or the IPC handler degrades gracefully to current behavior.
- No board/data-model migration; legacy shell route untouched.

## 11. Codex plan-review #1 resolutions
| Codex finding | Where addressed |
|---|---|
| Blocker 1 — enforcement cited non-existent `draftEvaluations` | §5c — uses real `evaluatePlatformDraft` / `evaluateDraftRisk` (`risk.js:31`). |
| Blocker 2 — context sync undefined | §4a — explicit open / change / navigate-away algorithm. |
| Blocker 3 — IPC contract too thin | §5e — channel, preload method, payload/response shape, timeout, degradation. |
| Should-fix 1 — `calendarCampaignOptions` stale | §4a — uses `campaignOptions` (`:1818`) directly. |
| Should-fix 2 — campaign vs account eligibility | §4a — campaign feeds strategy only, not the account filter. |
| Should-fix 3 — platform-toggle data loss | §4b / §6 — `targetPlatforms` field + confirm-on-destructive-untoggle. |
| Should-fix 4 — `persistActiveDetail` clobbers text | §6 — gate text refresh on `textSource === "auto"`. |
| Should-fix 5 — no fallback/status fields | §6 — `textSource` / `generationStatus` / `generationError` / `changeNote`. |
| Nit 1 — X char-limit mismatch (220 vs 280) | §5e — single source = draft `charLimit`. |
| Nit 2 — `generationStyle` persistence | §6 — runtime default `Default`, persisted on next save. |
| Nit 3 — implicit platform list | §4b — explicit writable list, Reddit excluded. |
