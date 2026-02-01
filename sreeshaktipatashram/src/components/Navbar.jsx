import { useState, useEffect } from 'react';

export default function Navbar({ isDark }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // dynamic background color
  const bgColor = scrolled
    ? isDark
      ? 'rgba(26, 26, 26, 0.6)' // dark theme when scrolled
      : 'rgba(255, 255, 255, 0.6)' // light theme when scrolled
    : 'rgba(255, 255, 255, 0)'; // initial transparent

  const borderColor = scrolled
    ? isDark
      ? 'rgba(255,255,255,0.3)' // softer border when scrolled
      : 'rgba(0, 0, 0, 0.9)' // thick white border initially
    : 'rgba(21, 97, 108, 0.9)';

  const textColor = isDark
    ? scrolled
      ? '#ffffff'
      : '#ffffff'
    : scrolled
      ? '#1a1a1a'
      : '#000000ff';

  return (
    <div
      className={`fixed top-0 left-1/2 -translate-x-1/2 w-full h-[110px] flex items-center justify-center
                  backdrop-blur-3xl border-b-4 transition-all duration-500 z-[10]`}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: textColor,
      }}
    >
      <span className="text-lg sm:text-xl md:text-2xl font-evafiya tracking-[0.3em]">
        Sree Shaktipat Ashram
      </span>
    </div>
  );
}
