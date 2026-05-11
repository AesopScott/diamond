# Diamond Build Plan

## Build Checklist

This is the live top-level checklist for the three-build plan. Checked items are implemented in the current Diamond app; unchecked items remain to be built or formally verified.

### Completion Queue

This is the current order for finishing the remaining checklist items.

1. Terms of Service and privacy policy page/content.
2. Accessibility baseline: keyboard navigation, screen reader labels, color contrast, and reduced motion.
3. Founder/investor and campaign image templates.
4. Spanish UI labels needed for operator review.
5. Configurable routine due window.
6. Platform-specific proof work: repeated X staging, then repeated manual proof for Instagram, TikTok, LinkedIn, YouTube Shorts, and Facebook.
7. Reddit monitoring capture workflow.
8. Expert checklist review and Scott workflow signoff.
9. Decide whether `auto_publish` ever becomes available.

### Build 1: Standalone X Posting Loop

- [x] Standalone Electron app shell
  - [x] Local state persistence
  - [x] Thecard.bet default tenant
  - [x] Visible embedded social browser
  - [x] Browser focus mode
  - [x] Browser sizing/fit controls
- [x] Active tenant/account context
  - [x] Company selector
  - [x] Brand selector
  - [x] Campaign selector
  - [x] Social account selector
  - [x] Visible active target banner
  - [x] Company/account guard before staging
- [x] X account/session workflow
  - [x] Account URL, login URL, compose URL, host, and browser profile fields
  - [x] Isolated browser profile path per company/platform/account
  - [x] Session check
  - [x] Manual mark-ready
  - [x] Preserve login through Electron browser profile
  - [ ] Formal repeated X staging proof across three separate app sessions
- [x] Post package workflow
  - [x] Draft text area
  - [x] Numbered action buttons
  - [x] Equal-size action button grid
  - [x] Evaluate draft
  - [x] Approve draft
  - [x] Stage in browser
  - [x] Upload media helper
  - [x] Capture run
  - [x] Mark posted
  - [x] Mark abandoned
- [x] Browser staging path
  - [x] Open composer
  - [x] Copy draft to clipboard
  - [x] Insert draft text into X composer when possible
  - [x] Stop before publish
  - [x] Screenshot run capture
  - [ ] Full media attachment automation
  - [ ] Playwright worker outside the embedded browser
- [x] Post package queue
  - [x] Queue list
  - [x] Status filters
  - [x] Load package
  - [x] Approve package
  - [x] Stage package
  - [x] Schedule package
  - [x] Copy package text
  - [x] Remove package
- [x] Formal failure tests
  - [x] Wrong account
  - [x] Expired/unknown/challenge login states
  - [x] Missing media guard helper
  - [x] Selector miss
  - [x] Risky/blocked copy
  - [x] Duplicate draft detection helper
  - [x] Missing approval

### Build 2: Strategy, Calendar, And Routine Handoff

- [x] Brand library
  - [x] Brand voice
  - [x] Approved phrases
  - [x] Banned phrases
  - [x] Brand links/default identity data
  - [x] Per-company/per-brand storage
- [x] Claim library
  - [x] Prize language
  - [x] Free-to-play language
  - [x] Review-required claims
  - [x] Blocked claims
  - [x] Evaluation details shown in live precheck and draft queue
- [x] Campaign strategy
  - [x] Goals
  - [x] Audience
  - [x] Content pillars
  - [x] Primary CTA
  - [x] Offer
  - [x] Reference accounts
- [x] Editorial calendar
  - [x] Calendar jump button in top bar
  - [x] Add slot
  - [x] Slot topic
  - [x] Planned date/time
  - [x] Language
  - [x] Asset need
  - [x] Approval deadline
  - [x] Slot status filters
  - [x] Ready/skipped visual states
  - [x] Slot-to-draft generation
  - [x] Slot-to-schedule handoff
- [x] Schedule calendar
  - [x] Calendar jump button in top bar
  - [x] Target/company/all scopes
  - [x] Status filter
  - [x] Overdue group
  - [x] Ready today group
  - [x] Upcoming group
  - [x] Completed group
  - [x] Schedule detail card
  - [x] Load scheduled draft
  - [x] Stage scheduled draft
  - [x] Mark scheduled draft posted
  - [x] Cancel scheduled draft
