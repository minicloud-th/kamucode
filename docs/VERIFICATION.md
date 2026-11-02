# Release verification — TSX storefront

## Current: Fastwork-inspired native-scroll presentation

Live browser review of Fastwork informed the two coordinated scenes described in `MOTION_PRESENTATION.md`. Managed-preview checks observed actual intro states, outward card transforms, sticky hero position, copy blur/fade, video-frame expansion, native media Play/Pause, collection filtering, source-preview switching and FAQ disclosure at 1363×936. Replay returns to the start; manual pause settles the word reel so it cannot freeze between clipped phrases. A passive RAF helper refreshes both scenes on scroll, including entry into a large overlapping region that may not cross an IO threshold.

The shared managed preview URL was later replaced by a different Site, so cold Login and temporary mobile-fixture requests from that point are excluded. Published Login on the unchanged baseline opened normally; the final built-Worker suite and post-deployment native check cover the actual app. No unrelated Site or auth/security workaround was introduced. Mobile viewport and reduced-motion preference emulation remain unverified; their CSS and lifecycle paths are reviewed. The temporary fixture is removed. The previous quota limitation below is historical; desktop browser observation is available for this pass.

Final source validation runs TypeScript, the production build and the existing 131-assertion disposable Worker/D1 suite. No production accounts, support tickets, inventory or payment actions are created for QA.

## Previous version 21: full Playground landing redesign

The entire landing composition now uses `components/store/landing.tsx`, scoped `landing.css` and the new `components/ui/playground-hero.tsx`. It preserves the canonical logo, unchanged fonts/lettering, compact Top bar and native full-stack routes. The page includes catalog collage, filterable selections, original film, selectable source previews, purchase steps, partner invitation, four native FAQ disclosures and the closing CTA. Default catalog artwork is mapped only for known IDs with matching default paths; arbitrary product IDs retain their valid supplied image instead of generating a nonexistent code asset.

The release runs TypeScript, the production build and the existing disposable Worker/D1 integration suite. Only the two superseded headline checks in the existing landing smoke test change; auth, ownership, delivery, reservation and API assertions remain. Asset paths, internal section anchors, unique IDs and native account links are inspected separately. No production accounts, tickets, inventory or payment actions are created for QA.

The 1.85-second CSS intro coordinates the existing ribbon symbol with copy/collage reveal. Skip and pause expose the final composition, replay resets the sequence, and focusing central links ends the opening. Reduced motion skips the opening through both CSS and the live media preference. These interaction and responsive-layout behaviors are code-reviewed, not browser-observed: the earlier browser automatic approval review denied page observation because the usage quota was exhausted. No alternate browser surface was used to bypass that denial. Earlier visual checks below describe superseded versions and do not verify this redesign.

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

## Previous release: KC avatar hero and account update

The new hero was informed by the live Yuusuke page’s full-screen paper-edge layout. Its embedded WebGL scene could not render in the QA browser (`Error creating WebGL context`), so no claim is made that the original live 3D scene or its animation was reproduced. kamucode uses its own generated 3D illustration with CSS motion and pointer/scroll parallax, requiring no WebGL.

The supplied suited-avatar image guided the pose and outfit. A new native SVG KC symbol forms the rendered avatar’s head, with glasses. The original wordmark SVG paths were compared against the previous release across six variants and remain unchanged, and no site font family changed. The avatar is used on the hero, Login and Signup, and both Login and Signup are explicitly linked from the hero. Pointer drag changes the actual CSS offsets; pausing changes the avatar’s animation state to `paused`.

In browser QA, Login fits 1365×631 and 390×844 frames and Signup fits a 320×631 frame with footer at the viewport bottom and no horizontal overflow. The avatar sits outside normal form flow; it does not reduce field sizes or increase form height. Small-screen Home links retain an accessible label when their text is hidden. Temporary QA pages are removed before packaging. Asset provenance and the final prompt are recorded in `docs/HERO_ART.md`.

The revised hero also fits 390px and 320px mobile frames without horizontal overflow; measured copy and avatar regions remain separate. The initial dark header is rechecked after layout changes so the retained top bar renders readable immediately.

## Previous release: white orbit hero and logo opening

The supplied Superpower screenshot guides the white composition with tilted collection imagery around centered copy. The supplied logo collage guides an original SVG orbit-and-spark emblem. Six primary SVG logo variants and the light/dark-aware favicon use the new symbol; the original wordmark paths were compared byte-for-byte across four composite and two standalone variants. The earlier KC mascot monogram is retained separately for the Login/Signup avatar.

The hero links eight existing products on desktop and displays six on mobile. A two-second opening rotates the emblem, spreads the images outward and reveals the headline. Browser checks confirm replay starts the actual logo/tile/copy animations, Skip restores full opacity, and pausing during the opening immediately reveals the copy while floating animations become paused. Resuming does not automatically restart the opening. Reduced-motion CSS and media-query handling show the final composition directly; browser preference emulation was unavailable.

Responsive iframe checks at 1365×631, 390×844 and 320×631 show no horizontal overflow and keep the central copy separate from the collection images. The short desktop layout lowers the first row below the retained header. The header starts in its light style and still detects lower dark sections. The original film, gallery filters, partner banner, closing wordmark and native account navigation remain in place. Temporary viewport QA files are removed before packaging.

