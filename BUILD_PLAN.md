# Diamond Build Plan

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
| P0 | Confirm Diamond Firebase admin JSON loading path | Queued | Optional backend sync uses a local service-account configuration. |
| P0 | Add multitenant company/brand/account model | Queued | Company is the root of all social objects. |
| P0 | Build company switcher and active tenant context | Queued | Must be visible before posting workflows. |
| P0 | Design company-scoped browser profile storage | Queued | One browser profile per company/platform/account. |
| P0 | Add fail-closed risk controls | Queued | Tenant mismatch, session challenge, selector miss, upload uncertainty, risky content. |
| P0 | Add content strategy model | Queued | Goals, personas, pillars, offers, CTAs, reference accounts, audience-value checks. |
| P0 | Add editorial calendar model | Queued | Routines generate from planned slots instead of blank-page prompting. |
| P0 | Add Schedule Post button and scheduled-post records | Queued | Operators can schedule an approved draft for a specific date/time/account without publishing immediately; records are tenant scoped. |
| P0 | Add scheduled-post calendar view | Queued | Calendar shows upcoming scheduled posts by company, brand, campaign, platform, account, status, and timezone. |
| P0 | Add brand and claim libraries | Queued | Voice rules, approved language, banned claims, identity rules. |
| P0 | Validate plan against Diamond reality | Queued | Inspect standalone app shell, Firebase admin JSON option, local hooks, Electron/browser patterns. |
| P0 | Run confidence proof phase | Queued | Standalone app shell, Firebase admin option, browser strategy, repeated X staging. |
| P0 | Build `social-x` skill | Queued | First platform because it rewards speed and reply loops. |
| P0 | Build `x-daily-post` routine | Queued | Generate one daily post package. |
| P0 | Build Playwright staging worker | Queued | Fill composer, attach media, screenshot, stop before publish. |
| P0 | Build draft/approval queue | Queued | Required before any auto-publish mode. |
| P1 | Add reply capture and classification | Queued | Product, support, prize, regulatory, investor, influencer, spam. |
| P1 | Add Spanish generation path | Queued | Every campaign post can produce EN/ES variants. |
| P1 | Add image rendering templates | Queued | Leaderboard, prize, country, founder, campaign cards. |
| P1 | Add metrics logging | Queued | Track post URLs, screenshots, impressions/clicks/signups when available. |
| P1 | Add content quality feedback loop | Queued | Voice examples, banned phrases, post review notes, performance notes. |
| P1 | Add asset library and safe-zone metadata | Queued | Media library, templates, alt text, generated history, do-not-use assets. |
| P1 | Add inbox triage before reply drafting | Queued | Priority, owner, action, and escalation before writing responses. |
| P1 | Add cadence and do-not-engage policies | Queued | Rate limits, quiet hours, cooldowns, silence rules. |
| P1 | Add post memory and draft evaluation | Queued | Prevent repetition/contradiction and score drafts before staging. |
| P1 | Add lead/support routing | Queued | Replies become support tickets, bugs, investor leads, influencer leads, or ignored items. |
| P1 | Run formal failure tests | Queued | Wrong account, expired login, missing media, selector miss, risky copy, duplicate post, missing approval. |
| P1 | Run expert checklist review | Queued | Strategy, calendar, brand safety, assets, approvals, triage, cadence, metrics, memory, audit logs. |
| P2 | Add Instagram, TikTok, and LinkedIn routines | Queued | Reuse the same post package pattern. |
| P3 | Add Reddit monitoring only | Queued | No autoposting initially. |

## First Milestone

Deliver X/Twitter draft and staging flow:

1. Routine generates one daily post package.
2. Playwright renders one campaign image.
3. Browser worker opens X with authenticated profile.
4. Worker fills composer and attaches image.
5. Worker stops before publishing.
6. Polaris records screenshot, draft text, media path, and approval state in Firebase.

The milestone is complete only if the staged post is tied to one selected company, one selected brand, and one selected social account.
