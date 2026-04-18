import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";

export default function Navbar({ isDark }) {
  const { pathname } = useLocation();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // ✅ FIXED: Same scroll behavior on ALL pages (not forced on non-home)
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // ✅ Removed isHome dependency

  // ✅ FIXED: Use actual scroll state on all pages
  const bgColor = scrolled
    ? isDark ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.75)'
    : isDark ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.22)';

  const borderColor = scrolled
    ? isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.25)'
    : 'rgba(21, 97, 108, 0.9)';

  const textColor = isDark ? '#ffffff' : scrolled ? '#1a1a1a' : '#000000ff';

  return (
    <div
      className={`fixed top-0 left-1/2 -translate-x-1/2 w-full h-[110px]
                  flex items-center justify-center
                  backdrop-blur-3xl border-b-4 transition-all duration-500
                  z-[19] shadow-[0_10px_30px_rgba(0,0,0,0.12)]`}
      style={{ backgroundColor: bgColor, borderColor, color: textColor }}
      data-navbar
    >
      <span
        className="block text-center leading-none whitespace-nowrap"
        style={{
          fontFamily: "'Noto Sans', sans-serif",
          fontSize: "clamp(0.62rem, 2.35vw, 1.5rem)",
          letterSpacing: "clamp(0.08em, 0.9vw, 0.3em)",
          maxWidth: "calc(100vw - 154px)",
        }}
      >
        Sreeshaktipat Ashram
      </span>
    </div>
  );
}
