# Previous version 24 motion presentation

The current landing is documented in `LANDING_ARTCRAFT.md`. The sticky/blur composition and measurements below describe version 24, not the current ordinary-flow catalog canvas.

## Reference and direction

The live https://fastwork.com/ redirected to https://fastwork.com/selling during browser review on 2026-11-02. The observed presentation uses portfolio cards around a static center, a changing headline word, outward card movement and a blurred/faded hero during scroll, followed by an expanding showcase. kamucode applies those presentation relationships to its own game/code catalog, Ribbon Star identity, Thai copy and original film. No reference artwork, typeface, client statistics or countdown is copied.

The retained palette is paper `#ffffff`, ink `#17243c`, blue `#3159ec`, mist `#f2f5fa`, source lilac `#eeebfa` and secondary text `#657187`. Existing `var(--font)` and vector wordmark paths stay unchanged. Motion is concentrated in the opening hero and video showcase; the rest of the landing retains its ordinary controls and readable layout.

## Implementation

- `components/ui/playground-hero.tsx`: eight decorative published-catalog cards on desktop; retained 1.85-second logo introduction; unfolding entry; gentle drift; three phrases in a fixed headline window. The H1 has a constant accessible label and hides the decorative word reel from assistive technology.
- `hooks/use-scroll-presentation.ts`: passive native scrolling with one queued animation frame per scene, CSS custom properties and no per-frame React state. Every scroll refreshes scene geometry because a large overlapping sticky region may not cross an IntersectionObserver threshold. Resize, visibility and media-preference listeners/observers are cleaned up.
- `components/ui/scroll-showcase.tsx`: the original poster/MP4 expands into a larger media composition as the next narrative scene. Existing lazy media, manual playback and data-saving behavior remain.
- `components/store/landing.css`: independent layers for entry, drift and outward scroll transforms; sticky stages overlap to avoid an empty handoff. The compact Top bar wrapper gets an explicit stacking level above these layers.

The hero reserves 175svh, with a negative 75svh handoff into the next scene: its effective flow footprint remains one viewport. The video scene reserves 160svh on desktop and 150svh on mobile. Native scrolling is retained; there is no wheel interception, smooth-scroll library or scroll lock. The primary collection action skips directly to collections, while the lower scroll link enters the film.

## Pause, focus and small screens

Pause exposes a readable static headline, stops drift/reel and pauses the existing video. Replay returns to the hero's start before restarting the introduction. Interactive focus returns to the start only while the hero is sticky and its handoff has obscured that control; ordinary mobile flow preserves native focus scrolling. Focusing central actions also ends the intro. Skip immediately exposes the settled composition. Offscreen/hidden scenes pause ambient motion.

Reduced-motion preferences skip the opening, remove pinning and blur/spread/reel effects, retain static content and disable replay. Controlled reduced-motion component props were browser-tested; native preference emulation was unavailable.

At 680px and below, the hero uses ordinary flow with four decorative cards below its copy. On screens at most 700px high, motion controls appear between the primary actions and decorative cards so they remain accessible in the first viewport. Its scroll spread is disabled while ambient drift remains optional. The showcase retains a smaller expansion. Font files, account/auth components, database/API behavior and product delivery flows are unchanged.

## Browser evidence and limits

At 1363×936 in managed preview:

- Opening replay produced a visible overlay with the card entry at opacity 0 and its actual translated/scaled matrix; after completion the overlay was hidden and cards were at opacity 1.
- At scrollY 328, hero progress was 0.4672, its sticky top stayed 0, copy opacity was 0.34592, blur was 4.2048px and the first card moved by approximately -126px/-84px.
- The showcase grew from approximately 920px to 1029px wide as progress advanced from 0 to 0.4167.
- Native media clicks changed Play to Pause after playback started, and back to Play after pausing.
- Source filtering returned two featured source entries; choosing Dashboard UI changed the preview image, heading and product link; the example FAQ expanded with its answer.
- The initial desktop document had no horizontal overflow.

Post-deployment verification on the kamucode domain confirmed the same sticky/blur and expanding-frame values, the native Top bar Login route and its ready email form, and Pause/Resume. Native movie controls also changed to Pause after playback started, then back to Play after pausing. Global Pause set the word animation to `none`, card playback to `paused`, copy opacity to 1 and scene pinning to disabled, with no horizontal overflow. The intermediate heading was then adjusted to finish fading during the first quarter of video progress so it does not remain over the media. Its repeated subtitle was removed to keep clear space above the initial video frame.

An earlier shared-preview session was replaced by a different Site; requests reaching that server are excluded from app verification. A fresh managed preview of this repository was used for the mobile checks below. No unrelated Site or auth/security workaround was introduced.

Actual landing/header components were mounted in temporary 390×844 and 320×631 iframe viewports. Their content/client widths were 375/375px and 305/305px, with no horizontal overflow. All four word-reel rows fit the headline width. The short-screen controls moved from below the first viewport (top 683.47px) to top 400.47px, bottom 444.47px, while retaining 44px touch targets. Native pointer Pause/Resume at scrollY 145 preserved that position and changed the word animation from `kc-word-reel` to `none` and back, with card playback changing from running to paused and back. The collection action focused its heading and source filtering returned two entries.

A separate 390×844 fixture passed `reduced={true}` to the actual hero/showcase components: no intro, no word animation, paused card drift, relative showcase positioning and disabled replay/motion controls. Scrolling the showcase into view left its video source unset and playback paused. This verifies the controlled component path, not physical-device behavior or OS preference emulation. All temporary QA entry/HTML files are removed before packaging.
