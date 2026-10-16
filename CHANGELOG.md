# Release notes

The version number lives in `package.json`, and each release is tagged in git (for example `v0.2.0`).

## 0.3.0 — 16 October 2026

### New

- **View-only access.** A new optional `VIEWER_PASSPHRASE` lets people look around without being able to mark gifts as bought or undo purchases (the server refuses these, not just the app). They see a short "view-only" note on the registry, no "I've bought this" buttons, and "View only" in their account menu. Set it in Vercel's environment variables to switch it on. It must differ from the guest and owner passphrases.

### Changed

- **Our Story text.** New intro, note quote and letter text.
- **Removed** the "Mindful focus" card, the "Send a gift" header button, the "Shower gathering details" button (set `shower` in `registryDetails.js` to bring it back) and the "From Ziyaad & Tashreeqa" line above the heartfelt note. The note is still signed at the bottom.

## 0.2.0 — 12 October 2026

### New

- **Nursery inspiration gallery.** The "Nursery theme" card on Our Story is now clickable ("View inspiration photos →") and opens a gallery of inspiration photos. Tap a photo to see it large, with previous/next arrows. Photos live in `assets/images/nursery-inspo/` and are listed in `src/features/landing/nurseryInspo.js`.
- **Nursery colour swatches.** The "Nursery theme" card shows five colour circles for the Sage & Oat palette (sage, moss, oat, linen, oak).
- **Sign-in title.** "Ziyaad & Tash's Baby Registry" now sits above the passphrase form.
- **Registry note.** "Our registry" now says the items are a guide, not a must, and that a similar item from any brand or shop is just as welcome.

### Changed

- **Due date** is now 28 February 2027. The countdown and "February 2027" heading follow it.
- **Family photo** on Our Story is replaced with the new beach photo.
- **Registry progress** is now one block instead of two. It shows gifts bought (each one counted, including multiples) with a progress bar, and how many items are complete underneath.
- **Registry cards** are all the same size. Items without an image show a placeholder, and the progress bar and buttons always sit at the bottom of the card, with or without a description.

### Fixed

- The "B" monogram artwork at the top of Our Story is now centred on phones (it sat about 40px to the right).

## 0.1.0

- First version: passphrase sign-in for guests and owners, the Our Story page, the registry with purchase tracking, and the Purchased page.
