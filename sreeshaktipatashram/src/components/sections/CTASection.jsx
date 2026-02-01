import React, { useState } from "react";

const CTASection = ({ theme, setCursorVariant }) => {
  const enterEase = "cubic-bezier(0.6, 0.05, 0.2, 0.95)";
  const exitEase  = "cubic-bezier(0.8, 0, 0.3, 1)";
  const [hovered, setHovered] = useState(false);

  return (
    <section className="relative py-40 px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-6xl md:text-7xl font-light tracking-tight leading-tight mb-10 font-petitformal">
          Begin Your Journey
        </h2>
        <p className={`text-lg font-light ${theme.textMuted} mb-12`}>
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
          className="relative px-16 py-5 bg-[#24bdbf]/40 hover:scale-105 transition-transform duration-300"
          style={{ border: "none", outline: "none" }}
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
              stroke="tan"
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

          <span className="relative z-10 tracking-[0.2em] text-sm">
            Book Now
          </span>
        </button>
      </div>
    </section>
  );
};

export default CTASection;