- [x] Routine generation path
  - [x] Generate from next slot
  - [x] Run due slots
  - [x] Due-window detection
  - [x] Per-slot routine run records
  - [x] Skipped slot reasons
  - [x] Draft-to-slot linking
  - [ ] Configurable routine due window
  - [x] Routine trigger callable from Polaris
- [x] Routine failure tests
  - [x] Missing tenant/account fields
  - [x] Missing strategy CTA
  - [x] Missing strategy pillars
  - [x] Slot not due yet
  - [x] Wrong slot status
- [x] Content quality loop
  - [x] Draft scoring beyond risk/claims
  - [x] Novelty/repetition check
  - [x] Spanish quality check
  - [x] Visual-fit check
  - [x] Audience-value score

### Build 3: Scale, Assets, Replies, Metrics, And Integrations

- [x] Asset library
  - [x] Media library records
  - [x] Generated asset history
  - [x] Do-not-use assets
  - [x] Safe-zone metadata
  - [x] Alt text
- [ ] Image rendering templates
  - [x] Leaderboard template record
  - [x] Leaderboard card renderer
  - [x] Prize card
  - [x] Country/flag card
  - [ ] Founder/investor card
  - [ ] Campaign card
- [x] Spanish generation path
  - [x] EN/ES campaign variants
  - [x] Spanish slot generation
  - [x] Spanish brand/claim checks
  - [x] Spanish card copy for leaderboard, prize, and country cards
  - [ ] Spanish UI labels where needed for operator review
- [x] Reply capture and classification
  - [x] Capture replies/comments
  - [x] Classify support, bug, investor, influencer, product, hostile, spam, legal, money, regulatory
  - [x] Response draft queue
  - [x] Human approval gate
  - [x] Escalation rules
- [x] Cadence and do-not-engage controls
  - [x] Max posts/day
  - [x] Max replies/hour
  - [x] Quiet hours
  - [x] Cooldowns
  - [x] Duplicate prevention
  - [x] Silence/escalation rules
- [x] Metrics logging
  - [x] Post URL capture
  - [x] Screenshot association
  - [x] Impression/click/signup fields
  - [x] League join attribution
  - [x] Performance notes
- [x] Firebase/admin sync foundation
  - [x] Confirm Firebase admin JSON loading path
  - [x] Keep service account out of renderer
  - [x] Export backend sync bundle for drafts
  - [x] Export backend sync bundle for schedules
  - [x] Export backend sync bundle for runs, metrics, replies, responses, and memory
- [ ] Platform expansion
  - [x] Shared platform config and account defaults
  - [x] Instagram account/routine scaffold
  - [x] TikTok account/routine scaffold
  - [x] LinkedIn account/routine scaffold
  - [x] YouTube Shorts account/routine scaffold
  - [x] Facebook account/routine scaffold
  - [x] Reddit monitoring-only scaffold
  - [x] Platform adapter registry
  - [x] Manual staging mode for non-X writable platforms
  - [x] Platform adapter proof panel
  - [x] Manual/text/media proof counters
  - [x] Automatic proof updates from staging results
  - [ ] Assisted composer adapters beyond X
  - [ ] Platform-specific media upload proof
  - [ ] Repeated staging proof for each writable platform
- [x] Polaris integration bridge
  - [x] Routine trigger from Polaris
  - [x] Firebase shared state mapping
  - [x] Launch/bridge path from Polaris to Diamond
  - [x] Standalone fallback remains intact
- [ ] Legal, licensing, and accessibility
  - [ ] Terms of Service page/content
  - [ ] Privacy policy page/content
  - [x] Licensing and entitlement model
  - [x] License enforcement architecture
  - [x] Diamond licenses are separate from Polaris and every other project
  - [x] Per-user monthly licensing by brand count and social platform access count
  - [x] Per-platform automation license add-ons default off
  - [x] Firebase license portal record shape
  - [x] Mojo AI Studio as license purchase/update source
  - [x] Seven-day offline grace window
  - [x] Dev/admin license role support in Firebase
  - [ ] Accessibility audit
  - [ ] Keyboard navigation pass
  - [ ] Screen reader labels and form semantics
  - [ ] Color contrast and reduced-motion pass
- [ ] Expert review and workflow signoff
  - [ ] Formal expert checklist pass
  - [ ] Scott workflow signoff
  - [ ] Repeated staging proof
  - [ ] Decision on whether `auto_publish` ever becomes available
