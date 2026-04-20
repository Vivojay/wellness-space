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


const TestimonialsSection = ({ theme, testimonials, setCursorVariant, bgColor }) => {
  const topTestimonials = testimonials.filter((_, idx) => idx % 2 === 0);
  const bottomTestimonials = testimonials.filter((_, idx) => idx % 2 === 1);
  return (
    <section 
      className="cv-auto py-28 overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: bgColor ?? theme.colors.bg.secondary }}
    >
      {/* Header */}
      <div className="text-center mb-24">
        <span
          className="text-[10px] tracking-[0.45em] uppercase mb-6 block"
          style={{ 
            color: theme.textMuted,
            fontFamily: "'Source Sans 3', sans-serif",
            fontWeight: 400
          }}
        >
          VOICES OF TRANSFORMATION
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tight relative inline-block">
            <span 
              className="gradient-text"
              style={{
                background: `linear-gradient(165deg, ${theme.text} 0%, ${theme.text} 50%, #ef4444 50%, #ef4444 100%)`,
                display: 'inline-block',
                fontFamily: "'Source Sans 3', sans-serif",
                fontWeight: 300,
                letterSpacing: '-0.02em'
            }}
          >
            Testimonials
          </span>
        </h2>
      </div>

      {/* Marquee */}
      <div className="space-y-10">
        <div className="hidden md:flex animate-marquee gap-8">
          {[...testimonials, ...testimonials, ...testimonials].map((t, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setCursorVariant("hover")}
              onMouseLeave={() => setCursorVariant("default")}
              className="relative flex-shrink-0 w-[420px] px-10 pt-14 pb-10 flex flex-col min-h-[100px] border transition-colors duration-500"
              style={{
                backgroundColor: theme.colors.bg.card,
                borderColor: theme.border
              }}
            >
            {/* Decorative quote mark */}
            <QuoteMark
              className="
                absolute -top-3 -left-5
                w-14
                opacity-45
                rotate-[6deg]
                blur-[0.3px]
                pointer-events-none
              "
              fillColor={theme.textMuted}
            />

            {/* Testimonial text */}
            <p
              className="text-[15px] font-light leading-[1.8] mb-10"
              style={{
                color: theme.text,
                fontFamily: "'Source Sans 3', sans-serif"
              }}
            >
              {t.text}
            </p>

            {/* Footer */}
            <div className="mt-auto flex items-center justify-between">
              <div>
                <p 
                  className="text-sm font-medium tracking-wide"
                  style={{ 
                    color: theme.text,
                    fontFamily: "'Source Sans 3', sans-serif"
                  }}
                >
                  {t.author}
                </p>
                <p 
                  className="text-xs mt-1"
                  style={{ color: theme.textMuted }}
                >
                  {t.role}
                </p>
              </div>

              <div 
                className="w-12 h-px"
                style={{ backgroundColor: theme.border }}
              />
            </div>

            </div>
          ))}
        </div>
        <div className="flex md:hidden animate-marquee gap-8">
          {[...topTestimonials, ...topTestimonials, ...topTestimonials].map((t, idx) => (
            <div
              key={`mobile-top-${idx}`}
              onMouseEnter={() => setCursorVariant("hover")}
              onMouseLeave={() => setCursorVariant("default")}
              className="relative flex-shrink-0 w-[420px] px-6 pt-10 pb-8 md:px-10 md:pt-14 md:pb-10 flex flex-col min-h-[200px] md:min-h-[100px] border transition-colors duration-500"
              style={{
                backgroundColor: theme.colors.bg.card,
                borderColor: theme.border
              }}
            >
              <QuoteMark
                className="
                  absolute -top-3 -left-5
                  w-14
                  opacity-45
                  rotate-[6deg]
                  blur-[0.3px]
                  pointer-events-none
                "
                fillColor={theme.textMuted}
              />

              <p
                className="text-[15px] font-light leading-[1.8] mb-10"
                style={{
                  color: theme.text,
                  fontFamily: "'Source Sans 3', sans-serif"
                }}
              >
                {t.text}
              </p>

              <div className="mt-auto flex items-center justify-between">
                <div>
                  <p 
                    className="text-sm font-medium tracking-wide"
                    style={{ 
                      color: theme.text,
                      fontFamily: "'Source Sans 3', sans-serif"
                    }}
                  >
                    {t.author}
                  </p>
                  <p 
                    className="text-xs mt-1"
                    style={{ color: theme.textMuted }}
                  >
                    {t.role}
                  </p>
                </div>

                <div 
                  className="w-12 h-px"
                  style={{ backgroundColor: theme.border }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex md:hidden animate-marquee-reverse gap-8">
          {[...bottomTestimonials, ...bottomTestimonials, ...bottomTestimonials].map((t, idx) => (
            <div
              key={`reverse-${idx}`}
              onMouseEnter={() => setCursorVariant("hover")}
              onMouseLeave={() => setCursorVariant("default")}
              className="relative flex-shrink-0 w-[420px] px-6 pt-10 pb-8 md:px-10 md:pt-14 md:pb-10 flex flex-col min-h-[200px] md:min-h-[100px] border transition-colors duration-500"
              style={{
                backgroundColor: theme.colors.bg.card,
                borderColor: theme.border
              }}
            >
              <QuoteMark
                className="
                  absolute -top-3 -left-5
                  w-14
                  opacity-45
                  rotate-[6deg]
                  blur-[0.3px]
                  pointer-events-none
                "
                fillColor={theme.textMuted}
              />

              <p
                className="text-[15px] font-light leading-[1.8] mb-10"
                style={{
                  color: theme.text,
                  fontFamily: "'Source Sans 3', sans-serif"
                }}
              >
                {t.text}
              </p>

              <div className="mt-auto flex items-center justify-between">
                <div>
                  <p 
                    className="text-sm font-medium tracking-wide"
                    style={{ 
                      color: theme.text,
                      fontFamily: "'Source Sans 3', sans-serif"
                    }}
                  >
                    {t.author}
                  </p>
                  <p 
                    className="text-xs mt-1"
                    style={{ color: theme.textMuted }}
                  >
                    {t.role}
                  </p>
                </div>

                <div 
                  className="w-12 h-px"
                  style={{ backgroundColor: theme.border }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
