# Image Generation Guide

Diamond uses [Replicate](https://replicate.com) with the **Flux Pro** model to generate images for social media posts. This guide explains how to configure image generation at the campaign and post level.

---

## How it works

1. **Campaign level** — Enable image generation for a campaign and set default platform toggles and a prompt guidance template.
2. **Post level** — Each platform draft inherits the campaign setting. Click the **🖼 Image** button in a draft to override for that specific post.
3. **At post time** — When a post is generated, if image generation is enabled, Diamond calls Replicate with the campaign's guidance + the post text as a combined prompt. The resulting image URL is stored on the draft and surfaced for review.

---

## Campaign image generation settings

In the **Campaigns** view, the image generation section appears in the campaign overview card.

| Field | Purpose |
|---|---|
| **Enable image generation** | Master toggle for the entire campaign |
| **Platform checkboxes** | Choose which platforms should auto-generate images |
| **Image prompt guidance** | Standing instructions for Flux Pro; combined with each post's text at generation time |

### Writing effective image prompt guidance

The prompt sent to Flux Pro is:
```
{imagePromptGuidance}

Post: {post text}
```

Tips:
- **Describe the visual style** — "Clean white background, product-forward composition, natural lighting"
- **Specify mood** — "Professional, aspirational, modern"
- **Lock recurring brand elements** — "Always include the brand's signature red and gold palette"
- **Exclude unwanted content** — "No text overlays, no faces, no alcohol"
- **State the format intent** — "Suitable for Instagram feed" (helps Flux Pro frame the shot)

Example guidance for a SaaS tool campaign:
```
Minimal UI-focused aesthetic. Dark background with subtle blue gradients. Show product screens or abstract tech imagery. No stock-photo faces. Professional, modern, aspirational. Suitable for LinkedIn and X.
```

---

## Per-platform dimensions

Diamond automatically sets the correct image dimensions for each platform:

| Platform | Dimensions | Aspect ratio | Format |
|---|---|---|---|
| X (Twitter) | 1200 × 675 | 16:9 | WebP |
| Instagram | 1080 × 1350 | 4:5 | WebP |
| TikTok | 1080 × 1920 | 9:16 | WebP |
| LinkedIn | 1200 × 628 | 1.91:1 | WebP |
| YouTube | 1280 × 720 | 16:9 | WebP |
| Facebook | 1200 × 628 | 1.91:1 | WebP |
| Reddit | 1200 × 628 | 1.91:1 | WebP |

---

## Per-post override (🖼 Image button)

In the post detail panel, each platform draft shows an **🖼 Image** button when its campaign has image generation enabled.

| Button state | Meaning |
|---|---|
| Normal | Inherits campaign setting |
| **Active (highlighted)** | Explicitly enabled for this post |
| Strikethrough / muted | Explicitly disabled for this post |

Clicking cycles: `inherit → on → off → inherit`.

If a generated image is attached, the button shows `🖼 Image ✓`.  
If generation failed, it shows `🖼 Image ✗`.

---

## Pricing

Flux Pro on Replicate costs approximately **$0.03–0.05 per image** depending on resolution and generation time. Diamond logs each image's cost by campaign and platform.

Estimated monthly costs:
- 20 images/day → ~$30–45/month
- 50 images/day → ~$75–110/month
- 100 images/day → ~$150–225/month

---

## Error handling

| Error | Interactive behavior | Automated behavior |
|---|---|---|
| API key missing | Error shown in draft panel | Post blocked, logged |
| Rate limited | Retry button shown with wait time | Post paused, retried with backoff |
| Generation timeout | Prompt to retry with simpler text | Post skipped, logged |
| Invalid prompt | Edit prompt, blocked phrases shown | Post skipped, logged |
| Insufficient credits | Admin notification required | All posts blocked, logged |

When automated image generation fails, the post is **not published**. The failure is logged and will surface in the operator panel for review.

---

## Configuration

Set the `REPLICATE_API_KEY` environment variable in `.env.local`:

```
REPLICATE_API_KEY=r8_xxxxxxxxxxxxxxxxxxxx
```

The key is used server-side only and never sent to the browser.

---

## Validation checklist (before enabling automation)

Before turning on automated image generation for any campaign, verify:

- [ ] `REPLICATE_API_KEY` is set and valid
- [ ] At least one test image generated manually through the post dialog
- [ ] The generated image reviewed and approved
- [ ] Campaign prompt guidance written and tested
- [ ] Per-platform toggles set correctly
- [ ] Cost estimate reviewed against campaign budget
- [ ] Error notification path tested (confirm failures are logged)