- [ ] User onboarding and guided help
  - [x] In-app user guide
  - [x] Screen-highlight tour scaffold
  - [x] Tour voiceover script
  - [x] ElevenLabs request template
  - [x] ElevenLabs audio generation worker
  - [x] Voiceover playback synced to tour steps
  - [ ] User guide review after first full operator session

## Current Phase
Build Diamond as a standalone multitenant social media operating system. Diamond will generate campaign content, render post assets, operate platform web UIs through visible browser surfaces, and manage replies through an approval-aware response queue for multiple companies.

The posting path should avoid direct social platform APIs. Diamond should act through normal browser sessions using authenticated web pages, with screenshots, logs, and human approval gates where risk is higher. Polaris is an integration target after Diamond works on its own, not a required runtime component.

## Architecture

| Layer | Responsibility |
|---|---|
| Diamond routines | Scheduling and orchestration. One routine per platform/cadence. |
| Platform skills | Platform-specific voice, format, reply etiquette, and guardrails. |
| Electron app shell | Standalone UI, company switcher, visible browser surfaces, local persistence, and approval workflow. |
| Browser worker | Browser posting, media upload, screenshots, and reply capture. |
| Firebase admin | Optional backend sync for job state, draft queue, reply queue, metrics, and audit logs. |
| Approval queue | Review, edit, approve, reject, and publish. |
| Metrics loop | Track post URLs, screenshots, impressions, clicks, signups, and follow-up notes. |

## Multitenancy

Company/tenant isolation is a P0 requirement. Diamond should support multiple companies, each with its own brands, accounts, campaigns, browser sessions, approval rules, assets, logs, and metrics.

Suggested hierarchy:

```text
companies/{companyId}
  brands/{brandId}
    socialAccounts/{accountId}
    campaigns/{campaignId}
    scheduledPosts/{scheduledPostId}
    postDrafts/{draftId}
    postRuns/{runId}
    replies/{replyId}
    responseDrafts/{responseDraftId}
    metrics/{metricId}
    templates/{templateId}
```

Every routine run must include `companyId`, `brandId`, `platform`, `socialAccountId`, `campaignId`, `approvalPolicyId`, and `browserProfileId`.

The UI must always show the active company, brand, platform, and account before a post can be staged or published.

Do not reuse browser profiles across companies. Do not allow a queued post from one company to stage in another company's browser tab.

## Embedded Social Browser

Diamond includes a visible Social Command Browser inside its own app:

```text
Left: company/brand/campaign queue
Middle: embedded browser tabs for the selected company's social accounts
Right: generated post package, approval controls, logs, and screenshots
```

Each social account tab should open to the correct account/page/composer for the selected company. The AI can stage posts through the visible tab, but the user can take over at any time.

## Confidence Proof Phase

Before expanding beyond one platform, Diamond should prove the risky parts with a narrow validation sequence. This phase should happen after the multitenant data model is sketched and before Instagram/TikTok/LinkedIn work begins.

| Proof Step | Goal | Confidence Impact |
|---|---|---|
| Inspect Polaris routines | Confirm how routines are defined, scheduled, and allowed to call local tools. | Raises confidence that Diamond can run inside Polaris cleanly. |
| Confirm Firebase admin JSON path | Verify how Polaris loads the service account JSON and how Diamond should reuse it. | Removes backend credential uncertainty. |
| Choose browser strategy | Decide Electron embedded browser, Playwright persistent Chromium, or hybrid. | Resolves the biggest architecture risk. |
| Create one real X browser profile | Log in once, preserve session, and confirm no password storage is needed. | Validates account/session handling. |
| Stage one X post | Fill composer, attach one rendered image, screenshot, and stop before publish. | Proves the assisted-posting workflow. |
| Repeat staging 3 times | Run the same staged flow across separate sessions. | Proves the workflow is not a one-off. |
| Verify tenant isolation | Confirm the staged post cannot use the wrong company/account/browser profile. | Proves multitenancy guardrails. |
| Document failure modes | Capture login challenge, selector miss, media upload failure, account mismatch, and manual takeover behavior. | Makes the system operable instead of mysterious. |

Confidence target: move from 7/10 to 8.5/10 before building additional platform routines, and toward 9/10 after repeated staging works with a real account.

