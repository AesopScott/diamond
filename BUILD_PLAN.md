# Diamond Build Plan

## Current Phase
Build a Polaris-powered social media operations system for Project Diamond. Polaris routines will generate daily campaign content, render post assets, operate platform web UIs through Playwright, and manage replies through an approval-aware response queue.

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
| `socialCampaigns` | Campaign briefs, languages, CTAs, date windows. |
| `socialPostDrafts` | Generated copy, assets, approval state, platform target. |
| `socialPostRuns` | Routine executions, status, logs, screenshots, errors. |
| `socialBrowserProfiles` | Metadata only for browser profile names and session state. No passwords. |
| `socialReplies` | Captured replies/comments and classifications. |
| `socialResponseDrafts` | Suggested responses and approval state. |
| `socialMetrics` | Post performance, clicks, signups, league joins, notes. |
| `socialTemplates` | Reusable prompts, image templates, CTA variants. |

## Guardrails

- Do not bypass CAPTCHA, 2FA, platform rate limits, or account security checks.
- Do not store raw passwords in Polaris or Firebase.
- Use authenticated browser profiles where possible.
- Require approval for prizes, money, gambling, regulatory, equity, investment, hostile, or support-sensitive replies.
- Screenshot every staged and published post.
- Store every generated post package before publishing.

## Build Sequence

| Priority | Item | Status | Notes |
|---|---|---|---|
| P0 | Confirm Polaris Firebase admin JSON loading path | Queued | Reuse existing admin/service-account configuration. |
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
