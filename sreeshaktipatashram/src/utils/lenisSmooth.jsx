import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export default function useLenisSmooth() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1 - Math.pow(1 - t, 3)),
      smooth: true,
      direction: "vertical",
      gestureDirection: "vertical",
      infinite: false,
      touchMultiplier: 2,
      wheelMultiplier: 1,
    });

    // ✅ Expose Lenis instance globally for components to access
    window.__lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    // ✅ Observe DOM changes and update Lenis boundaries
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });

    resizeObserver.observe(document.body);

    // ✅ Also listen for manual resize events
    const handleResize = () => {
      lenis.resize();
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      delete window.__lenis;
    };
  }, []);
}