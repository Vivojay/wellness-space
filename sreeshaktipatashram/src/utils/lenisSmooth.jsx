import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export default function useLenisSmooth() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,   // higher = smoother, slower
      easing: (t) => Math.min(1, 1 - Math.pow(1 - t, 3)), // smooth easing
      smooth: true,
      direction: "vertical",
      gestureDirection: "vertical",
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);
}