## Plan Validation

Diamond should not treat this plan as perfect until it is verified against the standalone app prototype, optional Polaris integration path, failure tests, an expert checklist, and Scott's workflow review.

| Validation Track | What To Verify | Acceptance Signal | Stage |
|---|---|---|---|
| Codebase reality check | Inspect Diamond standalone app paths, optional Polaris launch hooks, Firebase admin JSON loading, local tool hooks, and Electron/browser patterns. | The plan names real integration points and avoids imaginary architecture. | P0 before implementation depth. |
| Prototype proof | Build one company, one brand, one X account, one browser profile, one generated post, one rendered image, one staged composer, one screenshot log. | The first assisted-posting loop works end to end without publishing. | P0 first milestone. |
| Repeated proof | Run the staged X flow three times across separate sessions. | The workflow is repeatable, not a lucky demo. | P0 confidence proof. |
| Failure testing | Test wrong account, expired login, missing media, selector miss, risky language, duplicate content, missing approval, missing Spanish variant, and Firebase write failure. | Diamond pauses, logs, or routes for review instead of publishing incorrectly. | P0/P1 before platform expansion. |
| Expert checklist | Compare the system against strategy, calendar, brand voice, claim review, asset pipeline, approvals, inbox triage, escalation, cadence limits, account safety, metrics, memory, multitenancy, audit logs, and manual takeover. | Any missing operating layer becomes a build item before scale. | P0/P1 after first prototype. |
| Workflow signoff | Scott reviews the first staged workflow in the visible browser and approval queue. | Scott confirms the flow matches how he wants Diamond to operate. | Required before `auto_publish`. |

The build plan becomes the working spine only after:

1. Standalone Diamond inspection confirms the app architecture and optional Polaris integration path.
2. X staging proof works three times.
3. Tenant isolation blocks wrong-account staging.
4. Risky content is held for approval.
5. Post package, screenshot, and run state are logged.
6. Scott approves the first staged workflow.

Until those checks pass, the plan is a strong hypothesis, not a final operating model.

## Posting Modes

| Mode | Behavior |
|---|---|
| `draft_only` | Generate copy and assets only. |
| `stage_for_review` | Fill the platform composer, attach media, screenshot, and stop before publish. |
| `auto_publish` | Publish only trusted, pre-approved categories after staged posting proves reliable. |

## Platform Skills

| Priority | Skill | Purpose |
|---|---|---|
| P0 | `social-x` | Fast sports reactions, leaderboard updates, founder posts, replies. |
| P1 | `social-instagram` | Visual campaign cards, stories/reels captions, prize graphics. |
| P1 | `social-tiktok` | Short scripts, creator hooks, matchday challenge prompts. |
| P2 | `social-linkedin` | Founder/investor/product narrative. |
| P2 | `social-youtube-shorts` | Reuse TikTok scripts with YouTube framing. |
| P3 | `social-facebook` | Community and group-friendly posts. |
| P3 | `social-reddit-monitoring` | Monitor and suggest replies only. |

## Social Operating Layer

Diamond is not only a posting robot. It should act as a multitenant social operating system with strategy, governance, memory, approval, lead capture, and learning.

| Layer | Purpose | Build Stage |
|---|---|---|
| Content strategy | Define campaign goals, audience personas, content pillars, offers, CTAs, platform angles, competitor/reference accounts, and "why would anyone care?" checks. | P0 |
| Editorial calendar | Plan post slots, themes, platform assignments, language variants, asset needs, and approval deadlines before routines generate drafts. | P0 |
| Scheduled posts | Let operators schedule approved drafts, view upcoming posts on a calendar, and hand scheduled posts to routines at the right time. Schedule and calendar state must be maintained per company, brand, campaign, platform, and account. | P0 |
| Brand library | Store company/brand voice, examples, banned phrases, founder voice rules, company voice rules, colors, fonts, logos, and links. | P0 |
| Claim library | Store approved prize language, free-to-play language, regulatory disclaimers, banned claims, and requires-review claims. | P0 |
| Human identity rules | Define when Diamond speaks as a company, founder, team member, or draft-only assistant. No fake personal anecdotes or fake customer claims. | P0 |
| Asset management | Manage templates, sizes, safe zones, alt text, generated asset history, media library, do-not-use assets, and per-company asset permissions. | P1 |
| Inbox triage | Classify replies/comments as support, bug, investor, influencer, product, hostile, spam, legal, money, or regulatory before drafting responses. | P1 |
| Cadence controls | Enforce max posts/day, max replies/hour, quiet hours, cooldowns after warnings, duplicate prevention, and repeated CTA limits. | P1 |
| Do-not-engage rules | Define silence/escalation rules for trolls, legal bait, gambling accusations, harassment, minors, financial questions, and crisis topics. | P1 |
| Post memory | Track what each company has already posted to prevent stale, repetitive, contradictory, or overused content. | P1 |
| Draft evaluation | Score drafts for brand fit, clarity, platform fit, CTA strength, risk, novelty, Spanish quality, visual fit, and audience value before staging. | P1 |
| Lead/support routing | Convert replies into support tickets, bug reports, investor leads, influencer leads, or ignored items. | P1 |

