import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export default function useLenisSmooth() {
  useEffect(() => {
    const wrapper = document.getElementById("app-scroll");
    const content = wrapper?.firstElementChild || wrapper || undefined;
    const prevOverflow = wrapper?.style.overflow;
    const prevHeight = wrapper?.style.height;
    const prevPosition = wrapper?.style.position;

    if (wrapper) {
      wrapper.style.overflow = "hidden";
      wrapper.style.height = "100%";
      if (!wrapper.style.position) wrapper.style.position = "relative";
    }

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1 - Math.pow(1 - t, 3)),
      smooth: true,
      direction: "vertical",
      gestureDirection: "vertical",
      infinite: false,
      touchMultiplier: 2,
      wheelMultiplier: 1,
      wrapper: wrapper || undefined,
      content: content || undefined,
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
    if (wrapper) resizeObserver.observe(wrapper);

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
      if (wrapper) {
        wrapper.style.overflow = prevOverflow || "";
        wrapper.style.height = prevHeight || "";
        wrapper.style.position = prevPosition || "";
      }
    };
  }, []);
}