## Previous release: asymmetric presentation revision

The supplied Superpower image and sampled frames from the supplied Fastwork recording guide this revision. Ten images now combine portrait, square and landscape formats at different sizes. The central three-line headline uses the existing typeface at a lighter weight, with compact text actions. The original logo, top bar, account pages and lower landing sections are retained.

Browser layout checks covered 1365×631, 800×631, 390×844 and 320×631 frames. The measured desktop/tablet image rectangles have no pairwise overlap after positioning adjustments, and none of the tested frames has horizontal overflow. On the short desktop, the first image starts below the header and the last image ends within the 631px hero. All ten images remain present on mobile.

Replay activates the actual emblem and perspective-entry animations. Pausing during the introduction reveals the copy at full opacity and pauses image floating. Pointer motion changes image offsets at different depths. At scroll progress 0.25, the first image travels by -49px/-38.75px and copy opacity becomes 0.55; scrolling remains native. Reduced-motion handling is implemented in CSS and the effects, but browser preference emulation was unavailable.

The film tile starts scrolling toward the existing video section. Its final playback/pause check could not finish: browser automatic approval review denied page observation because the usage quota was exhausted. No successful playback result is claimed for this revision. The final code change replaces an image wrapper with a block-level span to keep the film button's markup valid; it does not change the measured dimensions. Temporary responsive QA pages are removed before the release build. TypeScript, the production build and the disposable Worker/D1 integration suite validate the final source before publication.

## Previous release: height-scaled reference composition

This revision rebuilds the hero layout around the supplied reference positions. The stage uses the full hero height, images scale primarily with that height, and the four upper images have an explicit header-clearance floor. Flat image rotations replace the earlier perspective treatment. A compact three-line headline and single supporting sentence keep the center open. Mobile retains ten images with its own positions and width-based sizes.

The emblem appears first and images enter from the outer edges with staggered timing, rather than spreading from the center. Pointer movement, floating and scroll travel are smaller. The copy's scroll opacity has a 0.4 floor. Existing skip/replay/pause controls, reduced-motion handling, account links and the film-section action remain.

This final layout has not been rechecked in the browser. The previous browser observation was denied by automatic approval review because the usage quota was exhausted; no alternate browser surface or automation was used to bypass that denial. Prior viewport measurements above describe earlier releases, not this layout. Release checks use TypeScript, the production build and the disposable Worker/D1 integration suite. Video playback remains outside this revision's verified results.

## Previous release: Motion orbital gallery integration

The supplied React component is integrated at `components/ui/orbital-gallery-hero.tsx`, with a standalone `demo.tsx` and scoped CSS. Existing shadcn aliases, Tailwind v4 and TypeScript are reused. Motion 14.9.0 is installed and locked; no additional context provider is needed. The earlier custom immersive hero and its layout CSS import are removed.

A shared motion value drives a 35-second clockwise orbit. Each image's position follows the responsive ellipse, while paired positive/negative rotations preserve its orientation. The component supports controlled pause from Landing, standalone local pause, cycle restart, reduced-motion preferences, offscreen pause and tab-visibility pause. Static content links to Login/shop and collections. The former generic AI-generator claims are replaced with existing kamucode functions.

All five local Unsplash WebP files were decoded with Sharp and verified as 640×420 images; their combined source size is 193,092 bytes. The same five files are reused for ten orbit positions. No external image host or additional CSP allowance is required. TypeScript passed after component integration. Final release validation uses the production build and disposable Worker/D1 suite.

Browser animation, responsive layout and playback controls have not been reverified for this revision. Earlier browser automatic approval review denied page observation because of the usage quota; no alternate browser automation was used to bypass that denial. Previous browser screenshots and viewport measurements are not evidence for this new Motion component.

## Ribbon Star logo and brand introduction

The user's rounded-wave and glass-star images guide a new native SVG symbol. `lib/brand-symbol.mjs` provides the shared paths and gradients for static assets and the React introduction. The six runtime SVG variants, six matching transparent PNGs, favicon, identity board and downloadable brand kit use the same symbol. Existing wordmark suffixes were compared against the prior source in four composite SVGs, while the two standalone wordmark SVGs and two wordmark PNGs remain byte-identical.

The introduction assembles the ribbon surfaces and highlights, reveals the existing wordmark, then starts the 35-second gallery. Its timer is 1.85 seconds, with cleanup on unmount. Skip ends it immediately. Replay resets gallery phase and repeats it. Pausing during the introduction or switching to reduced motion reveals the page immediately and ends the introduction. The server-rendered initial state is visible, and the decorative overlay does not intercept input or lock scrolling. The favicon URL has a revision query so browser tabs can request the new artwork.

TypeScript passed after integration. Native SVG rasterization checks the logo appearance; release checks validate SVG references, retained lettering, PNG dimensions, kit contents, the production build and the Worker/D1 integration suite. Browser timing, replay/skip interactions and reduced-motion behavior have not been observed for this revision because the earlier browser approval review was quota-blocked. The static logo render is evidence for the artwork only, not a browser screenshot or proof of animation playback.
