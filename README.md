# wedgie.golf

Static waitlist landing page for Wedgie — a real-time golf ball juggle
counter for iOS. No build step, no framework: just `index.html`,
`styles.css`, and `script.js`.

## Local dev

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/.

## Running tests

```bash
node --test script.test.js
```

## Loops setup (one-time, do this before going live)

1. In the [Loops dashboard](https://app.loops.so), go to **Audience →
   Mailing Lists** and create a public list called "Wedgie Waitlist."
2. Go to **Forms → New form**, point it at that list, and copy the
   form's ID from its embed/settings page.
3. Open `script.js` and replace the `LOOPS_FORM_ID` placeholder value
   with that real form ID.
4. Go to **Loops (automations) → New Loop**, trigger it on "added to
   mailing list" (or "form submitted," depending on what Loops offers
   at setup time) for the "Wedgie Waitlist" list, and write the
   thank-you email.

## Deploy

Vercel, static project (no framework preset). Once a GitHub remote
exists for this repo, connect it in Vercel and deploy — no environment
variables or build command needed. Point the `wedgie.golf` domain at
the Vercel deployment via the registrar's DNS settings once the site
is ready to go live.
