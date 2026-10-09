# Baby Registry — Requirements

> What the app does and why. UI conventions follow [ui-specs/](../../ui-specs/CLAUDE.md).
> Deviations from those specs are logged in [progress.md](./progress.md).

## Problem Statement

The registry owner needs one place to organise the items they want for their baby. Family and friends need to see that list, pick items to buy, and know what has already been bought so nobody buys the same thing twice. Today this is coordinated informally, which leads to duplicate gifts and items nobody remembers to buy. The problem is solved when guests can see each item's remaining quantity and mark what they bought, and the owner can see what is still outstanding.

## Scope

**In scope**
- A single registry, owned by the project owner (one registry instance, not multi-tenant).
- Owner management of registry items (add, edit, remove).
- Guest browsing of the registry and marking items as purchased.
- A view of what has been purchased and what is still outstanding.
- Partial purchases against an item's wanted quantity.

**Out of scope**
- Multiple registries or other parents creating their own registries.
- In-app payments, checkout or any card handling. Guests buy from external retailers; the app only records that a purchase happened. No PCI-DSS scope.
- Reserving or claiming an item before buying it (v1 records purchases only).
- Email or push notifications.
- Price tracking, retailer integrations or scraping product details from links.
- Thank-you note management.

## Actors

- **Owner:** the parents-to-be. They enter the owner passphrase and get the owner role.
- **Guest:** a family member or friend. They enter the shared family passphrase and get the guest role.

There are no user accounts and no third-party sign-in (an owner decision; see `progress.md`). Each visitor gives their name and a passphrase, and the passphrase decides the role.

## User Stories

### US-1: Manage registry items

> As an **owner**, I want **to add, edit and remove items**, so that **the registry reflects what we actually need**.

Acceptance criteria (EARS):
- The system **shall** store for each item: name (required, 1–120 chars), optional description (≤500 chars), optional retailer link (https URL), optional indicative price in ZAR, quantity wanted (integer 1–99, default 1), optional category, and priority (high / medium / low, default medium).
- When an owner submits a valid new item, the system **shall** add it to the registry and show it in the list without a full page reload.
- When an owner edits an item, the system **shall** save the changes and show them to all users on their next load.
- If an owner tries to lower the quantity wanted below the quantity already purchased, then the system **shall** reject the change and say why.
- When an owner removes an item that has purchases recorded, the system **shall** ask for confirmation before removing it.
- If a non-owner calls an item-management endpoint, then the API **shall** respond `403` regardless of what the UI renders.

### US-2: Browse the registry

> As a **guest**, I want **to browse the registry**, so that **I can choose something to buy**.

Acceptance criteria (EARS):
- The system **shall** list every item with its name, description, price, priority, category, retailer link, quantity wanted and quantity still needed.
- The system **shall** let users filter items by status (still needed / fully purchased / all) and by category.
- The system **shall** default the guest view to "still needed", ordered by priority (high first), then by name.
- When a user opens a retailer link, the system **shall** open it in a new tab with `rel="noopener noreferrer"`.

### US-3: Mark an item as purchased

> As a **guest**, I want **to mark an item as purchased**, so that **others don't buy it too**.

Acceptance criteria (EARS):
- When a guest marks an item as purchased, the system **shall** record a purchase with the quantity bought (default 1), the purchaser's user ID and the timestamp.
- The system **shall** reduce the item's "still needed" quantity by the purchased quantity.
- When an item's purchased quantity reaches its wanted quantity, the system **shall** show it as fully purchased and disable the purchase action.
- If a purchase would exceed the quantity still needed (for example, two guests buying the last unit at the same time), then the API **shall** reject it with `409` and the UI **shall** refresh the item and tell the guest.
- The system **shall** let a guest add an optional short note to a purchase (≤200 chars, for example "bought the blue one").

### US-4: Undo my purchase

> As a **guest**, I want **to undo a purchase I marked by mistake**, so that **the registry stays accurate**.

Acceptance criteria (EARS):
- When a guest undoes one of their own purchases, the system **shall** delete that purchase record and restore the item's "still needed" quantity.
- If a guest tries to undo a purchase recorded by someone else, then the API **shall** respond `403`.
- Where the user is an owner, the system **shall** also allow removing any purchase record (to correct mistakes).

### US-5: See what has been purchased

> As a **guest or owner**, I want **to see what has been purchased**, so that **I know what is covered and what is outstanding**.

Acceptance criteria (EARS):
- The system **shall** provide a "Purchased" view listing every purchase with item name, quantity and date.
- The system **shall** show a progress summary: items fully purchased out of total items, and units purchased out of units wanted.
- The system **shall** show each guest which purchases are their own.
- While the user is a guest, the system **shall not** show who made other guests' purchases.
- While the user is an owner, the system **shall** show the purchaser's display name and note on each purchase (see Open Question 2).

### US-6: Access control

