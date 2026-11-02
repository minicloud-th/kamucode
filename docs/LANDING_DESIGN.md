# kamucode digital playground

## Brief and design decision

Rebuild the whole landing using Frontend Design while preserving the established typeface, kamucode lettering, Ribbon Star identity, original compact Top bar, native navigation and existing full-stack account/store flows.

The first plan was a product-focused collage around a static headline, followed by discovery, film, source exploration, purchase guidance and partner/support paths. Reviewing it against the brief removed the old stock-photo orbit, repeated ticker, generic manifesto and repeated section entrance effects. The current hero uses actual catalog artwork and one coordinated logo/collage reveal. Motion 14.9.0 and the earlier orbital component remain available for standalone embeds.

## Tokens

| Role | Value |
| --- | --- |
| Paper | `#ffffff` |
| Ink | `#17243c` |
| Blue | `#3159ec` |
| Mist | `#f2f5fa` |
| Source preview lilac | `#eeebfa` |
| Secondary text | `#657187` |

Use the existing `var(--font)` stack without adding fonts. H1 is centered within a clear middle zone; other headings and body text align left. Display sizes scale down on small screens, with relaxed Thai line-height. The collage moves below the copy on mobile and displays four decorative artworks; the full six featured items remain in the collection section. See `MOTION_PRESENTATION.md` for the newer scroll handoff, ambient drift and video expansion.

## Page and interactions

1. `PlaygroundHero`: up to eight catalog artworks, an accessible constant H1 with a decorative word reel, native collection/login or account actions, Ribbon Star opening, replay/skip and shared motion control.
2. Three category shortcuts to games, source code and partners.
3. Six featured published catalog items with all/game/source filtering. Demo entries retain explicit example labels; real entries use their actual price. Custom product images are preserved, and curated artwork maps only to matching default catalog assets.
4. Existing poster/MP4 in a navy split section, with the existing lazy-load, visibility, data-saving and manual playback behavior.
5. Up to four source entries selectable with accessible pressed buttons, updating the illustration, title, technology and native detail link. The entire section is omitted when no source entries are published.
6. Three actual purchase steps: account, selection and confirmed delivery.
7. Partner invitation with the canonical vector identity.
8. Four native FAQ disclosures; no invented payment, OAuth or instant-delivery capability.
9. Blue closing section with retained SVG lettering, login/shop action, signup link for guests and return-to-top anchor.

Anchors retain native navigation, including the existing server login return destinations. Collection scrolling moves keyboard focus to the section heading. Empty filtered results have an explicit reset. FAQ works without JavaScript. Product/server data is rendered as text by React.

## Motion and scope

The first client frame starts a 1.85-second CSS intro only when motion is allowed. The ribbons assemble and their edges reveal, then the copy and collage enter together. The settled hero adds optional ambient drift and an outward scroll handoff into the film. Skip/pause ends the intro; replay starts it again. Keyboard focus on the central links ends the intro. Reduced-motion CSS and the live media preference listener expose the final composition and disable replay. No focus trap, pointer interception or scroll lock is added. The global motion toggle also pauses the existing video.

All styling is scoped to `kc-*` landing classes, apart from the retained dark-surface Top bar rule. Authentication, database/API behavior, product/account/admin pages, fonts, brand assets and shared header/footer source are unchanged.

The release uses source/asset inspection, TypeScript, the production build and the existing disposable Worker/D1 suite. Browser access is available again for the current motion pass: desktop intro, scroll transforms, video playback and discovery controls were checked. Actual evidence and remaining viewport/emulation limits are recorded in `MOTION_PRESENTATION.md`.
