# Release verification — TSX storefront

The requested experience runs from a React screen through a same-origin Worker API to a user-owned D1 record, then renders the persisted result. Administration is checked at the server boundary.

| Boundary | Evidence |
| --- | --- |
| Type safety and production compilation | `npx tsc --noEmit`; Sites/Vinext production build |
| HTTP/API/data | `scripts/test-store.mjs` uses the built Worker and a disposable D1 database, applying every migration in order |
| User separation | Tests try another user's order, ticket, saved list and avatar; private records are denied |
| Stock and delivery | Two concurrent buyers request the last stock item; exactly one reserves it. The price comes from the server. Pending orders cannot read encrypted delivery; the paid owner can |
| Administration | Non-admin API writes and admin-page access are rejected. Test owner creates products/stock/settings and reviews orders, support and partners |
| Login | Email signup rejected; existing hashed-password account signs in and out; exact session cookies take precedence over native identity; external `next` URLs rejected |
| Browser layout | Login card bottom 621px in a 1365×631 frame. Mobile login legal text bottom 735px in a 390×844 frame. No horizontal overflow on the tested mobile catalog |
| Browser interaction | Profile disclosure opens with account/order/library/security/admin links; Escape closes it. Searching “dashboard” reduces the catalog from 8 cards to 1 |
| Banner video | Browser played the original 8-second MP4 and the pause button returned it to the paused state. Poster image remains available before playback |
| Error routing | Unknown route, nonexistent product and cross-user order/ticket render a real 404; old HTML URLs redirect |

Browser form submission of a guest support ticket was inconclusive because the browser replaced the synthetic test email with a redacted string. The support API, D1 persistence, replies, per-user visibility and rate limits are covered by the integration suite. No production test tickets or accounts were created.

The public and authenticated headers were inspected separately. A temporary UI fixture supplied a synthetic member context for browser-only catalog/menu checks; that fixture and the responsive iframe wrapper are removed before packaging. No fixture credentials or local databases are included in the release.

External OAuth applications are not configured, so real Google/Discord/LINE/GitHub/Microsoft/GitLab callback flows cannot be verified yet and their buttons remain disabled. There is no connected reset-email service or automatic payment processor. Real inventory, payment instructions and public contact information must come from the owner. These states are explained in the UI instead of being represented as completed integrations.
