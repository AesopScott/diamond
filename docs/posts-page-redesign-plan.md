# Posts Page Redesign Plan

Branch: `task/posts-page-redesign`
Author: Claude (build session)
Status: **Draft — pending Codex plan review and one model/API decision from Scott**

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
A labeled row of three dependent selects bound to the **post package's own** `companyId` / `brandId` / `campaignId` (the package already stores these — `post-package.js` / data model in `diamond-shell-redesign-plan.md:104-113`):

- **Company** → `companyOptions(selected)` (existing helper).
- **Brand** → `brandOptions(companyId, selected)` (existing helper); filtered by company.
- **Campaign** → campaign options filtered by company+brand (reuse the pattern in `calendarCampaignOptions`, generalized).
- A read-only line: *"N ready accounts: X, LinkedIn, …"* derived from `readyAccountsForPostContext`, so the operator sees which platforms scope resolves to.

Changing any select updates the package context, re-resolves ready accounts, refreshes the platform chips, and (per the no-surprise rule) does **not** silently regenerate text — it marks existing drafts stale and prompts regeneration.

`state.context` stays in sync so other views remain consistent, but the **package is the source of truth** for the detail view (fixes the "silent inherit" problem).

### 4b. Platform target zone — "Where it goes"
- Render **one toggle chip per supported platform** (not just per existing draft). Targeted = `active` (blue glow); untargeted = muted/outlined. Chips are buttons with a click handler that toggles target state and aria-pressed.
- Only targeted platforms get a `platformDraft` + preview. Untargeting removes that platform's draft (with confirm if it has edited text).
- Demote **"All ready platforms"** to a clearly secondary text action labeled **"Select all ready"** (and add **"Clear"**). Restyle so it is visibly not a platform chip (`posts-prototype.css` — different shape/weight, e.g., text button).
- Keep the `+` add-platform affordance, grouped with the actions, not the chips.

Resolves shell-redesign Open Product Question *"create all platform drafts automatically, or only selected?"* → **only selected/targeted**.

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
- a single provider adapter (chosen in §5d),
- response parsing into `{ platform, text }[]`,
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
- The model returns one tailored draft per targeted platform; written to `platformDrafts[].text`.
- **Post-generation enforcement (not trust the model):** run each draft through the existing
  evaluation/claim/banned-phrase checks (`quality.js`, claim library, `draftEvaluations`). Banned
  phrases or unapproved risky claims force the draft to `needs_review` and surface the reason —
  consistent with the fail-closed rule. No generated text is auto-approved.
- Idempotent + immutable: generation returns new draft objects; no in-place mutation of inputs.

### 5d. Provider — **DECISION NEEDED FROM SCOTT** (§8)
The adapter is provider-agnostic; exactly one provider is wired first. Key is read from
`.env.local` (same convention as `ELEVENLABS_API_KEY`). Candidates in §8.

## 6. State / data changes
- `postPackage`: ensure `companyId`, `brandId`, `campaignId`, `generationStyle` are read/written from the detail view (fields already exist in the model; `generationStyle` is new and optional).
- No migration required; missing `generationStyle` defaults to `Default`.
- `state.context` updated on scope change to keep cross-view consistency.

## 7. Files to change
- `src/renderer/posts-prototype.html` — restructure `.detail-tools`; add scope selects, real platform zone, Generate button; remove cadence pill; relabel "All ready".
- `src/renderer/posts-prototype.js` — `openDetail`, `renderPlatformButtons` (→ real toggles), new scope-change handlers, `requestPlatformGeneration`, wire generation-style; keep `platformCopy` as fallback.
- `src/renderer/posts-prototype.css` — platform target vs. action styling; scope row layout.
- `src/content-generation-llm.js` *(new, main-side)* — provider adapter + prompt assembly.
- `src/electron/main.cjs` + preload — IPC `generatePostDrafts` (mirror ElevenLabs/`inspectAccountSession`).
- `src/content-generation.js` — keep as fallback; optionally export `buildGenerationContext` (pure).
- Tests under `tests/` for: scope filtering, platform toggle state, prompt-context assembly, claim/banned enforcement on generated text, fallback when no key.

## 8. Open decisions for Scott (model/API only)
1. **Provider + model** for generation. Candidates:
   - **Anthropic direct (Claude)** — strongest copy quality; `ANTHROPIC_API_KEY`.
   - **OpenRouter** — one key, swap models freely (matches Polaris agent path).
   - **OpenAI** / **DeepSeek** (cheapest; matches Polaris routine path).
2. **Key location** — confirm `.env.local` (consistent with ElevenLabs) is correct.
3. **Default model string** for the chosen provider.

## 9. Verification / proof
- RED→GREEN unit tests per §7 list.
- Manual: open a post, change Company/Brand/Campaign, confirm ready-account line updates; toggle platforms; click Generate; confirm per-platform copy reflects brand voice + campaign CTA; confirm a banned phrase routes a draft to `needs_review`; confirm offline (no key) falls back to template text with a flag.

## 10. Rollback safety
- Additive where possible; `platformCopy`/`buildSlotDraftText` retained as fallback so removing the key or the IPC handler degrades gracefully to current behavior.
- No board/data-model migration; legacy shell route untouched.
