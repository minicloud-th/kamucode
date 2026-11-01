# Release verification — TSX storefront

The requested experience runs from a React screen through a same-origin Worker API to a user-owned D1 record, then renders the persisted result. Administration is checked at the server boundary.

| Boundary | Evidence |
| --- | --- |
| Type safety and production compilation | `npx tsc --noEmit`; Sites/Vinext production build |
| HTTP/API/data | `scripts/test-store.mjs` uses the built Worker and a disposable D1 database, applying every migration in order |
| User separation | Tests try another user's order, ticket, saved list and avatar; private records are denied |
| Stock and delivery | Two concurrent buyers request the last stock item; exactly one reserves it. The price comes from the server. Pending orders cannot read encrypted delivery; the paid owner can |
| Administration | Non-admin API writes and admin-page access are rejected. Test owner creates products/stock/settings and reviews orders, support and partners |
| Login | Email signup creates a hashed credential and an unverified user; new and existing accounts sign in and out; unverified signup cannot claim an allowlisted admin email; exact session cookies take precedence over native identity; external `next` URLs rejected |
| Browser layout | Full-page email-first Login and Signup use their own minimal header/footer. The initial Login and password steps fit a 1365×631 viewport; Signup and its details step fit a 390×844 viewport, without horizontal overflow. No horizontal overflow on the tested mobile catalog |
| Browser interaction | Profile disclosure opens with account/order/library/security/admin links; Escape closes it. Searching “dashboard” reduces the catalog from 8 cards to 1 |
| Banner video | Browser played the original 8-second MP4 and the pause button returned it to the paused state. Poster image remains available before playback |
| Error routing | Unknown route, nonexistent product and cross-user order/ticket render a real 404; old HTML URLs redirect |

Browser form submission of a guest support ticket was inconclusive because the browser replaced the synthetic test email with a redacted string. The support API, D1 persistence, replies, per-user visibility and rate limits are covered by the integration suite. No production test tickets or accounts were created.

The public and authenticated headers were inspected separately. A temporary UI fixture supplied a synthetic member context for browser-only catalog/menu checks; that fixture and the responsive iframe wrapper are removed before packaging. No fixture credentials or local databases are included in the release.

External OAuth applications are not configured, so real Google/LINE/GitHub/Microsoft/Discord callback flows cannot be verified yet and their buttons remain disabled. There is no connected reset-email service or automatic payment processor. Real inventory, payment instructions and public contact information must come from the owner. These states are explained in the UI instead of being represented as completed integrations.

## Production navigation regression

A real browser click on the Login link reproduced `TypeError: e is not a function` in Vinext's generated Link transition. Direct navigation to `/login` rendered correctly. Store links now use native document navigation through one shared TSX anchor component; the Liquid Glass shortcuts also retain their native anchor behavior. This avoids the failing transition without changing authentication, routes, or layout. Browser verification must click the published Top bar Login button, rather than checking the destination URL alone.

## Email signup and minimal authentication UI

The signup route now renders a real TSX form instead of redirecting to Login. Exactly Google, LINE, GitHub, Microsoft and Discord appear, with unavailable providers disabled. The email-first flow preserves the sanitized destination across Login/Signup links, uses a 10–128 character signup password, retains password whitespace and supports a session-only Login option. New email accounts remain unverified and cannot claim administrator access through an allowlisted email or client role fields.

The built Worker and disposable D1 pass 131 counted assertions, including successful signup, hashed credential persistence, new/existing Login, duplicate rejection, logout and admin-email isolation. Browser QA confirms native Top bar and Signup navigation, password visibility, changing the selected email, and responsive dimensions. A temporary local initial-step override and iframe viewport fixture exposed both layout states without entering credentials; both were removed before the release build. No production accounts were created. OAuth callbacks and mail delivery still require real provider setup.

## Animated editorial landing

References reviewed: https://fastwork.com/ (redirected to /selling), https://www.studyhall.design/ and the published kamucode landing. The refreshed page keeps the original compact top bar, partner banner and closing wordmark, and uses the repository’s existing game art, brand SVGs and original MP4/poster.

Browser checks confirm that the hero renders its headline immediately, the graphic-motion control changes the actual avatar animation to `paused`, the MP4 reaches readyState 4 with no media error and supports manual play/pause, and gallery filters show 6 total / 4 game / 2 source collections. A mobile product link opens `/login?next=%2Fproduct%2Fstorefront`, and the Signup link preserves that destination. Desktop hero and gallery were inspected; 390px and 320px iframe frames show no horizontal content or headline overflow. Temporary viewport QA files were removed before packaging. Reduced-motion handling is implemented in both CSS and the motion/video effects; no browser preference emulation was available. The header’s dark-surface style was corrected so its language selector remains readable over video and the dark statement section.

## KC avatar hero and account update

The new hero was informed by the live Yuusuke page’s full-screen paper-edge layout. Its embedded WebGL scene could not render in the QA browser (`Error creating WebGL context`), so no claim is made that the original live 3D scene or its animation was reproduced. kamucode uses its own generated 3D illustration with CSS motion and pointer/scroll parallax, requiring no WebGL.

The supplied suited-avatar image guided the pose and outfit. A new native SVG KC symbol forms the rendered avatar’s head, with glasses. The original wordmark SVG paths were compared against the previous release across six variants and remain unchanged, and no site font family changed. The avatar is used on the hero, Login and Signup, and both Login and Signup are explicitly linked from the hero. Pointer drag changes the actual CSS offsets; pausing changes the avatar’s animation state to `paused`.

In browser QA, Login fits 1365×631 and 390×844 frames and Signup fits a 320×631 frame with footer at the viewport bottom and no horizontal overflow. The avatar sits outside normal form flow; it does not reduce field sizes or increase form height. Small-screen Home links retain an accessible label when their text is hidden. Temporary QA pages are removed before packaging. Asset provenance and the final prompt are recorded in `docs/HERO_ART.md`.

The revised hero also fits 390px and 320px mobile frames without horizontal overflow; measured copy and avatar regions remain separate. The initial dark header is rechecked after layout changes so the retained top bar renders readable immediately.
