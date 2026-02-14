import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { FileText, BookOpen, ChevronLeft, ChevronRight, MousePointerClick } from "lucide-react";

const pdfs = [
  {
    name: "The Power Unknown to God (04 October 2020)",
    link: "https://sreeshaktipatashram.com/upload/The-Power-Unknown-to-God-04-October-2020.pdf"
  },
  {
    name: "The Secret Science of Shaktipat – Guide to Initiation",
    link: "https://sreeshaktipatashram.com/upload/The-Secret-Science-of-Shaktipat_Guide-to-Initiation-13-September-2020.pdf"
  },
  {
    name: "Blessed by His Guru",
    link: "https://sreeshaktipatashram.com/upload/Blessed-by-his-Guru-23-Jan-2022-with-cover-page1.pdf"
  },
  {
    name: "Born to Be a Yogi",
    link: "https://sreeshaktipatashram.com/upload/Born-to-be-a-Yogi-updated-on-14-September-2020.pdf"
  },
  {
    name: "Guru Gita (English)",
    link: "https://sreeshaktipatashram.com/upload/Guru-Gita-English-updated-on-19-Sep-2020.pdf"
  },
  {
    name: "Secrets of Shaktipath and Kundalini Yoga – Vol 1 (English)",
    link: "https://sreeshaktipatashram.com/upload/Secrets-of-Shakthipath-and-Kundalini-Yoga-Vol-1-updated-on-18-12-2019-English.pdf"
  },
  {
    name: "Secrets of Shaktipath and Kundalini Yoga – Vol 2 (English)",
    link: "https://sreeshaktipatashram.com/upload/Secrets-of-Shakthipath-and-Kundalini-Yoga-Vol-2-updated-on-18-September-2020.pdf"
  },
  {
    name: "Secrets of Shaktipath and Kundalini Yoga – Vol 3 (English)",
    link: "https://sreeshaktipatashram.com/upload/Secrets-of-Shakthipath-and-Kundalini-Yoga-Vol-3-updated-on-17-September-2020.pdf"
  },
  {
    name: "The Illusion (English)",
    link: "https://sreeshaktipatashram.com/upload/The-Illusion-updated-on-11-Oct-2020.pdf"
  },
  {
    name: "The Power Unknown to God (Russian)",
    link: "https://sreeshaktipatashram.com/upload/Power-Unknown-to-God-Russian.pdf"
  },
  {
    name: "The Power Unknown to God (Afrikaans)",
    link: "https://sreeshaktipatashram.com/upload/Afrikaans-Power-Unknown-to-God-Afrikaans.pdf"
  },
  {
    name: "The Power Unknown to God (German)",
    link: "https://sreeshaktipatashram.com/upload/Die-Kraft-die-Gott-nicht-kennt-Power-Unknown-to-God-German-updated-on-13-Sep-2020.pdf"
  },
  {
    name: "The Power Unknown to God (Spanish)",
    link: "https://sreeshaktipatashram.com/upload/El-poder-desconocido-para-Dios-Power-Unknown-to-God-Spanish.pdf"
  },
  {
    name: "French Q&A – Volume 1",
    link: "https://sreeshaktipatashram.com/upload/French-QA-Vol-1-Paperback-with-cover-06-Feb-2023.pdf"
  },
  {
    name: "Guru Gita (German)",
    link: "https://sreeshaktipatashram.com/upload/Guru-Gita-German-7th-April-2021.pdf"
  },
  {
    name: "Guru Gita (Italian)",
    link: "https://sreeshaktipatashram.com/upload/Guru-Gita-Italian-23rd-March-2021.pdf"
  },
  {
    name: "Guru Gita (Malayalam)",
    link: "https://sreeshaktipatashram.com/upload/Guru-Gita-Malayalam-13-October-2020.pdf"
  },
  {
    name: "I Segreti di Shaktipat e Kundalini Yoga – Vol 1 (Italian)",
    link: "https://sreeshaktipatashram.com/upload/I-segreti-di-Shaktipat-e-Kundalini-Yoga-Vol-1-13-March-2023-Paperback-with-cover-Italian.pdf"
  },
  {
    name: "The Power Unknown to God (Italian)",
    link: "https://sreeshaktipatashram.com/upload/La-potente-energia-sconosciuta-a-Dio-Power-Unknown-to-God-Italian.pdf"
  },
  {
    name: "The Power Unknown to God (French)",
    link: "https://sreeshaktipatashram.com/upload/Le-pouvoir-inconnu-à-Dieu-Power-Unknown-to-God-French.pdf"
  },
  {
    name: "The Power Unknown to God (Portuguese)",
    link: "https://sreeshaktipatashram.com/upload/O-Poder-Desconhecido-para-Deus-Power-Unknown-to-God-Portuguese.pdf"
  },
  {
    name: "The Power Unknown to God (Malayalam)",
    link: "https://sreeshaktipatashram.com/upload/Parashakti-Power-Unknown-to-God-Malayalam.pdf"
  },
  {
    name: "The Power Unknown to God (Tamil)",
    link: "https://sreeshaktipatashram.com/upload/Parashakti-Power-Unknown-to-God-Tamil.pdf"
  },
  {
    name: "Portuguese Q&A – Volume 1",
    link: "https://sreeshaktipatashram.com/upload/Portuguese-QA-Vol-1-Paperback-with-cover-26-Feb-2023.pdf"
  },
  {
    name: "Portuguese Q&A – Volume 2",
    link: "https://sreeshaktipatashram.com/upload/Portuguese-QA-Vol-2-Paperback-with-cover-28-Feb-2023.pdf"
  },
  {
    name: "The Power Unknown to God (Polish)",
    link: "https://sreeshaktipatashram.com/upload/Power-Uknown-to-GOD-Polish-31st-March-2021.pdf"
  },
  {
    name: "The Power Unknown to God (Chinese)",
    link: "https://sreeshaktipatashram.com/upload/Power-Unknown-to-God-Chinese.pdf"
  },
  {
    name: "The Power Unknown to God (Gujarati)",
    link: "https://sreeshaktipatashram.com/upload/Power-Unknown-to-God-Gujarati.pdf"
  },
  {
    name: "The Power Unknown to God (Marathi)",
    link: "https://sreeshaktipatashram.com/upload/Power-Unknown-to-God-Marathi.pdf"
  },
  {
    name: "The Power Unknown to God (Vietnamese)",
    link: "https://sreeshaktipatashram.com/upload/Power-Unknown-to-God-Vietnamese-.pdf"
  },
  {
    name: "The Power Unknown to God (Bengali & Sanskrit)",
    link: "https://sreeshaktipatashram.com/upload/Sanskrit_Bengali-Power-Unknown-to-God-Bengali_Sanskrit-15-11-2017.pdf"
  },
  {
    name: "Secretos de Shaktipat y Kundalini Yoga – Vol 1 (Spanish)",
    link: "https://sreeshaktipatashram.com/upload/Secretos-de-Shaktipat-y-Kundalini-Yoga-Vol-1-Paperback-with-cover-27-Feb-2023-Spanish.pdf"
  },
  {
    name: "Sekrety Shaktipat i Kundalini Jogi – Tom 1 (Polish)",
    link: "https://sreeshaktipatashram.com/upload/Sekrety-Shaktipat-i-Kundalini-Jogi-Tom-–-1-Paperback-with-cover-02-Feb-2023-Polish.pdf"
  },
  {
    name: "Sekrety Shaktipat i Kundalini Jogi – Tom 2 (Polish)",
    link: "https://sreeshaktipatashram.com/upload/Sekrety-Shaktipat-i-Kundalini-Jogi-Tom-–-2-Paperback-with-cover-12-Feb-2023-1-Polish.pdf"
  },
  {
    name: "Sekrety Shaktipat i Kundalini Jogi – Tom 3 (Polish)",
    link: "https://sreeshaktipatashram.com/upload/Sekrety-Shaktipat-i-Kundalini-Jogi-Tom-–-3-Paperback-with-cover-15-March-2023-1-Polish.pdf"
  },
  {
    name: "Shaktipat Chintamani – Part 1 (Hindi)",
    link: "https://sreeshaktipatashram.com/upload/Shaktipat-Chintamani-Hindi-1.pdf"
  },
  {
    name: "Shaktipat Chintamani – Part 2 (Hindi)",
    link: "https://sreeshaktipatashram.com/upload/Shaktipat-Chintamani-Hindi-2.pdf"
  },
  {
    name: "The Illusion (French)",
    link: "https://sreeshaktipatashram.com/upload/The-Illusion-French-15th-April-2021.pdf"
  },
  {
    name: "The Illusion (German)",
    link: "https://sreeshaktipatashram.com/upload/The-Illusion-German-1st-April-2021.pdf"
  },
  {
    name: "The Illusion (Telugu)",
    link: "https://sreeshaktipatashram.com/upload/The-Illusion-Telugu-27-October-2020.pdf"
  },
  {
    name: "The Power Unknown to God (Dutch)",
    link: "https://sreeshaktipatashram.com/upload/The-Power-Unknown-to-God-Dutch-14th-April-2021.pdf"
  }
];

