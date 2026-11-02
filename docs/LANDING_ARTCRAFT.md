# Artcraft × Fastwork landing

Direction: an open catalog workspace for people exploring game accounts and source code. Retain kamucode's existing vector lettering, Ribbon Star, font stack, compact Top bar and full-stack flows.

## Design decisions

- Paper #ffffff, ink #17243c, blue #3159ec, mist #f2f5fa, source lilac #ebe8fa, secondary text #66748a.
- Existing `var(--font)` throughout. Large left-aligned Thai heading, compact supporting copy and native account links.
- Artcraft reference: large purposeful type, open workspace imagery and a clear progression from an introduction into specific tools. Fastwork reference: tangible portfolio images, restrained card depth and a coordinated opening.
- Revision after review: replace the previous surrounding-card/sticky-hero composition with one framed interactive canvas, rather than repeating the old hero with different colors. Keep other sections still, use unequal featured-product layouts, and omit countdowns, fake statistics and invented customer reviews.
- Read the actual websites at https://getartcraft.com/ and https://fastwork.com/ (redirected to /selling). Their layouts and animations are references, not copied code or artwork.

## Implementation

The hero's game/source switch changes the actual catalog image, caption, product link and category destination. Three catalog surfaces enter together after a 1.85-second Ribbon Star introduction. Native scrolling stays ordinary: no overlapping sticky scenes, copy blur, or wheel interception. Pause stops ambient drift and the original film. Replay is explicit; focus and reading do not force a return to the top. Offscreen and hidden hero motion pauses through the existing hook.

The collection filter, selected code preview, original poster/MP4, order steps, partner route, native FAQ and account links remain connected to their existing data and routes. Known default images map to local game/code artwork; custom product images are retained. Demo products are labelled as examples and have no invented prices or stock.

Reduced-motion preferences skip the opening and disable decorative animation; media retains manual controls. The public site's audience, identity, fonts, assets and database/API configuration stay unchanged.
