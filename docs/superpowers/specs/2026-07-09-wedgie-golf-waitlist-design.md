# wedgie.golf waitlist site — design

Approved 2026-07-09 in brainstorm.

A single static landing page at `wedgie.golf` to collect email signups for the
Wedgie (golf juggle counter) iOS app waitlist ahead of launch, with a
thank-you email sent automatically on signup. No custom backend, no
Firebase, no secrets in the client.

## Context

Wedgie (`apps/Wedgie/`) is an in-progress iOS app: point your phone at
yourself, juggle a golf ball on a wedge, the app counts. Brand is already
locked in from `apps/Wedgie/Wedgie.appspec.yaml`:

- Tagline: "How long can you keep it up?"
- Accent: electric lime `#C6FF00`
- Background: near-black `#101318`
- Register: playful

This site reuses that brand directly so the waitlist page and the eventual
App Store listing feel like the same product.

delicious.website already has a shared `/api/subscribe` route used by native
apps for newsletter signup, but it requires a Firebase App Check token,
which only a genuine app install can produce — a public website visitor
can't get one. It is not reused here; see "Waitlist mechanism" below for
why it isn't needed.

## Repo & structure

- New standalone repo: `apps/WedgieWeb/` (sibling to `apps/Wedgie/`), matching
  the umbrella convention in `apps/CLAUDE.md` of one GitHub repo per
  app/surface. A GitHub remote will be created later, same as the other
  local-only app repos.
- Repo layout:
  ```
  WedgieWeb/
    index.html
    styles.css
    script.js
    favicon / og-image assets
    docs/superpowers/specs/   (this file)
    README.md                 (Loops dashboard setup steps, deploy notes)
  ```
- No `package.json`, no build tooling — the deployed site is exactly the
  files in the repo.

## Page content & design

Single page, mobile-first, one scroll:

1. **Hero** — Wedgie name/mark, tagline "How long can you keep it up?", one
   short sentence describing the app (real-time juggle counter, point your
   phone, juggle a ball on a wedge).
2. **Signup form** — single email input + submit button. Inline
   success/error state after submit (no page navigation).
3. **Footer** — copyright line + one-line privacy note ("We'll only email
   you about launch. Unsubscribe anytime.") No separate privacy/terms
   pages — out of scope for a pre-launch waitlist with no other data
   collection.

Visual style: near-black `#101318` background, electric lime `#C6FF00`
accent on the CTA button and key text, playful tone matching the app.

## Waitlist mechanism

No custom backend. The form POSTs directly from client JS to Loops' public
"custom form" endpoint:

```
POST https://app.loops.so/api/newsletter-form/<FORM_ID>
Content-Type: application/x-www-form-urlencoded

email=<value>&source=waitlist-website
```

- `FORM_ID` is a public identifier (not a secret) — safe to hardcode in
  `script.js`.
- `script.js` handles the fetch, disables the button while in-flight, and
  swaps in a success or error message based on the response
  (`{success: true}` vs `{success: false, message}`).
- Basic honeypot field (hidden input, rejected client-side if filled) as
  light spam mitigation, since there's no server to rate-limit.

**One-time Loops dashboard setup** (documented in README, not code, done by
Oren before/at launch):
1. Create a public mailing list "Wedgie Waitlist."
2. Create a form (Forms → New form) tied to that list; copy its Form ID
   into `script.js`.
3. Create a Loop (automated email) triggered on signup/added-to-list that
   sends the thank-you email.

## Deploy

- Vercel, static project (no framework preset — plain HTML).
- Custom domain `wedgie.golf` pointed at the Vercel deployment. DNS record
  changes at the domain registrar are done by Oren, not automated here —
  exact records provided when the site is ready to go live.

## Out of scope

- Any backend/API route (custom or reused from delicious.website).
- Firebase/Firestore in any form.
- Privacy policy / terms pages.
- Analytics beyond whatever Loops/Vercel provide by default.
- Multi-page site — this is a single landing page only.
