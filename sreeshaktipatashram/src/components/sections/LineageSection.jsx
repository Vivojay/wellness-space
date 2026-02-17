import React from "react";

const LineageSection = ({ theme, bgColor }) => {
  const lineage = [
    { img: 'SWAMI_GANGADHAR_TIRTHA.png', name: 'Swami Gangadhar Tirtha' },
    { img: 'SWAMI_NARAYANDEV_TIRTHA.png', name: 'Swami Narayandev Tirtha' },
    { img: 'YOGANANDA.png', name: 'Paramahansa Yogananda' },
    { img: 'SWAMI_VISHNU_TIRTHA.png', name: 'Swami Vishnu Tirtha' },
    { img: 'SWAMI_SHIVOM_TIRTHA.png', name: 'Swami Shivom Tirtha' },
    { img: 'SWAMI_SAHAJANANDA_TIRTHA.png', name: 'Swami Sahajananda Tirtha' },
    { img: 'T_SREENIVASULU.png', name: 'Guruji T Sreenivasulu' },
    { img: 'Goddess_Vartika.png', name: 'Guruji Vartika Shukla' }
  ];

  return (
    <section 
      id="lineage" 
      className="cv-auto relative py-40 px-8 md:px-24 transition-colors duration-500"
      style={{ backgroundColor: bgColor ?? theme.colors.bg.secondary }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-20">
          <span 
            className="text-[10px] tracking-[0.4em]"
            style={{ 
              color: theme.textMuted,
              fontFamily: "'Source Sans 3', sans-serif",
              fontWeight: 400
            }}
          >
            LINEAGE
          </span>
          <h2 className="text-5xl md:text-6xl font-light tracking-tight mt-6 leading-[1.15]">
            <span 
              className="gradient-text"
              style={{
                background: `linear-gradient(165deg, ${theme.text} 0%, ${theme.text} 50%, ${theme.accent} 50%, ${theme.accent} 100%)`,
                display: 'inline-block',
                fontFamily: "'Source Sans 3', sans-serif",
                fontWeight: 300,
                letterSpacing: '-0.02em',
                paddingBottom: '2px',
                lineHeight: '1.15'
              }}
            >
              The Shaktipat Lineage
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          {lineage.map((item, idx) => (
            <div
              key={idx}
              className="relative aspect-[3/4] overflow-hidden group"
            >
              <img
                src={`https://sreeshaktipatashram.com/upload/${item.img}`}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover hover-zoom"
                loading="lazy"
                decoding="async"
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.4), transparent)'
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p 
                  className="text-sm font-light tracking-wide text-white"
                  style={{ 
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    fontFamily: "'Source Sans 3', sans-serif"
                  }}
                >
                  {item.name}
                </p>
                <div
                  className="mt-2 h-[2px] hover-underline"
                  style={{ backgroundColor: theme.accent }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LineageSection;
