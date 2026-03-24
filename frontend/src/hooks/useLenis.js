import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);


export function useLenis() {
  useEffect(() => {
    if (window.innerWidth <= 768) {
      return; 
    }

    const lenis = new Lenis({
      duration:      1.2,
      easing:        (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel:   true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    function onTick(time) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);
}
