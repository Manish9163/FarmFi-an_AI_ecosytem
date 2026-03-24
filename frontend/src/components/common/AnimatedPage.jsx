import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function AnimatedPage({ children }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Page entrance
      gsap.fromTo(el,
        { opacity: 0, y: 18, scale: 0.995 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out', clearProps: 'all' }
      );

      // Page header
      const pageHeader = el.querySelector('.page-header');
      if (pageHeader) {
        gsap.fromTo(pageHeader,
          { opacity: 0, x: -12 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', delay: 0.1, clearProps: 'all' }
        );
      }

      // Stat cards — staggered scale-in
      const statCards = Array.from(el.querySelectorAll('.stat-card'));
      if (statCards.length > 0) {
        gsap.fromTo(statCards,
          { opacity: 0, y: 20, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.45, stagger: 0.06,
            ease: 'back.out(1.4)', delay: 0.15, clearProps: 'all'
          }
        );
      }

      // Cards — fadeInUp with stagger
      const cards = Array.from(el.querySelectorAll('.card'));
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { opacity: 0, y: 24 },
          {
            opacity: 1, y: 0,
            duration: 0.5, stagger: 0.08,
            ease: 'power2.out', delay: 0.2, clearProps: 'all'
          }
        );
      }

      // Buttons — subtle entrance
      const buttons = Array.from(el.querySelectorAll('.btn'));
      if (buttons.length > 0) {
        gsap.fromTo(buttons,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.3, stagger: 0.04,
            delay: 0.35, clearProps: 'all'
          }
        );
      }

      // Tables — slide in
      const tables = Array.from(el.querySelectorAll('.table-wrap'));
      if (tables.length > 0) {
        gsap.fromTo(tables,
          { opacity: 0, y: 12 },
          {
            opacity: 1, y: 0,
            duration: 0.45, stagger: 0.1,
            ease: 'power2.out', delay: 0.3, clearProps: 'all'
          }
        );
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} style={{ willChange: 'opacity, transform' }}>
      {children}
    </div>
  );
}
