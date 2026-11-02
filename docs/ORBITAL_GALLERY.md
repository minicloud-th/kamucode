# Orbital gallery hero

The supplied React gallery is adapted for kamucode and used directly by `components/store/landing.tsx`.

## Structure and installation

- Component: `components/ui/orbital-gallery-hero.tsx` (named and default `HeroSection` export).
- Component styles: `components/ui/orbital-gallery-hero.css`, imported by the component.
- Standalone demo: `components/ui/demo.tsx`.
- Global Tailwind import and existing typeface: `app/globals.css`.
- Existing shadcn config: `components.json`; `@/components/ui` resolves to the standard UI folder.
- Dependency: `motion` 14.9.0, recorded in `package.json` and `package-lock.json`.

No shadcn scaffolding, Tailwind migration, new provider or new authentication system is required. The component uses the existing Tailwind layout utilities and scoped brand styles, avoiding changes to global color variables. Native anchors preserve the store's document-navigation behavior.

On another compatible checkout, `npm ci` installs the locked dependencies. To add this dependency to a separate existing React project, use `npm install motion`.

```tsx
import GalleryHero from "@/components/ui/orbital-gallery-hero";

export default function Demo() {
  return <div className="w-full h-screen"><GalleryHero /></div>;
}
```

## Props and state

| Prop | Default | Purpose |
| --- | --- | --- |
| `images` | Five local stock photos repeated twice | Decorative gallery sources; no product inventory claims |
| `duration` | `35` | Seconds per full rotation; invalid/nonpositive values use 35 |
| `className` | Empty | Additional wrapper classes |
| `authenticated` | `false` | Primary action links to `/login` or `/shop` |
| `paused` | Uncontrolled | Parent-owned pause state; pass `onToggleMotion` with it |
| `reduced` | `false` | Parent's reduced-motion state; device preference is also respected |
| `onToggleMotion` | Local state when uncontrolled | Toggle the parent's shared motion state |
| `onExplore` | Native `/collections` link | Landing uses it to scroll to the existing collection section |

The orbit angle is a Motion value, so animation frames do not re-render React. A shared angle and its negative keep the image rotation synchronized. CSS variables size the ellipse and cards without restarting the orbit on resize. The fixed 500px radii from the example are replaced so the ellipse can adapt to short screens and mobile. The feature row is hidden on mobile/short screens; the existing lower landing content retains the detailed introduction.

Playback is paused when offscreen or in a hidden tab. Pausing/resuming preserves phase. Restart scrubs the current cycle to its beginning. Reduced motion leaves a static gallery and disables the animation controls. Photos are decorative, excluded from the accessibility tree and do not intercept pointer input; central content and controls remain keyboard accessible.

## Image provenance

Downloaded from Unsplash's image CDN as 640×420 WebP, `fit=crop`, quality 80. Files are local under `public/assets/orbital`, so the Worker CSP remains unchanged. These are illustrative stock photos, not screenshots of delivered products.

| File | Credit / verified source |
| --- | --- |
| `gaming-desk.webp` | Kenny Kennethh — https://unsplash.com/photos/a-video-game-controller-and-a-laptop-wxidqefqj3w |
| `controller.webp` | Sam Pak — https://unsplash.com/photos/person-holding-black-game-controller-X6QffKLwyoQ |
| `developer.webp` | Compagnons — https://unsplash.com/photos/woman-working-on-a-laptop-with-code-on-screen-Zi0GmYPm88M |
| `design.webp` | Balázs Kétyi — https://unsplash.com/photos/person-drawing-sketch-on-tablet-KvoMDHvCttg |
| `code.webp` | Unsplash direct source — https://images.unsplash.com/photo-1515879218367-8466d910aaa4 |

The direct code image was verified by a successful CDN download and image decoding; no photographer attribution is inferred for it. License reference: https://unsplash.com/license.

## Motion references

- https://motion.dev/docs/react-motion-value
- https://motion.dev/docs/react-use-transform
- https://motion.dev/docs/animate

See `docs/VERIFICATION.md` for the actual checks and browser-verification limit.
