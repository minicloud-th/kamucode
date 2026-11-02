# Ribbon Star identity and opening

The primary kamucode symbol combines two curved, translucent ribbons with a cyan/blue back surface, a purple/pink front surface and white reflective seams. It is authored as native vector paths, informed by the two user-supplied wave/glass-star reference images. Reference screenshots are not embedded in the site.

## Canonical source and files

- `lib/brand-symbol.mjs`: shared geometry, colors, gradients and SVG serialization.
- `components/ui/brand-symbol.tsx`: React SVG renderer with unique gradient IDs.
- `components/ui/brand-intro.tsx`: decorative mark, existing wordmark and tagline.
- `components/ui/playground-hero.tsx`: current landing introduction, timer, skip/replay and pause behavior.
- `components/store/landing.css`: current landing ribbon assembly and collage/copy reveal.
- `components/ui/orbital-gallery-hero.tsx`: opening state, timer, skip/replay and shared orbit playback.
- `components/ui/orbital-gallery-hero.css`: ribbon assembly, edge reveal and page fade animations.
- `scripts/refresh-brand-assets.mjs`: rebuilds SVG variants, favicon and the light/dark identity board.

The script retains the existing gradient definitions and the complete original wordmark group when replacing the symbol. Its symbol-definitions block is marked so repeated regeneration does not duplicate definitions. The original typeface and glyph paths are unchanged.

## Exports

| Files under `public/assets/brand` | Use |
| --- | --- |
| `mark.svg`, `logo.svg` | Color symbol and logo on light backgrounds |
| `mark-dark.svg`, `logo-dark.svg` | Color artwork with light edges for dark backgrounds |
| `logo-mono.svg`, `logo-white.svg` | Flat monochrome variants |
| Matching six `.png` files | Transparent exports: marks 1024×1024, logos 2520×384 |
| `mark-preview.png` | Transparent 384×384 review/export image |
| `identity-preview.svg` | Current light/dark identity board |
| `kamucode-brand-kit.zip` | Current SVG/PNG exports, favicon and README |

`public/favicon.svg` uses the same symbol, with a light outline adjustment for dark browser themes. The older KC monogram remains a secondary identity for the existing suited account mascot; it is retained in `kc-monogram.svg` and does not replace the new primary mark. Standalone wordmark SVG and PNG exports are retained unchanged.

PNG exports are rasterized from the native SVG with Sharp. The brand ZIP contains only public artwork and a README and uses fixed entry timestamps for reproducibility.

## Current landing opening

The Playground hero renders the same canonical `BrandSymbol` and retained wordmark. Its first client frame starts a 1.85-second ribbon assembly; the catalog collage and headline fade in during the final part of that sequence, then enter the current drift and native-scroll presentation. Skip, pause or reduced motion reveal the complete composition. Replay restarts the CSS sequence and deliberately resumes motion if paused. Focusing a central hero link ends the intro so the focused control stays visible; interactive hero focus returns to its start when an overlapping scene has obscured it. Timers and the initialization frame are cleaned up on unmount; reduced motion is checked both by the parent media listener and directly before the intro starts.

## Standalone orbital opening

The first client frame starts a 1.85-second introduction when enabled and motion is allowed. The back and front ribbons assemble from opposite directions, reflective edges reveal, and the unchanged wordmark appears. The gallery and text fade in before the opening ends. The ordinary 35-second orbital animation starts after completion.

- Skip finishes the opening immediately.
- Replay resets the orbit and replays the opening; a deliberate replay resumes shared motion if paused.
- Pause during opening reveals the page and ends the opening; subsequent Resume runs the orbit.
- Reduced motion skips opening and disables replay/animation controls.
- `intro={false}` keeps the standalone gallery behavior with cycle restart.
- Timers, animation playback and listeners are cleaned up on unmount.

The overlay is `aria-hidden`, does not intercept pointer input and does not lock scrolling. The server-rendered page is visible before hydration and remains usable without JavaScript. Live browser verification remains limited as recorded in `docs/VERIFICATION.md`.
