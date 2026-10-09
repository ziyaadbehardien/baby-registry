# Baby Registry

A private registry for organising the things we want for the baby. Family and friends enter a shared passphrase to browse it, mark what they've bought, and see what's still needed.

- **Requirements and decisions:** [specs/baby-registry/](specs/baby-registry/)
- **UI conventions:** [ui-specs/](ui-specs/CLAUDE.md)

## Stack

React 18 + Vite, Redux Toolkit / RTK Query, MUI v6, React Hook Form, Node.js Vercel Functions (`api/v1`), and Neon Postgres. It is hosted on Vercel. There are no user accounts: access is by passphrase.

## One-time setup

### 1. Passphrases

Set these server-only variables in `.env.local` (locally) and in Vercel's environment variables (deployed):

| Variable | What it does |
|---|---|
| `GUEST_PASSPHRASE` | Shared with family and friends. Lets them browse and mark gifts as bought. |
| `OWNER_PASSPHRASE` | For the two of you only. Lets you add, edit and remove items and see who bought what. Must differ from the guest passphrase. |
| `SESSION_SECRET` | Signs the session cookies. At least 32 random characters, e.g. from `openssl rand -base64 48`. |

- Passphrases ignore case and extra spaces.
- After a correct entry, a device stays in for 90 days (guests) or 30 days (owners).
- Changing a passphrase signs out everyone who used it. Changing `SESSION_SECRET` signs out everyone.
- After 10 wrong attempts in 15 minutes, further attempts from that connection are refused until the window passes.
- Until `GUEST_PASSPHRASE` and `SESSION_SECRET` are set, nobody can get in.

### 2. Vercel and the database

1. Import this repo as a Vercel project. The framework preset is Vite; the settings come from `vercel.json`.
2. Add **Neon** from the Vercel Marketplace (Storage tab). This sets `DATABASE_URL`.
3. Add `GUEST_PASSPHRASE`, `OWNER_PASSPHRASE` and `SESSION_SECRET` (see [.env.example](.env.example)).
4. Pull the variables locally and create the tables:

   ```bash
   vercel env pull .env.local
   npm run db:migrate
   ```

## Development

```bash
npm install
npm start          # UI + API on http://localhost:3000 (no Vercel login needed)
npm run dev:full   # vercel dev: closest to production; needs `vercel link`
npm run test:run   # unit tests
npm run lint
npm run build
```

`npm start` serves the API functions through a Vite dev plugin ([scripts/viteApiDev.js](scripts/viteApiDev.js)). If `DATABASE_URL` isn't set, it uses an embedded Postgres (PGlite) stored in `.local-db/`. Migrations apply automatically, and deleting the folder resets the data. Neither applies to deployments.

## Personalising the landing page

The "Our Story" page content (names, due date, intro, heartfelt note and shower details) lives in [api/_lib/registryDetails.js](api/_lib/registryDetails.js). It currently holds the sample text from the design mock-up. Put the family photo in `private/` as `hero.jpg` (or `.png`/`.webp`, max 4 MB).

Both are served only to visitors who have entered a passphrase, not bundled into the public UI code or `public/`. If this repo is ever made public, though, the photo and text are visible there.

## API

Apart from `/sessions`, every endpoint requires the session cookie set by `POST /api/v1/sessions`. Write requests must also come from the site's own origin. Errors return `{ "code", "message" }`.

| Method | Path | Who | Purpose |
|---|---|---|---|
| POST | `/api/v1/sessions` | anyone | `{ name, passphrase }` → sets the session cookie (`401` wrong, `429` too many attempts) |
| DELETE | `/api/v1/sessions` | anyone | Leave: clears the cookie |
| GET | `/api/v1/me` | any | Caller's role (`owner` / `guest`) and name |
| GET | `/api/v1/registry-details` | any | Landing-page content |
| GET | `/api/v1/hero-photo` | any | Family photo as a data URL (`404` if none) |
| GET | `/api/v1/items` | any | All items with remaining quantity |
| POST | `/api/v1/link-previews` | owner | Read a shop page's product photo and title (`{ url }` → `{ imageUrl, title }`) |
| POST | `/api/v1/items` | owner | Add an item |
| PUT | `/api/v1/items/:id` | owner | Replace an item (can't go below quantity bought → `409`) |
| DELETE | `/api/v1/items/:id` | owner | Remove an item and its purchases |
| POST | `/api/v1/items/:id/purchases` | any | Mark as bought (`409` if it would exceed what's needed) |
| GET | `/api/v1/purchases` | any | Purchases; guests only see names and notes on their own |
| DELETE | `/api/v1/purchases/:id` | purchaser / owner | Undo a purchase |