> As an **owner**, I want **only people with our passphrase to see the registry**, so that **our family details aren't public**.

Acceptance criteria (EARS):
- The system **shall** show only the passphrase screen (name + passphrase) to visitors without a valid session, and every API endpoint except `/sessions` **shall** respond `401` to them.
- When a visitor enters the guest passphrase, the system **shall** grant the guest role; when they enter the owner passphrase, it **shall** grant the owner role. The role **shall** be decided on the server and carried in a signed, HttpOnly session cookie.
- Passphrase comparison **shall** ignore case and repeated spaces, and **shall** be constant-time.
- If more than 10 attempts are made from one client within 15 minutes, then the system **shall** refuse further attempts with `429` until the window passes.
- Sessions **shall** last 90 days for guests and 30 days for owners. Changing a role's passphrase **shall** end every session issued with it.
- When a visitor chooses "Leave", the system **shall** clear the session cookie and all cached registry data.
- If cookie-authenticated write requests come from another origin, then the API **shall** respond `403`.
- If the passphrase settings are missing, then the system **shall** refuse all access (fail closed).

## Non-Functional Requirements

- **Performance:** registry list renders within 2 s on a 4G mobile connection; up to 300 items and 50 concurrent users. API p99 latency < 500 ms.
- **Mobile:** fully usable at 360 px width. Most guests will open the link on a phone.
- **Security & compliance:**
  - POPIA: the only personal information collected is the name a visitor types on the passphrase screen (held in their signed cookie and stored with purchases they make) and optional purchase notes. No emails, phone numbers, addresses or ID numbers are collected, and no third-party identity provider is involved. A privacy notice is shown on the passphrase screen.
  - The passphrase rate-limit table stores an HMAC of the client IP, never the raw IP.
  - Search engines are asked not to index the site (`robots` meta tag and `X-Robots-Tag` header).
  - POPIA: the Postgres database may also be hosted outside South Africa (see Open Question 6); the same privacy notice covers it.
  - Purchaser names and notes never appear in logs (including Vercel function logs), URLs or error responses.
  - No cardholder data. The app never processes payments.
  - CSP and security headers, server-side role enforcement and input validation at the API boundary.
  - The session lives only in an HttpOnly, SameSite=Lax (and Secure over https) cookie. The app stores nothing in `localStorage`/`sessionStorage` and doesn't use `redux-persist`. The passphrases, session secret and database URL are server-side only; none are `VITE_*` variables.
- **Accessibility:** WCAG 2.1 AA for colour contrast, keyboard navigation and form labels.
- **Data retention:** registry and purchase data are kept until the owner deletes them. Retention after the baby arrives is set in Open Question 4.

## Stack

- **UI** (per `ui-specs`): React 18, Vite, Redux Toolkit + RTK Query, MUI v6, Emotion, React Hook Form, React Router, notistack, dayjs.
  - Not used: `tj-components`, `tj-assets` and Lineicons Pro, which are private TJ packages that a personal Vercel project can't pull. The theme tokens from `ui-specs/specs/ui/theming.md` are reproduced locally, icons come from `@mui/icons-material` (the spec's documented alternative), and Montserrat is self-hosted via `@fontsource-variable/montserrat`.
- **Access:** passphrase sessions implemented in the API (`api/_lib/session.js`), replacing Keycloak. No third-party auth dependency.
- **API:** Node.js Vercel Functions in JavaScript under `api/v1/`, with versioned kebab-case URLs and a `{code, message}` error body.
- **Database:** Postgres from the Vercel Marketplace (Neon), accessed with `@neondatabase/serverless`, with plain SQL migrations in `db/migrations/`.
- **Hosting:** the owner's personal Vercel account, replacing AWS. Environments are Vercel Preview (dev) and Production. Secrets live in Vercel environment variables.
- **Security headers:** CSP, HSTS, X-Frame-Options, Referrer-Policy and Permissions-Policy are set in `vercel.json`.

## Open Questions

Defaults have been chosen so the build can proceed; each is easy to change.

1. **Guest access.** *Decided: shared family passphrase* (owner's choice, 2026-10-09). Known trade-offs:
   - anyone the passphrase is passed to can get in;
   - names are self-declared;
   - undoing a purchase works only on the device it was made on (owners can undo anything).
2. **Surprise mode.** *Default: owners see who bought what* (useful for thank-yous). The alternative is that owners see only that an item was bought.
3. **Reservations.** *Default: purchases only for v1.*
4. **Retention.** *Default: kept until the owner deletes them.* Should purchaser names and notes be deleted automatically some time after the registry closes (for example, 90 days)?
5. **Owner identification.** *Decided: a separate `OWNER_PASSPHRASE`*, known only to the parents-to-be.
6. **Database region (POPIA).** If the Neon project isn't in a South African region, registry data is stored offshore. That is a cross-border transfer (POPIA s72), which the privacy notice should then mention. Is that acceptable?