Routines should generate from the editorial calendar and strategy layer, not invent from nothing every morning.

## Firebase Collections

| Collection | Purpose |
|---|---|
| `companies` | Tenant root records, company settings, default approval policies. |
| `companyBrands` or nested `brands` | Brand voice, colors, links, languages, logo/media references. |
| `socialAccounts` | Platform account/page metadata per company/brand. |
| `socialCampaigns` | Campaign briefs, languages, CTAs, date windows. |
| `scheduledPosts` | Approved drafts assigned to publish windows, calendar status, company/brand/campaign/platform/account target, timezone, and routine handoff state. |
| `socialPostDrafts` | Generated copy, assets, approval state, platform target. |
| `socialPostRuns` | Routine executions, status, logs, screenshots, errors. |
| `socialBrowserProfiles` | Metadata only for browser profile names and session state. No passwords. |
| `socialReplies` | Captured replies/comments and classifications. |
| `socialResponseDrafts` | Suggested responses and approval state. |
| `socialMetrics` | Post performance, clicks, signups, league joins, notes. |
| `socialTemplates` | Reusable prompts, image templates, CTA variants. |
| `contentStrategies` | Company/brand goals, personas, pillars, offers, CTAs, competitor references. |
| `editorialCalendar` | Planned slots, platform assignments, language variants, asset needs, approval deadlines. |
| `brandLibraries` | Voice rules, examples, banned phrases, colors, fonts, logos, identity rules. |
| `claimLibraries` | Approved/banned/requires-review claims and compliance copy. |
| `assetLibrary` | Media, templates, generated asset history, safe-zone metadata, do-not-use assets. |
| `postMemory` | Prior posts/replies and semantic history used to prevent repetition and contradiction. |
| `inboxTriage` | Classified inbound items with priority, owner, and suggested action. |
| `cadencePolicies` | Posting/reply limits, quiet hours, cooldown rules, duplicate prevention. |
| `draftEvaluations` | Preflight scores and reasons for approve/rewrite/hold decisions. |

All records must be company-scoped. The first implementation should prefer nested `companies/{companyId}/...` paths unless Polaris already has a strong top-level collection convention.

## Guardrails

- Do not bypass CAPTCHA, 2FA, platform rate limits, or account security checks.
- Do not store raw passwords in Polaris or Firebase.
- Use authenticated browser profiles where possible.
- Require approval for prizes, money, gambling, regulatory, equity, investment, hostile, or support-sensitive replies.
- Screenshot every staged and published post.
- Store every generated post package before publishing.
- Refuse to stage or publish without matching company, brand, platform, account, and browser profile.
- Store browser profiles separately per company/platform/account.

## Failure Mode Controls

These controls are part of the build, not cleanup work. Each risk gets handled at the earliest stage where it can materially reduce blast radius.

