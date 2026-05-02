import { useState, useEffect } from 'react';
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Album", to: "/album" },
  { label: "Readings", to: "/readings" },
  { label: "Blog", to: "/blog" },
];

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
    ? isDark ? 'rgba(15, 21, 17, 0.9)' : 'rgba(249, 245, 237, 0.92)'
    : isDark ? 'rgba(15, 21, 17, 0.76)' : 'rgba(249, 245, 237, 0.8)';

  const borderColor = scrolled
    ? isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.25)'
    : isDark ? 'rgba(228, 236, 230, 0.24)' : 'rgba(44, 58, 47, 0.22)';

  const textColor = isDark ? '#ffffff' : scrolled ? '#1a1a1a' : '#000000ff';
  const pillBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.58)';
  const activeBg = isDark ? 'rgba(170, 216, 206, 0.18)' : 'rgba(50, 121, 111, 0.14)';
  const activeColor = isDark ? '#eef3ef' : '#17362f';

  return (
    <div
      className={`fixed top-0 left-1/2 -translate-x-1/2 w-full min-h-[110px]
                  flex items-center justify-center
                  backdrop-blur-3xl border-b-4 transition-all duration-500
                  z-[1000] shadow-[0_10px_30px_rgba(0,0,0,0.12)]`}
      style={{ backgroundColor: bgColor, borderColor, color: textColor }}
      data-navbar
    >
      <div className="flex w-full max-w-6xl flex-col items-center gap-3 px-18 py-4 md:px-24">
        <span
          className="block text-center leading-none whitespace-nowrap"
          style={{
            fontFamily: "'Noto Sans', sans-serif",
            fontSize: "clamp(0.68rem, 2.55vw, 1.62rem)",
            letterSpacing: "clamp(0.08em, 0.9vw, 0.3em)",
            maxWidth: "calc(100vw - 154px)",
          }}
        >
          Sreeshaktipat Ashram
        </span>

        <nav
          className="flex max-w-full items-center gap-2 overflow-x-auto rounded-full border px-2 py-2"
          style={{
            borderColor,
            backgroundColor: pillBg,
            scrollbarWidth: "none",
          }}
          aria-label="Primary"
        >
          {navItems.map((item) => {
            const isActive = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="shrink-0 rounded-full px-4 py-2 text-xs uppercase tracking-[0.22em] transition-colors duration-300"
                style={{
                  backgroundColor: isActive ? activeBg : "transparent",
                  color: isActive ? activeColor : textColor,
                }}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
