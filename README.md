# kamucode

A Thai, full-stack digital storefront built with React TSX, Vinext, Cloudflare Workers, D1, Drizzle and Better Auth. All application screens are App Router TSX routes. There are no authored HTML storefront pages or copied Fastwork theme files in the runtime.

## Experience

The landing uses the supplied orbital gallery concept through `components/ui/orbital-gallery-hero.tsx`, with Motion 14.9.0. Ten decorative photos rotate around static kamucode copy over a 35-second cycle; a shared motion value counter-rotates every image so it stays upright. CSS-sized elliptical radii adapt to the viewport, and playback pauses when requested, offscreen, in a hidden tab or under reduced-motion preferences. Five verified Unsplash photos are bundled locally and repeated twice, so the existing self-only image policy stays intact. Login/shop and collection actions use existing routes. The original top bar, typeface, account pages and lower landing sections remain. The standalone example, props, asset credits and integration details are in `docs/ORBITAL_GALLERY.md`.

Member store pages retain five Liquid Glass shortcuts and search below the compact bar. The avatar dropdown keeps account, cart, orders, digital library, saved items, notifications and security available; admin navigation appears only for an authorized owner.

## Routes

| Area | TSX URLs |
| --- | --- |
| Landing and discovery | `/`, `/welcome`, `/collections`, `/showcase` |
| Catalog | `/shop`, `/games`, `/source-code`, `/product/[slug]`, `/saved` |
| Purchase | `/cart`, `/checkout`, `/orders`, `/orders/[id]`, `/downloads` |
| Account | `/login`, `/signup`, `/account`, `/account/security`, `/notifications` |
| Partner | `/partners`, `/partners/apply`, `/partners/dashboard` |
| Help | `/support`, `/support/tickets`, `/support/tickets/[id]`, `/faq`, `/contact`, `/how-it-works` |
| Information | `/about`, `/privacy`, `/terms`, `/security`, `/sitemap` |
| Recovery | `/forgot-password`, `/reset-password` |
| Administration | `/admin`, `/admin/products`, `/admin/orders`, `/admin/support`, `/admin/partners`, `/admin/settings` |

Authentication completion routes handle native/provider returns. Legacy `.html` URLs redirect to their current equivalents. Unknown URLs and inaccessible order/ticket records return an actual 404. User data and store/admin pages are protected at the server boundary, including API access.

## Working workflows

- Email signup and login automatically complete the member record. The white, full-page authentication UI combines five compact provider tiles with an email-first flow, floating field labels, password visibility, and optional remembered login. Signup records an unverified email and cannot obtain admin rights by supplying an allowlisted address. Existing native ChatGPT sessions and callbacks remain supported.
- Profile name and private avatar uploads, saved products, database-backed cart, notifications and personal JSON export.
- Product management, encrypted digital inventory, server-priced one-item orders, atomic stock reservations, cancellation/stock release, manual payment review and private delivery after confirmation.
- Member/guest support inbox, persisted admin responses, user ticket history, partner submissions, admin approval/rejection and member notifications.
- Server-only admin allowlists (`ADMIN_USER_IDS`, or verified `ADMIN_EMAILS`). No client role field grants access.

Default catalog entries are clearly marked examples. They cannot be purchased. No prices, stock, orders, reviews or sales are fabricated. An owner must create a real product, set its price, add stock they are authorized to sell, turn off its demo flag, publish it and set payment instructions before checkout accepts orders. One stock item is reserved per order until paid or cancelled. Pending reservations do not expire automatically; admins can cancel stale orders after checking for payment.

Payment review is manual. This project does not charge a card, verify a bank transfer, or send automatic email. A confirmed payment opens the reserved delivery to its buyer; this operation must follow a real bank/provider check. Partner approval records an application outcome and does not grant catalog-admin access or create a seller payout system.

## Runtime configuration

Secrets live in Sites runtime settings, never Git. See `.env.example` and `AUTH_SETUP.md` for names. Preserve `BETTER_AUTH_SECRET`: it signs sessions and derives the inventory encryption key. Rotating it requires an explicit encrypted-inventory migration and session plan.

The Site owner's verified identity is configured separately as an admin. Provider buttons stay disabled until their OAuth client credentials are supplied and tested. Email accounts can sign in, but self-service reset/verification mail is not connected; recovery pages direct users to provider recovery or the support process without claiming an email was sent.

## Code map

- `app/`: explicit TSX pages, route metadata, 404/error UI and API adapters.
- `components/store/`: React UI, forms, banner media, catalog and store/admin screens.
- `components/ui/liquid-glass-navbar.tsx`, `liquid-glass-logo-reveal.tsx`: supplied glass components adapted for kamucode, reduced motion and visibility cleanup.
- `lib/store-page.tsx`: shared server guards and route rendering.
- `lib/commerce/`: D1 workflows, catalog, encryption, role checks and session projections.
- `db/schema.ts`, `drizzle/`: additive schema and migration metadata; production schema is applied by Sites before the Worker is uploaded.
- `worker/index.ts`: security headers and nonce-based script CSP.
- `public/assets/brand/`, `public/assets/catalog/`, `public/assets/code/`, `public/media/`: brand assets, original illustrations, image and silent motion banner.

## Validate

Use the managed Sites preview/build workflow, or the provided npm scripts for standalone work:

```sh
npx tsc --noEmit
npm run build
npm test
```

The integration suite exercises the built production Worker and a disposable D1 database. It checks public/member/admin SSR routes, real 404s, CSP nonces, same-origin writes, actual byte limits, cookie/identity isolation, email signup/login/logout, provider status, unverified admin-email isolation, concurrent last-item reservations, price tampering, encrypted delivery, paid/cancelled state transitions, ownership, support limits/replies, partner review and notifications. It never creates production test accounts or sends money/email.

Local D1 migrations run separately from requests. After a build creates the Wrangler config, apply only pending SQL files in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_gray_selene.sql
```

A fresh local DB also needs `0000` and `0001` first. Do not replay applied migrations. Do not commit local SQLite files, environment values, generated builds or temporary QA routes.
