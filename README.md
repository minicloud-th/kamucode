# kamucode

Thai storefront for game accounts and source code. The ribbon symbol, rounded outlined wordmark and banner are original vector assets; retrieved game imagery is credited in reference/image-credits.json. The catalogue remains illustrative: no inventory, prices, orders or payments are invented.

## Pages and behavior

The root URL always opens the original landing at /welcome/, including its full collection, principles, partner and closing sections. Its floating top bar has exactly the original brand, language selector and one membership button. Public pages retain this small top bar. Authenticated store pages add five Liquid Glass shortcuts and a page search dialog (Ctrl/Cmd+K); mobile keeps labels visible. Signup uses name, email and password; after account creation the member record is created and the visitor enters /shop/ immediately.

Dedicated routes cover games, source code, each product, partners, account settings, saved items, orders, support, privacy, terms, security and the sitemap. Store, product and membership documents are bundled into the Worker and served only after checking authentication and the D1 member record. They are absent from public assets. Visitors without a session go to login; identities without membership go to signup. The landing, authentication, help and legal pages remain available within the existing Site audience. The order page displays an honest empty state. Search and category filters work without replacing the whole page.

Members can edit their display name, save/remove products, submit a partner application, review its status, submit support requests, and export their own data. Guest support is available for account and privacy questions. Support submissions are database records; they do not trigger an email. There is no admin review dashboard yet.

## Authentication

Better Auth runs in the Worker against D1 with the Drizzle adapter. Email/password signup and login are implemented with password hashing, HTTP-only session cookies, server-side logout, rate limits and origin checks. Email verification and self-service password-reset mail are not configured; the UI and security page say so.

Google, Discord, LINE, GitHub, Microsoft and GitLab adapters are implemented. Each button enables only when the matching client ID and client secret exist. No social provider is configured in production yet. See AUTH_SETUP.md. Framework use does not require a paid authentication subscription; external provider policies and quotas still apply.

The existing dispatch-owned ChatGPT identity and Site audience remain intact. Application accounts do not override the Site's outer access gate. Changing the Site audience requires a separate explicit request.

## Source and validation

- public/site.css and public/site.js: member pages, forms and shared interactions.
- public/landing.css, public/landing.js and public/topbar.js: restored landing, original motion and compact top bar.
- generated/store-pages/ and app/[...store]/route.ts: member documents and server access checks.
- scripts/build-site-pages.py: reproducible HTML and brand assets.
- reference/landing-original.html: the complete accepted landing from version 2, retained as the rebuild reference.
- app/, lib/, db/, drizzle/: authenticated APIs, identity, schema and additive migrations.
- .env.example: names of supported runtime settings; real secrets belong in Sites environment settings.

Use the managed Sites preview/build workflow. Checks:

    node --check public/site.js
    python3 scripts/check-kamucode.py
    npx tsc --noEmit
    node scripts/test-member-flow.mjs

The integration check runs the built Worker with a disposable in-memory database. It covers native and email signup, login/logout, password hashing, session-cookie attributes, provider availability, forms, exports, saved items, cross-origin rejection, account isolation, guest/member route access, public top-bar shape, authenticated shortcuts, and complete landing sections. Test users are never sent to production.

## Brand assets

The shared identity uses a curved split symbol and custom round letterforms with a blue-to-cyan gradient. All lettering is stored as vector paths. Light, dark and single-color variants are in public/assets/brand/. The landing and original top-bar structure are preserved; member shortcuts still require sign-in.

To rebuild the identity and pages, run python3 scripts/build-site-pages.py, then node scripts/export-brand.mjs to rasterize transparent PNGs and rebuild the downloadable brand kit. The exported kit contains only logo assets, with no game artwork or account data.
