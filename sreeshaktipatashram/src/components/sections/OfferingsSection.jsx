import React from "react";

const OfferingsSection = ({ theme, isDark, setCursorVariant }) => {
  const offerings = [
    { 
      title: 'Read', 
      desc: 'Read and understand why this path is called Siddha Maha Yoga. Download all information freely. Click here for free PDFs, Audio Books and Videos.', 
      img: 'photo-1506126613408-eca07ce68773' 
    },
    { 
      title: 'Reflect', 
      desc: 'Contemplate on the profound yet, simple nature of this Yoga path.', 
      img: 'photo-1599901860904-17e6ed7083a0' 
    },
    { 
      title: 'Realize', 
      desc: 'You will quickly learn that this path of Yoga is very unique!. Shaktipat initiation is free. Click here to contact Shaktipat Guru Vartika Shukla in our lineage.', 
      img: 'photo-1544367567-0f2fcb009e0b' 
    }
  ];

  return (
    <section 
      id="offerings" 
      className="cv-auto py-40 px-8 md:px-24 transition-colors duration-500 relative"
      style={{ backgroundColor: theme.colors.bg.primary }}
    >
      {/* Subtle RED accent overlay for this section */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top right, rgba(239, 68, 68, 0.03) 0%, transparent 50%)`,
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <span 
            className="text-[10px] tracking-[0.4em] mb-6 block"
            style={{ 
              color: theme.textMuted,
              fontFamily: "'Source Sans 3', sans-serif",
              fontWeight: 400
            }}
          >
            OUR OFFERINGS
          </span>
          <h2 className="text-5xl md:text-6xl font-light tracking-tight leading-[1.15]">
            <span 
              className="gradient-text"
              style={{
                background: `linear-gradient(165deg, ${theme.text} 0%, ${theme.text} 50%, #ef4444 50%, #ef4444 100%)`,
                display: 'inline-block',
                fontFamily: "'Source Sans 3', sans-serif",
                fontWeight: 300,
                letterSpacing: '-0.02em',
                paddingBottom: '2px',
                lineHeight: '1.15'
              }}
            >
              The Inner Journey
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-0">
          {offerings.map((item, idx) => (
            <div
              key={idx}
              className="group"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <div className="group relative h-[450px] w-full overflow-hidden">
                {/* Image */}
                <img
                  src={`https://images.unsplash.com/${item.img}?w=600&h=800&fit=crop&q=80`}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover hover-zoom"
                  style={{ filter: 'contrast(0.95) saturate(0.9)' }}
                  loading="lazy"
                  decoding="async"
                />

                {/* Dark-to-transparent veil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/70 to-transparent" />

                {/* Text overlay */}
                <div
                  className="absolute top-60 left-0 right-0 p-8
                             transition-all duration-700
                             opacity-90 group-hover:opacity-100
                             group-hover:-translate-y-2"
                >
                  <h3 
                    className="text-2xl font-light tracking-wide text-white mb-3"
                    style={{ 
                      textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                      fontFamily: "'Source Sans 3', sans-serif"
                    }}
                  >
                    {item.title}
                  </h3>
                  <p 
                    className="text-sm font-light leading-relaxed text-white/85 max-w-[90%]"
                    style={{ 
                      textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                      fontFamily: "'Source Sans 3', sans-serif"
                    }}
                  >
                    {item.desc}
                  </p>

                  <div
                    className="mt-5 h-[2px] hover-underline"
                    style={{ backgroundColor: '#ef4444' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OfferingsSection;
