import { useEffect, useRef, useState } from "react";
import { GallerySection } from "@/components/gallery/GallerySection";
import { useOutletContext } from "react-router-dom";

const PLATFORMS = ["instagram", "youtube", "x", "facebook"];

// Quarter ring indicator component with large surface area and small hole
function QuarterRingIndicator({ platforms, activeIndex, theme, isDark }) {
  const rotation = (90 / platforms.length) * activeIndex;
  const currentPlatform = platforms[activeIndex];
  
  // Get social media color from theme
  const getSocialColor = (platform) => {
    return theme.colors.social[platform] || theme.accent;
  };
  
  return (
    <div 
      className="fixed top-0 right-0 pointer-events-none z-[900]" 
      style={{ 
        width: '40vw', 
        height: '40vh',
        overflow: 'hidden'
      }}
    >
      <svg 
        viewBox="0 0 200 200" 
        className="w-full h-full"
        style={{ 
          transform: `rotate(${-rotation}deg)`,
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <defs>
          {/* Clip path to show only quarter (top-right) */}
          <clipPath id="quarterClip">
            <rect x="100" y="0" width="100" height="100" />
          </clipPath>
          
          {/* Gradient for each platform */}
          {platforms.map((platform, idx) => (
            <linearGradient 
              key={platform}
              id={`gradient-${platform}`}
              x1="0%" 
              y1="0%" 
              x2="100%" 
              y2="100%"
            >
              <stop 
                offset="0%" 
                stopColor={getSocialColor(platform)} 
                stopOpacity="0.9"
              />
              <stop 
                offset="100%" 
                stopColor={getSocialColor(platform)} 
                stopOpacity="0.6"
              />
            </linearGradient>
          ))}
        </defs>
        
        <g clipPath="url(#quarterClip)" transform="translate(100,100)">
          {/* Draw annular sectors for each platform */}
          {platforms.map((platform, idx) => {
            const anglePerSection = 360 / platforms.length;
            const startAngle = idx * anglePerSection - 90; // -90 to start from top
            const endAngle = startAngle + anglePerSection;
            
            // Inner radius (small hole): 20
            // Outer radius (large area): 95
            const innerR = 20;
            const outerR = 95;
            
            // Convert angles to radians
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            // Calculate path points
            const x1 = outerR * Math.cos(startRad);
            const y1 = outerR * Math.sin(startRad);
            const x2 = outerR * Math.cos(endRad);
            const y2 = outerR * Math.sin(endRad);
            const x3 = innerR * Math.cos(endRad);
            const y3 = innerR * Math.sin(endRad);
            const x4 = innerR * Math.cos(startRad);
            const y4 = innerR * Math.sin(startRad);
            
            const largeArcFlag = anglePerSection > 180 ? 1 : 0;
            
            const pathData = `
              M ${x1} ${y1}
              A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2}
              L ${x3} ${y3}
              A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4}
              Z
            `;
            
            const isActive = idx === activeIndex;
            
            return (
              <g key={platform}>
                <path
                  d={pathData}
                  fill={`url(#gradient-${platform})`}
                  stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
                  strokeWidth="1"
                  opacity={isActive ? 1 : 0.4}
                  style={{
                    transition: 'opacity 0.3s ease'
                  }}
                />
                
                {/* Platform name - positioned in the middle of sector */}
                {isActive && (
                  <text
                    x={(outerR + innerR) / 2 * Math.cos((startRad + endRad) / 2)}
                    y={(outerR + innerR) / 2 * Math.sin((startRad + endRad) / 2)}
                    fill={isDark ? '#ffffff' : '#000000'}
                    fontSize="10"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      opacity: 0.9
                    }}
                  >
                    {platform}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default function GalleryPage() {
  const { isDark, theme } = useOutletContext();
  const sectionRefs = useRef([]);
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef(null);

  // Observe scroll position → update ring indicator
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
      {/* Properly scrollable container with theme background */}
      <div
        ref={containerRef}
        className="fixed inset-0 w-full h-full overflow-y-auto 
          scroll-smooth snap-y snap-mandatory overscroll-behavior-y-contain text-white"
        style={{ 
          backgroundColor: theme.colors.bg.gallery,
          transition: 'background-color 0.5s ease'
        }}
      >
        {/* Quarter rotating ring indicator */}
        <QuarterRingIndicator 
          platforms={PLATFORMS} 
          activeIndex={activeSection}
          theme={theme}
          isDark={isDark}
        />

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