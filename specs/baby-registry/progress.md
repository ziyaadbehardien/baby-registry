# Baby Registry — Progress

> Living log. Newest entries at the top; append-only.

## 2026-10-09 — Sign-in motion

- **Decision (owner):** sign-in animations adapted from a Dribbble login concept (PayPal redesign by Michał Michańczyk), studied frame by frame from the shot's video, in the baby-blue palette.
  - **Load (~1.1 s):** a pale-blue cover, then a blue band sweeps left → right revealing the page; the artwork settles from a 1.08 zoom; the form card rises in and its rows stagger in.
  - **Sign-in:** a thin progress line runs across the top while checking. On success the card fades up and a baby-blue curtain drops from the top with "Welcome, {first name}", holds ~0.7 s, then the app loads and the curtain lifts away (`ArrivalReveal` in `BaseLayout`, triggered by navigation state, which is cleared after so a refresh doesn't replay it).
  - **Wrong passphrase:** the card shakes and the error shows at once (the row stagger only applies during the intro).
- **Implementation:** CSS keyframes (`src/features/access/accessMotion.js`, `IntroCurtain`, `WelcomeCurtain`, `ArrivalReveal`). Fixed overlays are portalled to `<body>`, because the transformed form column would otherwise trap them. `prefers-reduced-motion` disables all of it.
- **Verified:** headless Chrome was driven over the DevTools protocol (fictional test passphrases, spare-port server) to capture timed frames of the intro, the wrong-passphrase shake with the error visible, and the full success sequence ending on `/`.

## 2026-10-09 — New sign-in artwork

- **Decision (owner):** the passphrase screen now uses a striped nursery-animals illustration (bunny, bear and giraffe on blue/cream stripes). It was cropped from the owner's phone screenshot to remove the status bar, the app buttons, captions and rounded corners: 1154×1916, saved as `assets/images/signin-animals.jpg`, 235 KB.
- **Layout:** desktop is split, with the artwork filling the left half (`cover`, focus 50% 45%, so the bunny's ears through the giraffe's body stay in view) and the form plus privacy note on the right. On phones the artwork is a 42vh banner focused on the animals' faces, with the form below.
- The toile "B" artwork (`welcome-toile.jpg`) is still used for the opening section of "Our Story".
- **Note:** the illustration came from a Pinterest pin (someone else's artwork). That's fine for a private family site, but worth replacing with licensed art if the site is ever made public.
- Verified with screenshots at 1440×900 and 390px.

## 2026-10-09 — Artwork hero on "Our Story"

- **Decision (owner):** the landing page opens with the same toile monogram artwork as the passphrase screen (`src/features/landing/ArtworkHero.jsx`). It fills the window below the sticky header and has a frosted "Our story" button that smooth-scrolls to the existing content. All previous landing content is unchanged and now sits below it, with `scroll-margin-top` so the header doesn't cover it.
- Verified with screenshots at 1440×900 and 390px. Screenshots were taken through a throwaway same-origin page that entered a fictional test passphrase on a spare-port dev server; it was removed afterwards.

## 2026-10-09 — Welcome-screen artwork

- **Decision (owner):** the passphrase screen, the first thing visitors see, uses the owner's toile "B" monogram artwork (`assets/images/welcome-toile.jpg`, 258 KB, bundled by Vite).
  - The artwork was rotated 90° anticlockwise so the "B" is upright and the image is landscape (1736×1153). It's always shown whole, never cropped.
  - Later (owner request): the artwork became a full-screen fixed backdrop. The form and privacy note float over it on frosted (86% white, blurred) panels. On desktop they sit to the right of the monogram; on phones they start at 58vh, so the "B" stays visible above.
- The artwork contains no personal information, so it's fine to serve before the passphrase. The family photo and names stay behind the passphrase.
- Verified with screenshots at 1440px and 390px.

## 2026-10-09 — Passphrase access; Clerk removed

- **Decision (owner):** no sign-in accounts. Visitors enter their name and a passphrase on a single gate screen (`/welcome`); nothing else in the app or API is reachable without a session.
  - `GUEST_PASSPHRASE` → guest role (browse, mark bought), 90-day session.
  - `OWNER_PASSPHRASE` → owner role (manage items, see all purchasers), 30-day session.
- **Removed:** everything Clerk. That covers `@clerk/react` and `@clerk/backend`, the sign-in/sign-up pages, `ClerkRoot`, Clerk keys and env vars, the CSP hosts, the `clerk link`, and the local `AUTH_DISABLED` bypass (it existed only to skip Clerk). The "Baby Registry" Clerk app still exists in the owner's Clerk account but is no longer used.
- **Security design (`api/_lib/session.js`, `api/_lib/auth.js`, `api/v1/sessions.js`):**
  - the session is a signed (HMAC-SHA256, `SESSION_SECRET`) HttpOnly, SameSite=Lax cookie, Secure on https; the token carries a per-role passphrase version, so changing a passphrase signs that role out;
  - passphrases are compared in constant time, ignoring case and spacing;
  - the form allows 10 attempts per 15 minutes per client (Postgres table `gate_attempts`, migration 003, HMAC'd IP) plus a 400 ms delay on wrong guesses;
  - cookie-authenticated writes must carry a same-site `Origin` (403 otherwise);
  - access fails closed (503) until `GUEST_PASSPHRASE` and a 32+ character `SESSION_SECRET` are set;
  - the site is marked noindex via a meta tag and an `X-Robots-Tag` header.
- **Privacy:** the only personal data is the visitor's typed name and optional purchase notes. There is no longer a third-party identity provider or Clerk cross-border transfer.
- **Owner action needed:** set `GUEST_PASSPHRASE`, `OWNER_PASSPHRASE` and `SESSION_SECRET` in `.env.local` (and later in Vercel). These are credentials, so they were deliberately not generated or written by the assistant.
- **Verified:**
  - 78 unit tests pass (tokens, tampering incl. guest→owner forgery, expiry, rotation, origin checks, endpoint, rate limit);
  - an end-to-end run on a dev server with fictional passphrases covered guest/owner entry, the owner-only 403, the missing/foreign Origin 403, purchase attribution and visibility, and leaving;
  - the gate screen was screenshotted;
  - the production bundle contains no Clerk code and no secrets.

## 2026-10-08 — Baby blue & green palette

- **Decision (owner request):** replaced the sage/terracotta/warm-neutral palette with light baby blues (primary), baby greens (secondary), a soft aqua (tertiary) and cool light neutrals. Fonts are unchanged. Tones live in `assets/theme.js`.
- **Approach:** pastels (tones 70–95) are used for surfaces and fills; deeper tones (20–50) carry text and icons.
  - buttons are a baby-blue fill with navy text;
  - secondary buttons and "bought" states are mint with deep-green text;
  - the high-priority chip is a soft blue (was terracotta);
  - the Clerk widget uses a deeper blue, because it puts white text on its primary colour.
- **Accessibility:** all checked text pairs are 4.84–12.64:1; the primary icon colour is 3.55:1 (≥3:1 for non-text).
- **Note:** the landing content still says nursery theme "Sage & Oat", which may no longer match.

## 2026-10-08 — Clerk sign-in re-enabled

- **Decision:** a dedicated Clerk application "Baby Registry" (`app_3KPBwR4AIubuDPZH8mEfPX93SmM`, development instance), created with the Clerk CLI, linked to this repo, and with keys pulled into `.env.local`. The owner's existing app "recurlly" was deliberately not reused.
- **Clerk dev instance config:**
  - 30-minute inactivity timeout (US-6), 7-day maximum session;
  - first name required and last name optional, so purchases show real names instead of "Guest";
  - sign-in by email + password or Google.
- **Pending:** sign-up mode is still `public`. Once the owner has signed up: set `OWNER_USER_IDS` to their Clerk user ID, then switch sign-up mode to `restricted` (invite-only).
- **Bypass:** switched off; the flags are commented out in `.env` and `.env.local`. The bypass code remains for future local use.
- **Fix:** the Vite dev API plugin now removes env values it injected before re-reading env files. Previously a deleted `AUTH_DISABLED` line lingered in the dev process until a full restart.
- **Verified:** fresh dev server returns 401 for missing and invalid tokens; the `/` → `/sign-in` page renders the themed Clerk widget.

## 2026-10-08 — Landing page ("Our Story")

- **Decision:** a new landing page at `/`, built from the owner's mock-up. The registry list moves to `/registry`. Navigation is Our Story, Registry Items and Purchased; there's a header with monogram, due date and a "Send a gift" button.
  - Hero: headline, intro, three fact cards with a live due-date countdown, an arched photo with a parents card, and a shower details dialog.
  - Below: a heartfelt-note letter.
- **Decision (privacy):** the landing content is personal (names, due date, family photo), and the UI bundle and `public/` are downloadable without sign-in. So the content is served by `GET /api/v1/registry-details` from `api/_lib/registryDetails.js`, and the photo by `GET /api/v1/hero-photo` from `private/` (bundled into that function via `vercel.json` `includeFiles`). A production build was checked to contain none of the landing text.
- **Note:** content personalised for the Behardien family: parents Ziyaad & Tashreeqa, monogram "B". No baby name or gender has been chosen, so all name, nickname and "It's a boy!" fields were removed. Copy uses "our little one", and the second fact card shows the nursery theme instead. The due date, nursery theme and shower details are still mock-up placeholders.
- **Not built:** the mock-up's other nav items (Nursery Tour, Cash & Experiences Funds, FAQ, Guestbook). There are no features behind them yet.
- **Theme:** blush page (`#FCF3EF`) with white cards, to match the mock-up.
- **Verified:** screenshots in headless Chrome at 1280px and 390px, after fixing the wreath, IconButton colours, toggle wrapping and the category label.

## 2026-10-07 — Owner's design system

- **Deviation:** the TJ palette and Montserrat from `ui-specs/specs/ui/design-system.md` are replaced by the owner's design system:
  - colours: Primary `#4E6B56`, Secondary `#D98E73`, Tertiary `#63846C`, Neutral `#2D2825`;
  - fonts: Playfair Display for headlines, Plus Jakarta Sans for body text and labels.
- Tonal palettes and surfaces live in `assets/theme.js` (`tones`, `surface`).
- **Components:**
  - warm grey page with lighter cards rounded to 24px, and a pill navigation bar;
  - progress bars are terracotta in progress and green when complete;
  - high-priority chip is terracotta; edit/delete icons are green/red.
- **Accessibility:** text on secondary (`#D98E73`) is dark, because white fails contrast. Key text/background pairs were checked at 4.7–10.6:1 (WCAG AA).

## 2026-10-07 — Product photos

- **Decision:** items have an optional `imageUrl` (migration `002_add_item_image.sql`). When the owner enters a shop link, `POST /api/v1/link-previews` reads the page's `og:image` (falling back to `twitter:image`, a JSON-LD Product image, then `link rel=image_src`) and fills in the photo, plus the name if it's empty. The owner can also paste or remove a photo link.
- **Security:** the preview fetch is owner-only and SSRF-hardened:
  - https only, on the default port;
  - the resolved IP is checked at connect time, which blocks private, loopback, link-local and metadata addresses and stops DNS rebinding;
  - redirects are re-validated, with a 5 s timeout and a 1 MB cap, and only HTML is read.
- **Trade-off:** photos are hot-linked from the shops' CDNs, with `referrerPolicy="no-referrer"` and a placeholder if one fails to load, so CSP `img-src` now allows `https:`. Copying images into Vercel Blob would remove the dependency on shop CDNs; that's a possible later change.
- **Note:** the local PGlite database applies new migrations live and keeps one instance across Vite module reloads.

## 2026-10-07 — Local dev without accounts

- **Blocker (resolved):** "Something went wrong" on localhost:3000. There were three causes:
  - there was no `.env.local`, so the bypass was off and Clerk threw without a publishable key;
  - `npm start` ran only Vite, so `/api/*` didn't exist;
  - there was no database.
- **Decision:** `npm start` now serves `api/v1` through a Vite dev plugin (`scripts/viteApiDev.js`). Without `DATABASE_URL`, the API uses PGlite (embedded Postgres, dev dependency) in `.local-db/`, with migrations auto-applied. Both are local-only: the plugin is `apply: 'serve'`, and `getSql` refuses the fallback on Vercel deployments.
- **Note:** verified end to end on a spare port: create item, validation error, purchase, 409 over-buy, 409 quantity-below-purchased, undo, SPA route.

## 2026-10-07 — Temporary Clerk bypass

- **Deviation (temporary):** the owner asked to bypass Clerk while it isn't set up yet. `VITE_AUTH_DISABLED` (UI) and `AUTH_DISABLED` (API) skip sign-in and act as `local_dev_user`, as owner by default or as guest with `AUTH_DISABLED_ROLE=guest`.
  - The UI flag only applies in Vite dev mode; a production build was verified to contain no bypass code.
  - The API flag is ignored when `VERCEL_ENV` is `preview` or `production` (covered by `api/_lib/auth.test.js`).
  - **To re-enable:** remove the flags from `.env.local`. The Clerk code is unchanged.

## 2026-10-07 — v1 implemented

- **Note:** UI, API and schema implemented for US-1 to US-6.
  - 28 unit tests pass (validation, role resolution, purchaser visibility, 409/403/404 paths, error masking, filters).
  - `eslint` is clean and `vite build` succeeds (263 KB gzipped JS).
  - Handler smoke test: all 7 endpoints return 401 without a valid Clerk token.
- **Not yet verified:** end-to-end against a real Clerk instance and Neon database. That needs the setup steps in `README.md`.
- **Decision:** concurrency. `quantity_purchased` is denormalised onto `items`, so a purchase is one `UPDATE … WHERE quantity_purchased + n <= quantity_wanted` CTE. Concurrent buyers can't oversubscribe an item.
- **Decision:** the 30-minute idle timeout (US-6) is a Clerk dashboard setting (Sessions → inactivity timeout), not app code.
- **Known issue:** `npm audit` reports advisories in dev-only tooling (Vite 5's esbuild, Vitest 2). Upgrading means moving off the spec's Vite 5.4 pin. Nothing affected ships to users.
- **Deviation:** production CSP must list the Clerk production Frontend API host; `vercel.json` currently allows only the dev host (`*.clerk.accounts.dev`).

## 2026-10-07 — Build against the new `ui-specs`

- **Note:** `tj-ai-specs/` was replaced by `ui-specs/` (the Recon UI guidelines). Its `requirements.md` / `api.md` describe the Archiving module and are reference material only; the registry follows its guidelines and UI specs.
- **Deviation:** `tj-components`, `tj-assets` (theme pull scripts) and Lineicons Pro are private TJ packages, so they aren't used. Instead:
  - the theme is reproduced locally from `theming.md`;
  - small local `T*` components cover what's needed;
  - icons come from `@mui/icons-material`;
  - Montserrat comes from `@fontsource-variable/montserrat`.
- **Deviation:** `api-patterns.md` reads the bearer token from `sessionStorage`. Here the token is fetched from Clerk (`getToken()`) on every request in `prepareHeaders`, and nothing is stored in browser storage.
- **Deviation:** `redux-persist` isn't used. There is no lookup data worth persisting, and persisting registry data would put personal information in `localStorage`.
- **Deviation:** `material-react-table` isn't used. A card list reads better on phones, where most guests will open the registry.
- **Deviation:** hosting is on the owner's **personal Vercel account** instead of AWS. The API runs as Node.js Vercel Functions in JavaScript (Java/Spring Boot isn't a Vercel runtime), Postgres is Neon, and secrets are Vercel env vars.

## 2026-10-07 — Requirements

- **Deviation:** sign-in uses **Clerk** instead of Keycloak (owner decision). The Keycloak lifecycle rules (SSO idle probe, realm roles) don't apply.
- **Decision:** single registry for the project owner only; multi-registry is out of scope.
- **Note:** product defaults (invite-only, owner sees purchasers, no reservations) are recorded as open questions in `requirements.md`.
