import { useEffect, useRef, useState } from "react";

export default function LazyMount({
  children,
  minHeight = 540,
  rootMargin = "280px 0px",
  className = "",
}) {
  const mountRef = useRef(null);
  const [isVisible, setIsVisible] = useState(
    () => typeof window !== "undefined" && typeof window.IntersectionObserver === "undefined"
  );

  useEffect(() => {
    if (isVisible) return;
    const node = mountRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0.01,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  if (isVisible) {
    return children;
  }

  return <div ref={mountRef} className={className} style={{ minHeight }} aria-hidden />;
}