| Risk | What Could Go Wrong | Control | When Accounted For |
|---|---|---|---|
| Platform UI changes | A platform changes buttons/selectors and the worker posts incorrectly or gets stuck. | Platform adapters must use visible staging, screenshot logs, manual takeover, and fail-closed behavior. | P0 confidence proof and every platform adapter. |
| Login/session challenges | 2FA, CAPTCHA, expired sessions, or suspicious login checks interrupt routines. | Session health checks pause the routine and ask for human action. No bypass logic. | P0 browser profile proof. |
| Wrong tenant/account | A post for one company stages in another company's account. | Require company/brand/account/profile match before staging; visibly show target context; refuse mismatches. | P0 multitenancy model, active tenant context, staging worker. |
| Risky AI language | AI makes claims about prizes, money, gambling, equity, investing, legal status, or support promises. | Content classifier and approval policy force risky categories into approval-required mode. | P0 approval queue, P1 reply classification. |
| Too much complexity too early | The build spreads across platforms before the core loop works. | Ship one company, one brand, one X account, one image, one staged post before platform expansion. | P0 first milestone. |
| Embedded browser strategy fails | Electron browser tabs and Playwright control do not fit cleanly together. | Decide strategy during proof phase; allow hybrid embedded browser plus Playwright persistent profile. | P0 confidence proof. |
| Platform/account risk | Automated behavior looks spammy or violates platform expectations. | Human-paced staging, no CAPTCHA/2FA bypass, no mass replies, no scraping, conservative cadence. | P0 guardrails and platform skills. |
| Useless metrics | Posts go out but Diamond cannot learn what worked. | Log post package, URL, screenshot, campaign, tenant, and later metrics from day one. | P0 post run logging, P1 metrics logging. |
| Schedule drift | Scheduled posts fire at the wrong time, wrong account, or after a campaign window closes. | Scheduled posts must store timezone, target tenant/account, status, campaign window, and routine handoff logs; calendar view must make conflicts visible. | P0 scheduling/calendar model. |
| Firebase/admin exposure | Service account JSON or tenant data leaks into renderer/browser code. | Keep Firebase admin access server/local-tool side only; never expose service account to browser surfaces. | P0 Firebase admin path confirmation. |
| Bland AI content | The system generates generic content at scale. | Platform skills require examples, voice rules, banned phrases, review feedback, and performance notes. | P0 `social-x` skill, P1 metrics loop. |

Fail-closed rule: when Diamond is unsure about account, tenant, content risk, session state, upload state, or publish state, it pauses and asks for review instead of publishing.

## Build Sequence

