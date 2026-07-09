# Wedgie Waitlist Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a static waitlist landing page for wedgie.golf that collects emails via Loops' public form endpoint and shows inline success/error feedback, with zero custom backend.

**Architecture:** A single static page (`index.html` + `styles.css` + `script.js`) with no build step. `script.js` splits pure, testable logic (email validation, honeypot check, request-body building, endpoint construction) from DOM wiring, using a dual CommonJS/browser export pattern so the pure logic is unit-testable with Node's built-in test runner without any bundler or `package.json`.

**Tech Stack:** Plain HTML/CSS/JS. No framework, no npm dependencies. Testing via `node --test` (Node's built-in test runner, no test framework dependency).

## Global Constraints

- No build tooling, no `package.json`, no framework — plain static HTML/CSS/JS only.
- No custom backend or API route — the form POSTs directly to Loops' public `newsletter-form` endpoint from client JS.
- No Firebase/Firestore in any form.
- No privacy/terms pages — a one-line footer disclaimer only.
- Brand: background `#101318`, accent `#C6FF00`, tagline "How long can you keep it up?", playful register.
- Domain target: `wedgie.golf` (DNS/registrar change is manual, done by Oren, not part of this plan).
- Repo: `apps/WedgieWeb/` — already initialized as its own git repo; the design spec is its first commit.

---

## File Structure

- `index.html` — page markup: hero (name, tagline, subhead), waitlist form (email input + honeypot + submit button), inline status message, footer.
- `styles.css` — all styling: CSS variables for the brand palette, layout, bounce animation, responsive rules.
- `script.js` — pure logic functions (`isValidEmail`, `isHoneypotFilled`, `buildFormBody`, `loopsEndpoint`) plus DOM wiring (`initWaitlistForm`, `showMessage`). Ends with a dual export guard: `module.exports` when required from Node (tests), a guarded `initWaitlistForm()` call when loaded in a browser (`document` exists). Loaded as a classic script (no `type="module"`), so there's no ES-module MIME-type dependency for local static-file serving.
- `script.test.js` — Node built-in test runner (`node:test` + `node:assert/strict`) tests for the pure functions in `script.js`, run via `require`.
- `favicon.png`, `apple-touch-icon.png` — generated from the existing app icon at `apps/Wedgie/branding/icon-1024.png` via macOS `sips` (no new dependency).
- `README.md` — local dev instructions, one-time Loops dashboard setup, deploy notes.
- `.gitignore` — ignores `.DS_Store`.

---

### Task 1: Repo housekeeping — README and .gitignore

**Files:**
- Create: `apps/WedgieWeb/.gitignore`
- Create: `apps/WedgieWeb/README.md`

**Interfaces:**
- Produces: the `LOOPS_FORM_ID` placeholder name referenced in Task 5/6's `script.js`, and the local dev command (`python3 -m http.server 8000`) referenced in Task 3/6's manual verification steps.

- [ ] **Step 1: Create `.gitignore`**

```
.DS_Store
```

- [ ] **Step 2: Create `README.md`**

```markdown
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
```

- [ ] **Step 3: Commit**

```bash
cd apps/WedgieWeb
git add .gitignore README.md
git commit -m "docs: add README and gitignore"
```

---

### Task 2: Favicon and touch icon

**Files:**
- Create: `apps/WedgieWeb/favicon.png` (generated)
- Create: `apps/WedgieWeb/apple-touch-icon.png` (generated)

**Interfaces:**
- Consumes: `apps/Wedgie/branding/icon-1024.png` (existing app icon, read-only).
- Produces: `favicon.png`, `apple-touch-icon.png`, referenced by `<link>` tags in Task 3's `index.html`.

- [ ] **Step 1: Generate the 32×32 favicon**

```bash
cd apps/WedgieWeb
sips -z 32 32 ../Wedgie/branding/icon-1024.png --out favicon.png
```

- [ ] **Step 2: Verify favicon dimensions**

```bash
sips -g pixelWidth -g pixelHeight favicon.png
```

Expected output includes:
```
  pixelWidth: 32
  pixelHeight: 32
```

- [ ] **Step 3: Generate the 180×180 apple-touch-icon**

```bash
sips -z 180 180 ../Wedgie/branding/icon-1024.png --out apple-touch-icon.png
```

- [ ] **Step 4: Verify apple-touch-icon dimensions**

```bash
sips -g pixelWidth -g pixelHeight apple-touch-icon.png
```

Expected output includes:
```
  pixelWidth: 180
  pixelHeight: 180
```

- [ ] **Step 5: Commit**

```bash
git add favicon.png apple-touch-icon.png
git commit -m "assets: add favicon and apple-touch-icon from app icon"
```

---

### Task 3: HTML structure

**Files:**
- Create: `apps/WedgieWeb/index.html`

**Interfaces:**
- Consumes: `favicon.png`, `apple-touch-icon.png` (Task 2).
- Produces: DOM element IDs/classes that Task 4 (`styles.css`) and Task 6 (`script.js` DOM wiring) depend on exactly: `#waitlist-form`, `#email`, `#company` (honeypot), `#form-message`, `.submit-button`, `.email-input`, `.honeypot`, `.form-message`, `.ball`, `.title`, `.tagline`, `.subhead`, `.footer`.

- [ ] **Step 1: Write `index.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wedgie — How long can you keep it up?</title>
  <meta name="description" content="Wedgie is a real-time golf ball juggle counter for iOS. Point your phone at yourself, juggle on your wedge, and watch the count climb. Join the waitlist." />
  <meta property="og:title" content="Wedgie — How long can you keep it up?" />
  <meta property="og:description" content="A real-time golf ball juggle counter for iOS. Join the waitlist." />
  <meta property="og:type" content="website" />
  <link rel="icon" href="favicon.png" />
  <link rel="apple-touch-icon" href="apple-touch-icon.png" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="page">
    <div class="ball" aria-hidden="true"></div>
    <h1 class="title">Wedgie</h1>
    <p class="tagline">How long can you keep it up?</p>
    <p class="subhead">
      Point your phone at yourself, juggle a golf ball on your wedge, and
      watch the count climb in real time. Coming soon to iOS.
    </p>

    <form id="waitlist-form" class="waitlist-form" novalidate>
      <div class="honeypot" aria-hidden="true">
        <label for="company">Company</label>
        <input type="text" id="company" name="company" tabindex="-1" autocomplete="off" />
      </div>
      <input
        type="email"
        id="email"
        name="email"
        class="email-input"
        placeholder="you@email.com"
        required
        aria-label="Email address"
      />
      <button type="submit" class="submit-button">Join the waitlist</button>
    </form>
    <p id="form-message" class="form-message" role="status" aria-live="polite"></p>

    <footer class="footer">
      <p>&copy; 2026 Wedgie &middot; We'll only email you about launch. Unsubscribe anytime.</p>
    </footer>
  </main>

  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify the required elements are present**

```bash
grep -c 'id="waitlist-form"' index.html
grep -c 'id="email"' index.html
grep -c 'id="company"' index.html
grep -c 'id="form-message"' index.html
```

Expected: each command prints `1`.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add landing page markup"
```

---

### Task 4: Styling

**Files:**
- Create: `apps/WedgieWeb/styles.css`

**Interfaces:**
- Consumes: the exact class/ID names produced by Task 3.
- Produces: `.success` / `.error` classes on `#form-message`, toggled by Task 6's `showMessage()`.

- [ ] **Step 1: Write `styles.css`**

```css
:root {
  --bg: #101318;
  --accent: #c6ff00;
  --text: #f5f7fa;
  --text-muted: #9aa1ac;
  --error: #ff6b6b;
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
}

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 1.5rem 3rem;
  max-width: 640px;
  margin: 0 auto;
}

.ball {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent);
  margin-bottom: 1.5rem;
  animation: bounce 1.1s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-18px);
  }
}

.title {
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
}

.tagline {
  font-size: clamp(1.1rem, 4vw, 1.5rem);
  color: var(--accent);
  font-weight: 600;
  margin: 0.5rem 0 0;
}

.subhead {
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.5;
  max-width: 480px;
  margin: 1.25rem 0 2.5rem;
}

.waitlist-form {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  max-width: 420px;
  flex-wrap: wrap;
  justify-content: center;
}

.honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.email-input {
  flex: 1 1 220px;
  min-width: 0;
  padding: 0.85rem 1rem;
  border-radius: 999px;
  border: 1px solid #2a2f38;
  background: #171b21;
  color: var(--text);
  font-size: 1rem;
}

.email-input:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.submit-button {
  flex: 0 0 auto;
  padding: 0.85rem 1.5rem;
  border-radius: 999px;
  border: none;
  background: var(--accent);
  color: #101318;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: default;
}

.submit-button:not(:disabled):hover {
  filter: brightness(1.08);
}

.form-message {
  min-height: 1.5em;
  margin-top: 1rem;
  font-size: 0.95rem;
}

.form-message.success {
  color: var(--accent);
}

.form-message.error {
  color: var(--error);
}

.footer {
  margin-top: 3rem;
}

.footer p {
  color: var(--text-muted);
  font-size: 0.85rem;
}

@media (max-width: 480px) {
  .waitlist-form {
    flex-direction: column;
  }
  .submit-button {
    width: 100%;
  }
  .email-input {
    width: 100%;
  }
}
```

- [ ] **Step 2: Sanity-check the brand colors landed**

```bash
grep -ci '#c6ff00' styles.css
grep -ci '#101318' styles.css
```

Expected: both print a number ≥ `1`.

- [ ] **Step 3: Manual visual verification**

```bash
python3 -m http.server 8000
```

Open http://localhost:8000/ in a browser and confirm:
- Near-black background, lime-green tagline and button.
- The small ball above the title bounces continuously.
- At a narrow width (resize the window below ~480px, or use browser
  dev tools device mode), the email input and button stack vertically
  and the button spans the full width.

Stop the server with Ctrl-C when done.

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "style: add brand styling, layout, and responsive rules"
```

---

### Task 5: Pure form logic with Node unit tests (TDD)

**Files:**
- Create: `apps/WedgieWeb/script.js` (pure functions only at this stage — DOM wiring comes in Task 6)
- Create: `apps/WedgieWeb/script.test.js`

**Interfaces:**
- Produces: `isValidEmail(email: string): boolean`, `isHoneypotFilled(value: string): boolean`, `buildFormBody(email: string, source: string): string`, `loopsEndpoint(formId: string): string` — Task 6 imports all four via `require`.

- [ ] **Step 1: Write the failing test file**

```javascript
// script.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { isValidEmail, isHoneypotFilled, buildFormBody, loopsEndpoint } = require("./script.js");

test("isValidEmail accepts a normal address", () => {
  assert.equal(isValidEmail("oren@example.com"), true);
});

test("isValidEmail rejects a string with no @", () => {
  assert.equal(isValidEmail("not-an-email"), false);
});

test("isValidEmail rejects a string with no domain", () => {
  assert.equal(isValidEmail("oren@"), false);
});

test("isHoneypotFilled is false for an empty value", () => {
  assert.equal(isHoneypotFilled(""), false);
});

test("isHoneypotFilled is true when a bot fills the hidden field", () => {
  assert.equal(isHoneypotFilled("some spam text"), true);
});

test("buildFormBody url-encodes the email and includes source", () => {
  const body = buildFormBody("oren+test@example.com", "waitlist-website");
  assert.equal(body, "email=oren%2Btest%40example.com&source=waitlist-website");
});

test("loopsEndpoint builds the newsletter-form URL from a form id", () => {
  assert.equal(
    loopsEndpoint("abc123"),
    "https://app.loops.so/api/newsletter-form/abc123"
  );
});
```

- [ ] **Step 2: Run the tests and verify they fail**

```bash
node --test script.test.js
```

Expected: failures — `script.js` does not exist yet, so `require("./script.js")` throws `Cannot find module`.

- [ ] **Step 3: Write the minimal `script.js`**

```javascript
// script.js
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isHoneypotFilled(value) {
  return value.trim().length > 0;
}

function buildFormBody(email, source) {
  const params = new URLSearchParams();
  params.set("email", email.trim());
  params.set("source", source);
  return params.toString();
}

function loopsEndpoint(formId) {
  return "https://app.loops.so/api/newsletter-form/" + formId;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { isValidEmail, isHoneypotFilled, buildFormBody, loopsEndpoint };
}
```

- [ ] **Step 4: Run the tests and verify they pass**

```bash
node --test script.test.js
```

Expected: `pass 7`, `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add script.js script.test.js
git commit -m "feat: add pure waitlist form logic with unit tests"
```

---

### Task 6: DOM wiring and manual verification

**Files:**
- Modify: `apps/WedgieWeb/script.js` (add `showMessage`, `initWaitlistForm`, the `LOOPS_FORM_ID` placeholder, and the guarded browser init call — append below the Task 5 functions, above the `module.exports` guard)

**Interfaces:**
- Consumes: `isValidEmail`, `isHoneypotFilled`, `buildFormBody`, `loopsEndpoint` (Task 5, same file) and DOM element IDs from Task 3 (`#waitlist-form`, `#email`, `#company`, `#form-message`, `.submit-button`).
- Produces: fully interactive form; nothing downstream depends on this file further.

- [ ] **Step 1: Modify `script.js`** — insert the following between `loopsEndpoint` and the `module.exports` guard:

```javascript
// Replace with the real Form ID from https://app.loops.so/forms once the
// "Wedgie Waitlist" form is created — see README.md "Loops setup".
var LOOPS_FORM_ID = "REPLACE_WITH_LOOPS_FORM_ID";

function showMessage(el, type, text) {
  el.textContent = text;
  el.classList.remove("success", "error");
  if (type) el.classList.add(type);
}

function initWaitlistForm(doc) {
  doc = doc || document;
  var form = doc.getElementById("waitlist-form");
  var emailInput = doc.getElementById("email");
  var honeypot = doc.getElementById("company");
  var message = doc.getElementById("form-message");
  var button = form.querySelector(".submit-button");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (isHoneypotFilled(honeypot.value)) {
      showMessage(message, "success", "You're on the list. We'll email you the moment it's live.");
      form.reset();
      return;
    }

    if (!isValidEmail(emailInput.value)) {
      showMessage(message, "error", "That doesn't look like a valid email.");
      return;
    }

    button.disabled = true;
    showMessage(message, "", "");

    fetch(loopsEndpoint(LOOPS_FORM_ID), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: buildFormBody(emailInput.value, "waitlist-website"),
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (response.ok && data.success) {
            showMessage(message, "success", "You're on the list. We'll email you the moment it's live.");
            form.reset();
          } else {
            showMessage(message, "error", "Something went wrong — try again in a minute.");
            button.disabled = false;
          }
        });
      })
      .catch(function () {
        showMessage(message, "error", "Something went wrong — try again in a minute.");
        button.disabled = false;
      });
  });
}

if (typeof document !== "undefined") {
  initWaitlistForm();
}
```

The full file's tail (`module.exports` guard) stays last, unchanged from Task 5.

- [ ] **Step 2: Re-run the Node tests to confirm the pure logic still passes untouched**

```bash
node --test script.test.js
```

Expected: `pass 7`, `fail 0` (DOM wiring code never executes under Node since `document` is undefined there).

- [ ] **Step 3: Manual browser verification**

```bash
python3 -m http.server 8000
```

Open http://localhost:8000/ and check each case:
- Type an invalid string (e.g. `notanemail`) and submit → inline red
  message "That doesn't look like a valid email." appears, no network
  request fires (check the browser Network tab).
- Type a valid email and submit → button disables, a request fires to
  `https://app.loops.so/api/newsletter-form/REPLACE_WITH_LOOPS_FORM_ID`,
  which will fail (placeholder ID) → the red "Something went wrong"
  message appears and the button re-enables. This confirms the error
  path works; the success path can only be confirmed end-to-end after
  README's Loops setup step replaces `LOOPS_FORM_ID` with a real one.
- Using dev tools, set the hidden `#company` input's value to any
  non-empty text and submit → the green success message appears
  immediately and the form resets, with no network request (confirms
  the honeypot short-circuits before any fetch call).

Stop the server with Ctrl-C when done.

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: wire up waitlist form submission to Loops"
```

---

### Task 7: Record the new repo in the umbrella CLAUDE.md

**Files:**
- Modify: `/Users/yocohen/Developer/DeliciousWorks/apps/CLAUDE.md` (repo status table)

**Interfaces:**
- None — this is a documentation-only update in a different repo (the `apps/` umbrella repo), independent of everything else in this plan.

- [ ] **Step 1: Add a row to the repo status table**

In `apps/CLAUDE.md`, find the markdown table under "Current repo status
per app" and add a new row so the table reads (existing rows unchanged,
new row added):

```markdown
  | App | Repo |
  |---|---|
  | ShabbatClock | own repo → `cohen72/shabbatclock` |
  | Sixthings | local-only repo, no remote yet |
  | Snowball | local-only repo, no remote yet |
  | Zedtime | local-only repo, no remote yet |
  | Golfuggle | not a git repo yet |
  | Wedgie website (wedgie.golf) | local-only repo, no remote yet |
```

- [ ] **Step 2: Verify the row was added**

```bash
grep -n "Wedgie website" /Users/yocohen/Developer/DeliciousWorks/apps/CLAUDE.md
```

Expected: one matching line.

- [ ] **Step 3: Commit in the `apps/` umbrella repo**

```bash
cd /Users/yocohen/Developer/DeliciousWorks/apps
git add CLAUDE.md
git commit -m "docs: record WedgieWeb as a local-only repo"
```

---

## Manual steps after this plan (not automated)

1. Create a GitHub remote for `apps/WedgieWeb` when ready (per
   `apps/CLAUDE.md`, new remotes are created by Oren, not automatically).
2. Do the one-time Loops dashboard setup from `README.md`, then replace
   `LOOPS_FORM_ID` in `script.js` with the real form ID and re-verify the
   success path manually in a browser.
3. Create a Vercel project from the GitHub repo (static, no framework
   preset, no env vars needed) and deploy.
4. Point `wedgie.golf`'s DNS at the Vercel deployment via the domain
   registrar.
