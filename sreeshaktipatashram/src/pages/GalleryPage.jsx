import { useEffect, useRef, useState } from "react";
import { GallerySection } from "@/components/gallery/GallerySection";
import SectionRingIndicator from "@/components/gallery/SectionRingIndicator";

const PLATFORMS = ["instagram", "youtube", "x", "facebook"];

export default function GalleryPage() {
  const sectionRefs = useRef([]);
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef(null);

  // ✅ FIX: Observe scroll position → update ring indicator
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index);
            setActiveSection(index);
          }
        });
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0.01
      }
    );

    sectionRefs.current.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ✅ FIX: Properly scrollable container */}
      <div
        ref={containerRef}
        className="fixed inset-0 w-full h-full bg-black text-white overflow-y-auto 
          scroll-smooth snap-y snap-mandatory overscroll-behavior-y-contain"
      >
        {/* Rotating ring indicator */}
        <SectionRingIndicator platforms={PLATFORMS} activeIndex={activeSection} />

        {/* Gallery Sections */}
        {PLATFORMS.map((platform, index) => (
          <section
            key={platform}
            ref={el => (sectionRefs.current[index] = el)}
            data-index={index}
            className="min-h-screen snap-start scroll-mt-6"
          >
            <GallerySection platform={platform} />
          </section>
        ))}
      </div>
    </>
  );
}