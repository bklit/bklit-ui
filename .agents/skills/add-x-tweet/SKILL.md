---
name: add-x-tweet
description: Add X (Twitter) testimonials to the bklit homepage. Fetches username, avatar, and tweet text from a status URL and appends an entry to apps/web/lib/testimonials.ts. Use when the user shares an x.com/twitter.com tweet URL to add or replace a testimonial.
metadata:
  internal: "true"
---

# Add X Tweet Testimonial

Add social proof tweets to the homepage testimonial grid.

## When to use

- User provides one or more `https://x.com/.../status/...` URLs
- User asks to replace, prioritize, or reorder testimonials
- User says "add tweet", "new testimonial", or similar

## Workflow

### 1. Fetch tweet metadata

Run the fetch script from the repo root (requires network):

```bash
node .agents/skills/add-x-tweet/scripts/fetch-tweet.mjs "https://x.com/user/status/123..."
```

For multiple URLs, pass each URL or run once per URL.

The script prints JSON:

```json
{
  "id": "123...",
  "url": "https://x.com/user/status/123...",
  "author": { "name": "...", "handle": "@user", "avatar": "https://pbs.twimg.com/...", "verified": true },
  "content": "tweet text without @uixmat prefix"
}
```

**Fallback:** If the script fails, use Twitter oEmbed:

```bash
curl -sL "https://publish.twitter.com/oembed?url=TWEET_URL&omit_script=1"
```

Parse `author_name` and HTML `<p>` for text. Avatar still needs fxtwitter or manual profile image URL.

### 2. Edit `apps/web/lib/testimonials.ts`

- Use **status id** as `id` (numeric string from URL)
- Set `url` to the canonical tweet URL (no query params)
- Run avatar through `twitterAvatarUrl()` (normalises any size suffix to `_bigger`, 73×73: avatars render at 40px)
- Strip leading `@uixmat` from content; trim whitespace
- Shorten very long tweets if they include trailing promo links (keep the praise, drop link-only tails)

### 3. Ordering rules

Masonry uses CSS columns (top-to-bottom per column). On `lg`, **indices 0–2** = column 1 top 3, **3–5** = column 2 top 3, **6–8** = column 3 top 3.

- **Prioritize** when asked: place in the next open slot among indices 0–8 without duplicating ids
- **Replace** when asked: remove the old entry (match by handle or old id) before adding the new one
- Set `author.verified` from script output (`author.verification.verified` via FxTwitter)

### 4. Collapsed grid

The homepage shows `testimonialCollapsedCount` (6) cards before **See more**. No change needed when adding tweets unless the user asks to change visible rows.

### 5. Verify

```bash
cd apps/web && npx tsc --noEmit -p tsconfig.json
```

Open homepage — grid is 3 columns, bottom fade + **See more** expands max-height.

## Data source

Primary: [FxTwitter API](https://github.com/FixTweet/FxTwitter) `https://api.fxtwitter.com/{user}/status/{id}` — returns author name, screen_name, avatar_url, and text.

Do not commit API keys; the public endpoint is used by the script only at add-tweet time.

## Example entry

```ts
{
  id: "2056717453816729751",
  url: "https://x.com/jordienr/status/2056717453816729751",
  author: {
    name: "jordi",
    handle: "@jordienr",
    avatar: twitterAvatarUrl(
      "https://pbs.twimg.com/profile_images/2053541405121769475/TUDez6zL_200x200.jpg"
    ),
    verified: true,
  },
  content: "bklit saved my marriage",
},
```