| Priority | Item | Status | Notes |
|---|---|---|---|
| P0 | Confirm Diamond Firebase admin JSON loading path | Built | Electron main process checks `DIAMOND_FIREBASE_ADMIN_JSON` or `GOOGLE_APPLICATION_CREDENTIALS`, renderer receives only redacted status, and Diamond can export Firestore-shaped sync bundles. |
| P0 | Add multitenant company/brand/account model | Built | Company is the root of social accounts, brands, campaigns, assets, schedules, runs, memory, and routines. |
| P0 | Build company switcher and active tenant context | Built | Company, brand, campaign, and social account selectors drive the visible active target and all scoped records. |
| P0 | Design company-scoped browser profile storage | Built | Browser profile IDs are company/platform/account scoped and persisted through Electron partitions. |
| P0 | Add fail-closed risk controls | Built | Tenant mismatch, session uncertainty, selector miss, upload uncertainty, risky content, and quality holds stop staging. |
| P0 | Add content strategy model | Built | Goals, personas, pillars, offers, CTAs, reference accounts, audience-value checks. |
| P0 | Add editorial calendar model | Built | Routines generate from planned slots instead of blank-page prompting. |
| P0 | Add Schedule Post button and scheduled-post records | Built | Operators can schedule an approved draft for a specific date/time/account without publishing immediately; records are tenant scoped. |
| P0 | Add scheduled-post calendar view | Built | Calendar shows upcoming scheduled posts by company, brand, campaign, platform, account, status, timezone, readiness, and queue actions. |
| P0 | Add brand and claim libraries | Built | Voice rules, approved language, banned claims, identity rules, and evaluation rule hits. |
| P0 | Validate plan against Diamond reality | Built | Standalone Electron app, local state, embedded browser strategy, and routine hooks have been validated in code. |
| P0 | Run confidence proof phase | Partial | App shell, browser sizing, staging, screenshots, and tests are proven; repeated X staging across three separate app sessions remains open. |
| P0 | Build `social-x` skill | Built | X-specific compose URL, session flow, composer insertion, media helper, and run capture are in place. |
| P0 | Build `x-daily-post` routine | Built | Generate one post package from the next planned editorial slot. |
| P0 | Add routine scheduler handoff | Built | Run due planned slots, record generated/skipped runs, and show ready/skipped calendar states. |
| P0 | Build Playwright staging worker | Deferred | Embedded webview staging fills composer, captures screenshots, and stops before publish; external Playwright worker remains optional. |
| P0 | Build draft/approval queue | Built | Package queue supports evaluate, approve, stage, schedule, copy, load, remove, posted, and abandoned states. |
| P1 | Add reply capture and classification | Built | Operators can capture replies, classify them, generate response drafts, approve safe responses, ignore spam, or escalate sensitive replies. |
| P1 | Add Spanish generation path | Built | Campaign slots and World Cup cards can produce EN/ES variants with Spanish CTA, offer, and claim terms. |
| P1 | Add image rendering templates | Built | World Cup leaderboard, prize, and country SVG renderers, generated asset records, and template validation. Founder and campaign cards remain queued. |
| P1 | Add metrics logging | Built | Runs capture URLs, screenshots, impressions, clicks, signups, league joins, league attribution, performance notes, and derived rates. |
| P1 | Add content quality feedback loop | Built | Scores drafts for CTA, novelty, risk, language, visual fit, and audience value before approval or staging. |
| P1 | Add asset library and safe-zone metadata | Built | Media library records, template record, alt text, safe zones, filters, attach flow, and do-not-use assets. |
| P1 | Add inbox triage before reply drafting | Built | Captured replies now include priority, owner, next action, due time, triage notes, assignment, progress, escalation, ignore, and resolve states. |
| P1 | Add cadence and do-not-engage policies | Built | Campaign guardrails now enforce daily caps, reply caps, quiet hours, cooldowns, duplicate lookback, do-not-engage terms, and escalation terms. |
| P1 | Add post memory and draft evaluation | Built | Drafts and captured post runs now create post memory records, and repetitive drafts are held. |
| P1 | Add lead/support routing | Built | Replies now route into support tickets, bug reports, investor leads, influencer leads, product feedback, ignored items, or escalation records with owner and route status. |
| P1 | Add Terms of Service and privacy policy | Queued | Draft and surface public-facing legal terms before broader distribution, social campaigns, licensing, or paid usage. |
| P1 | Add accessibility baseline | Queued | Audit keyboard navigation, focus states, labels, color contrast, reduced motion, and screen reader semantics across the Diamond app. |
| P1 | Add user guide and narrated tour | Partial | In-app guide, highlight tour, ElevenLabs audio generation, and step-level voiceover playback are built. First operator-session review remains queued. |
| P1 | Design licensing and entitlement model | Built | Diamond has its own Firebase-backed per-user monthly license model, priced by brand count and social platform access count, with separate per-platform automation add-ons defaulting off, fed by Mojo AI Studio, with seven-day offline grace and dev/admin roles. |
| P1 | Add license enforcement architecture | Built | Diamond now caches a Firebase-shaped license locally, validates active brand/platform access, blocks staging on license failure, blocks automation routines without per-platform automation entitlement, and honors the seven-day offline grace period. |
| P1 | Run formal failure tests | Built | Wrong account, expired login, missing media helper, selector miss, risky copy, duplicate draft helper, missing approval, and routine readiness failures. |
| P1 | Run expert checklist review | Queued | Strategy, calendar, brand safety, assets, approvals, triage, cadence, metrics, memory, audit logs. Do this after legal/accessibility baseline and image template gaps are closed. |
| P2 | Add Instagram, TikTok, and LinkedIn routines | Partial | Platform account defaults, browser profiles, planned slots, templates, routine scaffolds, manual staging adapter states, and proof counters are wired. Assisted composer and media proofs remain queued. |
| P2 | Add YouTube Shorts and Facebook routines | Partial | Platform account defaults, browser profiles, planned slots, templates, routine scaffolds, manual staging adapter states, and proof counters are wired. Assisted composer and media proofs remain queued. |
| P3 | Add Reddit monitoring only | Partial | Reddit account context and planned monitoring slot are wired, and staging refuses because Reddit is monitoring-only. Reply/monitoring capture remains queued. |

## First Milestone

Deliver X/Twitter draft and staging flow:

1. Routine generates one daily post package.
2. Playwright renders one campaign image.
3. Browser worker opens X with authenticated profile.
4. Worker fills composer and attaches image.
5. Worker stops before publishing.
6. Polaris records screenshot, draft text, media path, and approval state in Firebase.

The milestone is complete only if the staged post is tied to one selected company, one selected brand, and one selected social account.
