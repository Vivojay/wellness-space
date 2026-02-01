import React from "react";

const QuoteMark = ({ className = "", fillColor }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 320 320"
    className={className}
    aria-hidden="true"
    style={fillColor ? { color: fillColor } : undefined}
  >
    <path
      d="M82.87 129.48S77.32 98.96 114.31 74c-12.95 0-89.7 30.52-89.7 113.74 0 33.09 27.59 59.73 61.01 58.19 29.85-1.37 54.07-25.6 55.44-55.45 1.54-33.41-25.1-61-58.19-61zm154.26 0S231.58 98.96 268.57 74c-12.95 0-89.7 30.52-89.7 113.74 0 33.09 27.58 59.73 61.01 58.19 29.85-1.37 54.07-25.6 55.44-55.45 1.54-33.41-25.1-61-58.19-61z"
      fill="currentColor"
    />
  </svg>
);


const TestimonialsSection = ({ theme, testimonials, setCursorVariant }) => {
  return (
    <section className="py-28 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-24">
        <span
          className={`text-[10px] tracking-[0.45em] uppercase ${theme.textMuted}`}
        >
          Voices of Transformation
        </span>
      </div>

      {/* Marquee */}
      <div className="flex animate-marquee gap-8">
        {[...testimonials, ...testimonials, ...testimonials].map((t, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setCursorVariant("hover")}
            onMouseLeave={() => setCursorVariant("default")}
            className={`
              relative flex-shrink-0 w-[420px]
              ${theme.cardBg}
              border ${theme.border}
              px-10 pt-14 pb-10
              flex flex-col min-h-[100px]
            `}
          >
            {/* Decorative quote mark */}
            <QuoteMark
              className="
                absolute -top-3 -left-5
                w-14
                opacity-45
                rotate-[6deg]
                blur-[0.3px]
                text-neutral-400
                pointer-events-none
              "
              fillColor="#3d1818ff"
            />

            {/* Testimonial text */}
            <p
              className={`
                text-[15px]
                font-light
                leading-[1.8]
                mb-10
                ${theme.text}
              `}
            >
              {t.text}
            </p>

            {/* Footer */}
            <div className="mt-auto flex items-center justify-between">
              <div>
                <p className="text-sm font-medium tracking-wide">
                  {t.author}
                </p>
                <p className={`text-xs mt-1 ${theme.textMuted}`}>
                  {t.role}
                </p>
              </div>

              <div className={`w-12 h-px ${theme.border}`} />
            </div>

          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
