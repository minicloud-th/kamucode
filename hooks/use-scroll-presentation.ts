'use client';

import {useEffect, type RefObject} from 'react';

/** Native scroll only: one queued frame, no React updates on scroll. */
export function useScrollPresentation(ref: RefObject<HTMLElement | null>, enabled: boolean) {
    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const preference = matchMedia('(prefers-reduced-motion: reduce)');
        let frame = 0;
        let visible = false;
        let previous = -1;

        function update() {
            frame = 0;
            if (!element) return;
            const bounds = element.getBoundingClientRect();
            visible = bounds.bottom > 0 && bounds.top < innerHeight;
            const allow = enabled && !preference.matches;
            element.dataset.sceneMotion = String(allow && visible && !document.hidden);
            const distance = bounds.height - innerHeight;
            const progress = allow && distance >= 80 ? Math.max(0, Math.min(1, -bounds.top / distance)) : 0;
            if (Math.abs(progress - previous) > .0005) {
                element.style.setProperty('--scene-progress', progress.toFixed(4));
                previous = progress;
            }
        }

        function queue() {if (!frame) frame = requestAnimationFrame(update);}
        // A large overlapping sticky section may not cross an IO threshold.
        // Queue both scenes so entering it always refreshes geometry/visibility.
        function scroll() {queue();}
        element.dataset.sceneReady = 'true';
        update();
        const observer = new IntersectionObserver(queue, {threshold: 0});
        const resize = new ResizeObserver(queue);
        observer.observe(element);
        resize.observe(element);
        addEventListener('scroll', scroll, {passive: true});
        addEventListener('resize', queue, {passive: true});
        document.addEventListener('visibilitychange', queue);
        preference.addEventListener('change', queue);
        return () => {
            observer.disconnect();
            resize.disconnect();
            cancelAnimationFrame(frame);
            removeEventListener('scroll', scroll);
            removeEventListener('resize', queue);
            document.removeEventListener('visibilitychange', queue);
            preference.removeEventListener('change', queue);
            delete element.dataset.sceneReady;
            delete element.dataset.sceneMotion;
            element.style.removeProperty('--scene-progress');
        };
    }, [ref, enabled]);
}
