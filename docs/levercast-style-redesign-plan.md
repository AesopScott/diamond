# Diamond Levercast-Style Redesign Plan

## Intent

Build a cleaner Diamond interface without mutating the current working surface first. The current UI is archived in `docs/archive/diamond-current-ui-2026-05-14/` so we can compare, restore, or selectively pull ideas back.

The redesign should feel like a focused social publishing workspace: a quiet left navigation, clear pages, post boards, post detail views, and advanced operator tools hidden until needed.

## Guardrails

- Do not remove the existing renderer workflow until the new shell can replace it safely.
- Keep the current data model working while adding the new post-package model.
- Preserve browser staging, validation, licensing, settings, account setup, and proof tools.
- Prefer additive files and view-model helpers before changing the current production renderer.
- Keep a visible comparison path back to the archived UI.

## Target Navigation

- Posts
- Analytics
- Templates
- Calendar
- Accounts
- Brands
- Settings

## Posts Page

The Posts page is the default workspace.

Core board columns:

- Draft
- Scheduled
- Published
- Needs Review
- Failed

Board controls:

- Status filter
- Tag filter
- Created date filter
- Newest/oldest sort
- Board/list/calendar view toggle
- Create button

Cards should show:

- Post excerpt/title
- Created or scheduled date
- Platform badges
- Campaign
- Tags
- Status

## Post Detail

A post detail page represents one source idea that can become multiple platform-specific drafts.

Detail sections:

- Back button
- Status badge
- Source post idea input
- Cadence counter, such as `4 / 20 this week`
- Generation style selector
- Media controls
- Platform selector buttons
- Add platform button
- Tags
- Platform draft sections

## Platform Drafts

Each post package can have child drafts per platform.

Examples:

- LinkedIn version with long-form preview
- X version with character counter
- Instagram version
- TikTok version
- Facebook version

Platform draft sections should include:

- Platform name and icon
- Generated text
- Character or format limits
- Media attachment state
- Preview card
- Evaluate
- Approve
- Schedule
- Stage in browser
- Mark posted or abandoned

## Data Model Direction

Add a parent/child structure rather than forcing every draft to be a separate isolated object.

```text
postPackages
  id
  companyId
  brandId
  campaignId
  ideaText
  tags
  status
  createdAt
  updatedAt

platformDrafts
  id
  postPackageId
  platform
  socialAccountId
  text
  media
  status
  charLimit
  scheduledAt
  publishedAt
  runId
```

## Build Sequence

1. Add post package and platform draft helpers. Built in `src/post-package.js`.
2. Build a read-only posts board from existing drafts, scheduled posts, and post runs. Built as `src/renderer/posts-prototype.html`.
3. Add a new shell prototype behind a feature flag or separate route.
4. Add post package creation flow. Prototype built in `src/renderer/posts-prototype.html`.
5. Add platform-specific draft generation and preview sections. Prototype built in `src/renderer/posts-prototype.html`.
6. Move schedule/calendar into a dedicated Calendar page. Prototype built in `src/renderer/posts-prototype.html`.
7. Move account setup, sessions, and proof into Accounts. Prototype built in `src/renderer/posts-prototype.html`.
8. Move brand/company/campaign strategy into Brands. Prototype built in `src/renderer/posts-prototype.html`.
9. Move templates/assets into Templates. Prototype built in `src/renderer/posts-prototype.html`.
10. Move license, Firebase, legal, theme, and accessibility into Settings. Prototype built in `src/renderer/posts-prototype.html`.
11. Add Analytics page. Prototype built in `src/renderer/posts-prototype.html`.
12. Move advanced operator panels into an explicit drawer or page. Prototype drawer built in `src/renderer/posts-prototype.html`.
13. Screenshot compare new shell against the archived current UI.
14. Only then decide whether to replace the current renderer shell.

## Open Product Questions

- Should `Needs Review` and `Failed` always show, or only when populated?
- Should one source idea create all platform drafts automatically, or only selected platforms?
- Should platform draft media be shared by default or separate per platform?
- Should tags live on the parent package, child platform draft, or both?
- Should the visible browser live in an advanced drawer, post detail panel, or dedicated staging page?
