# Brand assets

Drop the Solariem logo here as **`solariem-logo.png`**.

The filename and path are not a suggestion — `BRAND_ASSETS.logoPath` in
`src/lib/site.ts` points at `/brand/solariem-logo.png`, and the transactional
email header resolves that path at send time. No code change is needed; the
moment the file exists, every email goes out with the logo in it.

## What the file needs to be

| | |
|---|---|
| Format | PNG |
| Transparency | yes — the email header is white, a white box will show |
| Size | 336 x 96 px (2x the 168 x 48 it is displayed at) |
| Colour | full colour is fine; do not use a colour that disappears on white |
| Margin | keep clear space around the mark, do not bake padding into the canvas |

**Design for 32 px.** Email clients scale images down, and Outlook sometimes
ignores the width attribute entirely and renders at intrinsic size. A mark that
only works at 200 px looks like a smudge in a message someone is being asked to
trust with a banking password.

**PNG, not SVG or WebP.** Outlook (Word engine) does not render SVG at all, and
a good share of mail clients still block WebP. A broken image icon at the top of
the email is worse than no logo at all — which is why the template falls back to
a text wordmark when this file is absent, and why `npm run check:launch` keeps
reporting it as a blocker until it is here.

## Favicon

`src/app/favicon.ico` is Next.js's built-in default triangle. Replace it with
the real mark at 32 x 32 px. Next.js also picks up `icon.png` or `apple-icon.png`
from this directory if present, which is what iOS and Safari use — a 180 x 180
`apple-icon.png` alongside a 32 x 32 `icon.png` covers both.

## Verifying

`node scripts/check-launch-readiness.mjs` stops reporting the missing logo once
the file is in place. To see the real thing rendered, send yourself a test
password reset from a signed-in account and look at the top of it.
