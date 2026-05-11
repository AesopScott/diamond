# Diamond Build Plan

## Current Phase
Build a multitenant Polaris-powered social media operations system for Project Diamond. Polaris routines will generate daily campaign content, render post assets, operate platform web UIs through Playwright, and manage replies through an approval-aware response queue for multiple companies.

The posting path should avoid direct social platform APIs. The AI should act through a normal browser session using authenticated web pages, with screenshots, logs, and human approval gates where risk is higher.

## Architecture

| Layer | Responsibility |
|---|---|
| Polaris routines | Scheduling and orchestration. One routine per platform/cadence. |
| Platform skills | Platform-specific voice, format, reply etiquette, and guardrails. |
| Playwright worker | Browser posting, media upload, screenshots, and reply capture. |
| Firebase admin | Job state, draft queue, reply queue, metrics, audit logs, using the existing service account JSON. |
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

Diamond should include a visible Social Command Browser inside the app:

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

## Firebase Collections

| Collection | Purpose |
|---|---|
| `companies` | Tenant root records, company settings, default approval policies. |
| `companyBrands` or nested `brands` | Brand voice, colors, links, languages, logo/media references. |
| `socialAccounts` | Platform account/page metadata per company/brand. |
| `socialCampaigns` | Campaign briefs, languages, CTAs, date windows. |
| `socialPostDrafts` | Generated copy, assets, approval state, platform target. |
| `socialPostRuns` | Routine executions, status, logs, screenshots, errors. |
| `socialBrowserProfiles` | Metadata only for browser profile names and session state. No passwords. |
| `socialReplies` | Captured replies/comments and classifications. |
| `socialResponseDrafts` | Suggested responses and approval state. |
| `socialMetrics` | Post performance, clicks, signups, league joins, notes. |
| `socialTemplates` | Reusable prompts, image templates, CTA variants. |

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

## Build Sequence

| Priority | Item | Status | Notes |
|---|---|---|---|
| P0 | Confirm Polaris Firebase admin JSON loading path | Queued | Reuse existing admin/service-account configuration. |
| P0 | Add multitenant company/brand/account model | Queued | Company is the root of all social objects. |
| P0 | Build company switcher and active tenant context | Queued | Must be visible before posting workflows. |
| P0 | Design company-scoped browser profile storage | Queued | One browser profile per company/platform/account. |
| P0 | Run confidence proof phase | Queued | Polaris routines, Firebase admin JSON, browser strategy, repeated X staging. |
| P0 | Build `social-x` skill | Queued | First platform because it rewards speed and reply loops. |
| P0 | Build `x-daily-post` routine | Queued | Generate one daily post package. |
| P0 | Build Playwright staging worker | Queued | Fill composer, attach media, screenshot, stop before publish. |
| P0 | Build draft/approval queue | Queued | Required before any auto-publish mode. |
| P1 | Add reply capture and classification | Queued | Product, support, prize, regulatory, investor, influencer, spam. |
| P1 | Add Spanish generation path | Queued | Every campaign post can produce EN/ES variants. |
| P1 | Add image rendering templates | Queued | Leaderboard, prize, country, founder, campaign cards. |
| P1 | Add metrics logging | Queued | Track post URLs, screenshots, impressions/clicks/signups when available. |
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
