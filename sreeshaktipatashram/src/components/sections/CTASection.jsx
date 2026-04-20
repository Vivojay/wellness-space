import React from "react";
import { useNavigate } from "react-router-dom";


const CTASection = ({ theme, setCursorVariant, isDark, bgColor }) => {
  const navigate = useNavigate();
  const traceColor = isDark ? "rgba(94, 234, 212, 0.95)" : "rgba(191, 114, 73, 0.96)";
  const traceSoft = isDark ? "rgba(94, 234, 212, 0.24)" : "rgba(191, 114, 73, 0.24)";

  return (
    <section 
      className="cv-auto relative py-40 px-8 transition-colors duration-500"
      style={{ backgroundColor: bgColor ?? theme.colors.bg.primary }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 
          className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tight leading-tight mb-10"
          style={{
            fontFamily: "'Source Sans 3', sans-serif",
            fontWeight: 300
          }}
        >
          <span
            className="gradient-text"
            style={{
              background: `linear-gradient(165deg, ${theme.text} 0%, ${theme.text} 50%, #ef4444 50%, #ef4444 100%)`,
              display: "inline-block",
              fontFamily: "'Source Sans 3', sans-serif",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              paddingBottom: "2px",
              lineHeight: "1.15",
            }}
          >
            Begin Your Journey
          </span>
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
            setCursorVariant("hover");
          }}
          onMouseLeave={() => {
            setCursorVariant("default");
          }}
          className="joinus-btn relative px-16 py-5 hover:scale-105 transition-transform duration-300 overflow-hidden"
          style={{ 
            border: `1px solid ${isDark ? theme.accentSecondary : "#4a2c1f"}`,
            outline: "none",
            backgroundColor: theme.accent + '40',
            fontFamily: "'Source Sans 3', sans-serif"
          }}
          onClick={() => navigate("/booking")}
        >
          <span
            className="joinus-btn__trace absolute inset-0 pointer-events-none"
            style={{
              "--joinus-trace": traceColor,
              "--joinus-trace-soft": traceSoft,
            }}
          />

          <span 
            className="relative z-10 tracking-[0.2em] text-sm"
            style={{ color: theme.text }}
          >
            Join Us
          </span>
        </button>
      </div>
    </section>
  );
};

export default CTASection;
