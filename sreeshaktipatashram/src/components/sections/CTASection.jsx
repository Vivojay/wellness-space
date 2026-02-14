import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const CTASection = ({ theme, setCursorVariant }) => {
  const enterEase = "cubic-bezier(0.6, 0.05, 0.2, 0.95)";
  const exitEase  = "cubic-bezier(0.8, 0, 0.3, 1)";
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <section 
      className="cv-auto relative py-40 px-8 transition-colors duration-500"
      style={{ backgroundColor: theme.colors.bg.primary }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 
          className="text-6xl md:text-7xl font-light tracking-tight leading-tight mb-10"
          style={{
            color: theme.text,
            fontFamily: "'Source Sans 3', sans-serif",
            fontWeight: 300
          }}
        >
          Begin Your Journey
        </h2>
        <p 
          className="text-lg font-light mb-12"
          style={{ 
            color: theme.textMuted,
            fontFamily: "'Source Sans 3', sans-serif"
          }}
        >
          Step into a space where transformation unfolds naturally
        </p>

        <button
          onMouseEnter={() => {
            setHovered(true);
            setCursorVariant("hover");
          }}
          onMouseLeave={() => {
            setHovered(false);
            setCursorVariant("default");
          }}
          className="relative px-16 py-5 hover:scale-105 transition-transform duration-300"
          style={{ 
            border: "none", 
            outline: "none",
            backgroundColor: theme.accent + '40',
            fontFamily: "'Source Sans 3', sans-serif"
          }}
          onClick={() => navigate("/booking")}
        >
          {/* SVG BORDER using pathLength */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
            }}
          >
            <rect
              x="0"
              y="0"
              width="100"
              height="40"
              fill="none"
              stroke={theme.accentSecondary}
              strokeWidth="2"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={hovered ? 0 : 1}
              style={{
                transition: `stroke-dashoffset 600ms ${
                  hovered ? enterEase : exitEase
                }`,
              }}
            />
          </svg>

          <span 
            className="relative z-10 tracking-[0.2em] text-sm"
            style={{ color: theme.text }}
          >
            Book Now
          </span>
        </button>
      </div>
    </section>
  );
};

export default CTASection;