function ReadingsPage() {
  const { isDark } = useOutletContext();
  const [query, setQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [openPdf, setOpenPdf] = useState(null);
  const animationRef = useRef(null);
  // const lastKeyTimeRef = useRef(0);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const pdfViewerRef = useRef(null);
  const sidebarWidth = 320;
  const entryWidth = 48;

  const theme = {
    bg: isDark ? 'bg-neutral-900' : 'bg-neutral-50',
    text: isDark ? 'text-neutral-100' : 'text-neutral-900',
    textSecondary: isDark ? 'text-neutral-400' : 'text-neutral-600',
    cardBg: isDark ? 'bg-neutral-800/95' : 'bg-white',
    border: isDark ? 'border-neutral-700' : 'border-neutral-200',
    shadow: isDark ? 'shadow-lg shadow-black/20' : 'shadow-md shadow-black/5',
  };

  const total = pdfs.length;
  const searchInputRef = useRef(null);
  const filtered = useMemo(() => {
    return pdfs.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const filteredTotal = filtered.length;

  // Rest of hooks unchanged (moveBySteps, useEffects, etc.)
  const moveBySteps = useCallback((steps) => {
    if (animationRef.current || filteredTotal === 0) return;
    const safeCurrent = Math.floor(currentIndex);
    const newIndex = (safeCurrent + steps + filteredTotal * 10) % filteredTotal;
    setIsAnimating(true);
    setCurrentIndex(newIndex);
    setTimeout(() => setIsAnimating(false), 400); // Faster animation
  }, [filteredTotal, currentIndex]);

  // FIXED: Reset on filter change
  useEffect(() => {
    setCurrentIndex(0);
  }, [filtered]);

  useEffect(() => {
    if (filteredTotal > 0) {
      setCurrentIndex(prev => Math.min(prev, filteredTotal - 1));
    }
  }, [filteredTotal]);

  useEffect(() => {
    if (!openPdf) return;
    const prevOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow || "";
      document.documentElement.style.overflow = prevHtmlOverflow || "";
    };
  }, [openPdf]);

  useEffect(() => {
    if (!openPdf) return;

    const handleMove = (e) => {
      if (isSidebarPinned) return;
      const rect = pdfViewerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const insideY = e.clientY >= rect.top && e.clientY <= rect.bottom;
      const leftEdge = rect.left;
      const openEdge = leftEdge + sidebarWidth;

      if (!isSidebarHovered) {
        if (insideY && e.clientX >= leftEdge && e.clientX <= leftEdge + entryWidth) {
          setIsSidebarHovered(true);
        }
        return;
      }

      if (e.clientX <= openEdge + 8) return;
      if (e.clientX > openEdge + 8) setIsSidebarHovered(false);
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, [openPdf, isSidebarPinned, isSidebarHovered]);

  // ACCELERATING KEYBOARD NAVIGATION
  useEffect(() => {
    let animationInterval = null;
    let pressStartTime = null;
    let pressCount = 0;

    const handleKeyDown = (e) => {
      if (openPdf || e.target.tagName === 'INPUT' || filteredTotal === 0) return;
      // if (e.target.tagName === 'INPUT' || filteredTotal === 0) return;
      
      const now = Date.now();
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        
        const direction = e.key === 'ArrowRight' ? 1 : -1;
        
        // Start/continue acceleration
        if (!pressStartTime) {
          pressStartTime = now;
          pressCount = 0;
        }
        
        pressCount++;
        
        // Cancel existing animation
        if (animationInterval) {
          clearInterval(animationInterval);
        }
        
        // Calculate speed based on time held (50ms → 10ms terminal velocity)
        const timeHeld = now - pressStartTime;
        const speed = Math.max(50, 500 - timeHeld * 0.8); // Ramp from 50ms to 10ms
        const terminalSpeed = 10;
        
        // Continuous cycling animation
        animationInterval = setInterval(() => {
          moveBySteps(direction);
        }, Math.max(terminalSpeed, speed));
        
        // Initial single step
        moveBySteps(direction);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // Stop acceleration
        if (animationInterval) {
          clearInterval(animationInterval);
          animationInterval = null;
        }
        pressStartTime = null;
        pressCount = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationInterval) clearInterval(animationInterval);
    };
  }, [filteredTotal, moveBySteps]);

  useEffect(() => {
    const handleCtrlK = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleCtrlK);
    return () => window.removeEventListener('keydown', handleCtrlK);
  }, []);

  useEffect(() => {
    if (!openPdf) return;

    // Disable keyboard shortcuts for printing/downloading
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['p', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        // e.stopPropagation();
        // return false;
      }
    };

    // Disable context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      // e.stopPropagation();
      // return false;
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [openPdf]);

  const moveToIndex = useCallback((targetIndex) => {
    if (isAnimating || filteredTotal === 0 || animationRef.current) return;
    const safeIndex = Math.floor((targetIndex + filteredTotal * 10) % filteredTotal);
    setIsAnimating(true);
    setCurrentIndex(safeIndex);
    setTimeout(() => setIsAnimating(false), 350);
  }, [isAnimating, filteredTotal]);

  const visibleCount = 7;
  const halfVisible = 3;
  const tileSize = 460;
  const peekOffset = 10;
  const primarySpread = 128;       // extra push ONLY for ±1 layer

  const visiblePdfs = useMemo(() => {
    if (filteredTotal === 0) return [];

    const maxItems = Math.min(visibleCount, filteredTotal);
    const safeCurrentIndex = Math.floor(currentIndex) % filteredTotal;
    const result = [];

    for (let i = 0; i < maxItems; i++) {
      const idx = (safeCurrentIndex + i - Math.floor(maxItems / 2) + filteredTotal) % filteredTotal;
      const pdf = filtered[idx];
      if (!pdf) continue;

      const offset = i - Math.floor(maxItems / 2);
      const absOffset = Math.abs(offset);

      // Layer spacing logic
      let spreadBoost = 0;
      if (absOffset === 1) {
        spreadBoost = Math.sign(offset) * primarySpread;
      } else if (absOffset >= 2) {
        const parentBoost = primarySpread;
        spreadBoost = Math.sign(offset) * (parentBoost + peekOffset * (absOffset - 1));
      }

      // Visual styling
      const blurValue = 2 + absOffset * 2;
      const bgOpacity = Math.max(0.3, 1 - absOffset * 0.15);
      const textOpacity = Math.max(0.4, 1 - absOffset * 0.15);

      result.push({
        pdf,
        offset,
        absOffset,
        leftPos: offset * peekOffset + spreadBoost,
        heightScale: Math.max(0.82, 1 - absOffset * 0.06),
        bgOpacity,
        textOpacity,
        blurValue
      });
    }

    return result;
  }, [currentIndex, filtered, filteredTotal]);


  const handleTileClick = useCallback((clickedOffset) => {
    if (animationRef.current || filteredTotal === 0) return;
    
    if (clickedOffset === 0 || filteredTotal <= 3) {
      // Get the current active PDF based on currentIndex, not filtered[0]
      const safeCurrent = Math.floor(currentIndex) % filteredTotal;
      const pdfToOpen = filtered[safeCurrent];
      if (pdfToOpen) setOpenPdf(pdfToOpen);
      return;
    }
    
    const safeCurrent = Math.floor(currentIndex);
    const visibleStartIdx = (safeCurrent - halfVisible + filteredTotal) % filteredTotal;
    const clickedAbsoluteIdx = (visibleStartIdx + halfVisible + clickedOffset + filteredTotal * 10) % filteredTotal;
    setIsAnimating(true);
    setCurrentIndex(clickedAbsoluteIdx);
    setTimeout(() => setIsAnimating(false), 400);
  }, [visiblePdfs, filteredTotal, currentIndex, filtered]);

  return (
    // <div className={`min-h-screen ${theme.bg} ${theme.text} px-12 pt-32`}>
    <div className={`relative min-h-screen ${theme.text} px-12 pt-32 overflow-x-hidden`}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <svg
          className="fixed inset-0 w-full h-screen pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <clipPath id="sigmoidClip">
              <path
                d="
                  M0 0
                  H100
                  V55
                  C70 50, 55 60, 40 55
                  C25 50, 15 60, 0 55
                  L0 0
                  Z
                "
              />
            </clipPath>
          </defs>

          <image
            href="https://dhunwellness.com/cdn/shop/files/Sound_healing_room.jpg?v=1751348144&width=1920"
            x="0"
            y="0"
            width="100"
            height="100"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#sigmoidClip)"
          />
        </svg>
        
      </div>

      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.2)'
      }} />

      <div className="relative z-10 h-full flex flex-col">

      {/* ENHANCED SEARCH + Results counter */}
      <div className="w-3xl mx-auto mb-12">
        <div className={`relative flex items-center gap-4 border-2 ${theme.border} py-5 px-8 ${theme.cardBg} shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md`}>
          <FileText className="w-6 h-6 flex-shrink-0" />
          <input
            ref={searchInputRef}   // keep this for Ctrl+K focus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (animationRef.current) {
                clearInterval(animationRef.current);
                animationRef.current = null;
              }
            }}
            placeholder="Type to search..."
            className="bg-transparent outline-none flex-1 text-xl font-medium placeholder:text-neutral-500 transition-colors duration-200 pr-12"
          />
          
          {/* Add the Ctrl+K indicator pill */}
          <div
            className="absolute right-12 top-1/2 -translate-y-1/2 text-xs px-3 py-2 font-mono select-none pointer-events-none"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)'
            }}
          >
            Ctrl + K
          </div>

          {/* Existing Clear button */}
          {query && (
            <button
              onClick={() => setQuery("")}
              className={`w-8 h-8 flex items-center justify-center transition-all duration-200 hover:scale-110 group ${theme.textSecondary} hover:${theme.text} absolute right-3 z-20`}
              type="button"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

          )}
        </div>

        {/* NEW: Results counter */}
        {query && (
          <div className={`text-center mt-4 px-6 py-3 ${theme.cardBg} ${theme.border} shadow-sm backdrop-blur-sm transition-all duration-300 ${filteredTotal === 0 ? 'opacity-75' : ''}`}>
            <p className={`${theme.textSecondary} text-sm font-medium tracking-wide`}>
              Showing <span className={`${theme.text} font-semibold`}>{filteredTotal}</span> 
              {filteredTotal === 1 ? ' result' : ' results'} for 
              <span className={`${theme.text} font-semibold mx-1 px-1 bg-gradient-to-r from-neutral-300 to-neutral-200 bg-opacity-20`}>“{query}”</span>
            </p>
          </div>
        )}
      </div>

      {filteredTotal === 0 && query && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          {/* Blurred overlay */}
          {/* <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" /> */}

          {/* Content */}
          <div
            className="relative text-center p-12 w-3xl shadow-xl backdrop-blur-xl"
            style={{
              backgroundColor: isDark ? 'rgba(20, 20, 20, 0.7)' : 'rgba(255, 255, 255, 0.7)'
            }}
          >
            <FileText
              className="w-20 h-20 mx-auto mb-6"
              style={{ color: isDark ? 'rgba(245, 245, 245, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}
            />
            <p
              className="text-3xl font-semibold mb-2"
              style={{ color: isDark ? '#f5f5f5' : '#111111' }}
            >
              No matches found
            </p>
            <p
              className="text-lg"
              style={{ color: isDark ? 'rgba(245, 245, 245, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}
            >
              Try searching for "Guru", "Dutch", or "Shaktipat"
            </p>
          </div>
        </div>
      )}


      {/* ENHANCED LIBRARY */}
      <div
        className="relative mt-6 py-8"
        style={{
          backgroundColor: isDark ? 'rgba(10, 14, 16, 0.35)' : 'rgba(255, 255, 255, 0.5)'
        }}
      >
        <div className="relative mx-auto" style={{ 
          width: `${tileSize + (visibleCount-1) * peekOffset}px`,
          height: `${tileSize + 80}px`
        }}>
          <div className={`absolute inset-0 flex items-center ${isAnimating ? 'transition-all duration-400 ease-out-back' : 'transition-all duration-300 ease-out'}`}>
            {visiblePdfs.map(({ pdf, offset, leftPos, absOffset, heightScale, bgOpacity, textOpacity, blurValue }, index) => {
              const isCenter = offset === 0 || filteredTotal <= 3;
              const zIndex = 50 - absOffset;
              const scaledHeight = tileSize * heightScale;
              const topOffset = (tileSize - scaledHeight) / 2;

              return (
                <div
                  key={`${pdf.link}-${currentIndex}`}
                  style={{
                    left: `calc(50% - ${tileSize/2}px + ${leftPos}px)`,
                    zIndex,
                    width: tileSize,
                    height: scaledHeight,
                    top: topOffset,
                    transform: isCenter ? `scale(1.05)` : `scale(0.95)`,
                    transformOrigin: 'center center',
                  }}
                  className={`absolute flex flex-col items-center justify-center cursor-pointer select-none border-1 overflow-hidden transition-all duration-300 group
                    ${isCenter 
                      ? 'border-neutral-400 shadow-2xl scale-100 hover:scale-105' 
                      : 'border-neutral-300 hover:border-neutral-400 hover:shadow-xl'
                    } 
                    ${isAnimating ? 'will-change-transform transition-transform duration-400 ease-out-back' : 'transition-transform duration-300 ease-out'}
                  `}
                  onClick={() => handleTileClick(offset)}
                >
                  {/* Enhanced background with glow */}
                  <div 
                    className="absolute inset-0 border-inset group-hover:bg-gradient-to-br group-hover:from-neutral-100/20 group-hover:to-neutral-200/10 transition-all duration-300"
                    style={{ 
                      backgroundColor: isDark 
                        ? `rgba(30,30,30,${bgOpacity})`
                        : `rgba(245,245,245,${bgOpacity})`,
                      backdropFilter: `blur(${blurValue}px)`
                    }}
                  />

                  {/* Icon */}
                  <div className="flex-1 flex items-center justify-center z-20 pointer-events-none p-6">
                    <FileText 
                      className={`w-28 h-36 transition-all duration-300 group-hover:scale-110 ${isCenter ? 'w-36 h-44 scale-90 drop-shadow-2xl' : ''}`}
                      style={{ opacity: textOpacity, color: 'hsl(0 0% 55%)' }}
                    />
                  </div>

                  {/* NEW: Click indicator for center */}
                  {isCenter && (
                    <div className="absolute bottom-30 right-3 w-8 h-8 bg-teal-600 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 z-30">
                      <MousePointerClick className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Enhanced title + description */}
                  {(isCenter || filteredTotal <= 3) && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100%] z-20 px-0 pb-0 pt-0">
                      <div className="bg-neutral-300/20 backdrop-blur-md px-4 py-13 border-neutral-500">
                        <p
                          className="text-xs font-semibold leading-tight tracking-wide mb-1 line-clamp-2"
                          style={{ color: isDark ? '#ffffff' : 'rgba(0,0,0,0.95)' }}
                        >
                          {pdf.name}
                        </p>
                        <p className="text-xs text-neutral-400 font-normal leading-tight line-clamp-2">
                          {pdf.desc || 'No Description'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ENHANCED Navigation buttons */}
                  {!isCenter && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className={`text-sm font-bold px-6 py-3 border-2 shadow-2xl backdrop-blur-xl flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-white/20
                        ${offset > 0 
                          ? 'border-emerald-400 bg-emerald-500/95 text-white shadow-emerald-500/25 hover:bg-emerald-600' 
                          : 'border-blue-400 bg-blue-500/95 text-white shadow-blue-500/25 hover:bg-blue-600'
                        }`}>
                        {offset > 0 ? (
                          <>
                            <ChevronRight className="w-4 h-4" />
                            Next
                          </>
                        ) : (
                          <>
                            Prev
                            <ChevronLeft className="w-4 h-4" />
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <div
            className="backdrop-blur-md px-4 py-2 border text-xs font-mono"
            style={{
              backgroundColor: isDark ? 'rgba(15, 18, 22, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              borderColor: theme.border,
              color: theme.text
            }}
          >
            <span>Arrow ← → to navigate</span>
            <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
            <span>Enter to open</span>
            <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
            <span>Esc to close</span>
          </div>
        </div>

        {filteredTotal > 0 && (
          <div className="mt-3 flex justify-center">
            <div
              className="backdrop-blur-md px-6 py-3 border shadow-2xl"
              style={{
                backgroundColor: isDark ? 'rgba(10, 12, 16, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: theme.border,
                color: theme.text
              }}
            >
              <span className="text-sm font-bold tracking-wide">
                {Math.floor(currentIndex) + 1} / {filteredTotal}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* PDF OVERLAY - enhanced */}
      {openPdf && (
        <div
          className="fixed inset-0 z-[1000] bg-black/55 backdrop-blur-lg flex justify-center overflow-y-auto" 
          style={{ touchAction: 'pan-y pinch-zoom', padding: '120px 16px 24px' }}
          onClick={(e) => {
            if (!e.target.closest('.pdf-viewer-content')) {
              setOpenPdf(null);
            }
          }}
        >
            <div
              ref={pdfViewerRef}
              className={`relative pdf-viewer-content ${theme.cardBg} shadow-2xl border border-neutral-800/30 max-w-[100rem] w-full overflow-hidden flex`}
              style={{
                touchAction: 'pan-y pinch-zoom',
                height: 'calc(100vh - 144px)',
                maxHeight: 'calc(100vh - 144px)'
              }}
            >
             
            {/* Hover trigger always available */}
            <div
              className="absolute left-0 top-0 h-full w-12 z-50"
              onMouseEnter={() => !isSidebarPinned && setIsSidebarHovered(true)}
            />

            {/* Single thin vertical teal pull-tab/pill */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-24 bg-teal-200 rounded-full z-50 pointer-events-none transition-all duration-300 ${
                isSidebarPinned || isSidebarHovered ? 'left-[308px]' : 'left-2'
              }`}
            />

            {/* Collapsible Description Sidebar with proper hover handling */}
            <div 
              className="absolute left-0 top-0 h-full z-40"
              style={{ pointerEvents: isSidebarPinned || isSidebarHovered ? 'auto' : 'none' }}
            >
              {/* Sidebar Content */}
              <div className={`
                h-full ${theme.cardBg} border-r ${theme.border} flex flex-col overflow-hidden transition-all duration-300 ease-out
                ${isSidebarPinned || isSidebarHovered ? 'w-80 opacity-100' : 'w-0 opacity-0'}
              `}>
                {/* Sidebar Header with pin button */}
                <div className={`px-6 py-5 border-b ${theme.border} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <h3 className={`text-sm font-semibold ${theme.text} tracking-wide uppercase`}>
                      Document Details
                    </h3>
                  </div>
                  
                  {/* Pin/Unpin button */}
                  <button 
                    onClick={() => setIsSidebarPinned(!isSidebarPinned)}
                    className={`w-8 h-8 flex items-center justify-center rounded ${isSidebarPinned ? 'bg-teal-500/20 text-teal-500' : 'bg-neutral-800/30 text-neutral-500 hover:bg-neutral-800/50'} transition-all duration-200`}
                    aria-label={isSidebarPinned ? "Unpin sidebar" : "Pin sidebar"}
                  >
                    {isSidebarPinned ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* PDF Icon and Basic Info */}
                  <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-32 bg-gradient-to-br from-neutral-200/20 to-neutral-300/10 backdrop-blur-sm rounded-lg border border-neutral-800/10 flex items-center justify-center mb-4">
                      <FileText className="w-16 h-20 text-neutral-500" />
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${theme.textSecondary} mb-1`}>
                        {openPdf.name.split('.').pop()?.toUpperCase()} Document
                      </p>
                      <p className={`text-xs ${theme.textSecondary} font-normal`}>
                        {filtered.findIndex(p => p.link === openPdf.link) + 1} of {filteredTotal}
                      </p>
                    </div>
                  </div>
                  
                  {/* Description Section */}
                  <div>
                    <h4 className={`text-sm font-semibold ${theme.text} mb-3 flex items-center gap-2`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Description
                    </h4>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-neutral-800/30' : 'bg-neutral-100/50'} backdrop-blur-sm`}>
                      <p className={`text-sm ${theme.text} leading-relaxed`}>
                        {openPdf.desc || 'No description available for this document.'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  {/* <div className="mt-8">
                    <h4 className={`text-sm font-semibold ${theme.text} mb-3 flex items-center gap-2`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Quick Actions
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          window.open(openPdf.link, '_blank', 'noopener,noreferrer');
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${isDark ? 'bg-neutral-800/50 hover:bg-neutral-700/50' : 'bg-neutral-100 hover:bg-neutral-200'} transition-all duration-200 group`}
                      >
                        <BookOpen className="w-4 h-4 text-neutral-500" />
                        <span className={`text-sm ${theme.text} font-medium`}>Open in New Tab</span>
                        <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => setOpenPdf(null)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${isDark ? 'bg-neutral-800/50 hover:bg-red-900/30' : 'bg-neutral-100 hover:bg-red-50'} transition-all duration-200 group`}
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className={`text-sm ${theme.text} font-medium`}>Close Viewer</span>
                      </button>
                    </div>
                  </div> */}
                  
                  {/* Document Info */}
                  <div className="mt-8">
                    <h4 className={`text-sm font-semibold ${theme.text} mb-3 flex items-center gap-2`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Document Info
                    </h4>
                    <div className={`space-y-2 text-sm ${theme.textSecondary}`}>
                      <div className="flex justify-between">
                        <span>Format:</span>
                        <span className={`font-medium ${theme.text}`}>PDF</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span className={`font-medium ${theme.text}`}>~2-5 MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>pages:</span>
                        <span className={`font-medium ${theme.text}`}>50-150</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Sidebar Footer */}
                <div className={`px-6 py-4 border-t ${theme.border} text-center`}>
                  <p className={`text-xs ${theme.textSecondary}`}>
                    {isSidebarPinned ? 'Sidebar pinned • Click pin icon to unpin' : <>Navigate away to close sidebar&nbsp;&nbsp;&nbsp;&nbsp;→</>}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Main Content Area */}
            <div className="h-full flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Header with better font and rectangular close button */}
              <div className={`sticky top-0 z-30 flex items-center justify-between px-8 py-5 border-b ${theme.border} bg-gradient-to-r from-transparent via-neutral-50/5 to-transparent ${isDark ? 'via-neutral-800/5' : ''}`}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex-shrink-0">
                    <FileText className="w-8 h-10 text-neutral-500" />
                  </div>
                  <div className="min-w-0">
                    {/* Better font for PDF title - using font-sans with better tracking */}
                      <h2
                        className="text-2xl font-semibold tracking-wide leading-tight truncate"
                        style={{
                          fontFamily: "'Source Sans 3', sans-serif",
                          color: theme.text
                        }}
                      >
                        {openPdf.name}
                      </h2>
                  </div>
                </div>
                
                {/* Rectangular close button - full topbar height */}
                <button 
                  className="absolute top-0 right-0 h-full aspect-square flex items-center justify-center bg-red-200/100 hover:bg-red-500 text-red-500 hover:text-white border-l border-neutral-800/30 transition-all duration-200 group"
                  onClick={() => setOpenPdf(null)}
                  aria-label="Close PDF viewer"
                >
                  <svg className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* PDF Viewer */}
              <div className="flex-1 min-h-0">
                <iframe 
                  src={openPdf.link}
                  className="w-full h-full border-0"
                  title={openPdf.name}
                  loading="lazy"
                  allow="fullscreen"
                  style={{ touchAction: 'pinch-zoom' }}
                />
              </div>

              {/* Footer */}
              <div className={`px-8 py-4 border-t ${theme.border} flex flex-col items-center gap-3`}>
                <div className={`text-sm ${theme.textSecondary} flex items-center gap-3`}>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>PDF Viewer</span>
                  </div>
                  <div className="text-xs opacity-70">
                    {isSidebarPinned ? 'Sidebar pinned' : 'Hover left edge for details'}
                  </div>
                </div>
                
                {/* Open in new tab button */}
                <button
                  onClick={() => {
                    window.open(openPdf.link, '_blank', 'noopener,noreferrer');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 group"
                >
                  <BookOpen className="w-4 h-4" />
                  Open in New Tab
                  <svg className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}

export default ReadingsPage;
