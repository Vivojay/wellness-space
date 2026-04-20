import React from "react";

import swamiGanga from "@/assets/images/lineage/swami-ganga.jpg";
import naray from "@/assets/images/lineage/naray.jpg";
import yog from "@/assets/images/lineage/yog.jpg";
import vishnu from "@/assets/images/lineage/vishnu.jpg";
import shivom from "@/assets/images/lineage/shivom.jpg";
import sahjananda from "@/assets/images/lineage/sahjananda.jpg";
import gurujiKurti from "@/assets/images/lineage/Guruji Kurti.jpg";
import vartikaShukla from "@/assets/images/lineage/vartika-shukla.jpg";

const LineageSection = ({ theme, bgColor }) => {
  const lineage = [
    { img: swamiGanga, name: "Swami Gangadhar Tirth" },
    { img: naray, name: "Swami Narayandev Tirth" },
    { img: yog, name: "Paramahansa Yogananda" },
    { img: vishnu, name: "Swami Vishnu Tirth" },
    { img: shivom, name: "Swami Shivom Tirth" },
    { img: sahjananda, name: "Swami Sahajananda Tirth" },
    { img: gurujiKurti, name: "Col. T Sreenivasulu (R)" },
    { img: vartikaShukla, name: "Guruji Vartika Shukla" },
  ];

  return (
    <section 
      id="lineage" 
      className="cv-auto relative py-20 md:py-32 lg:py-40 px-4 sm:px-6 md:px-12 lg:px-24 transition-colors duration-500"
      style={{
        backgroundColor: bgColor ?? theme.colors.bg.secondary,
        scrollMarginTop: "128px",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 md:mb-20 text-center">
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
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tight mt-4 md:mt-6 leading-[1.15]">
            <span 
              className="gradient-text"
              style={{
                background: `linear-gradient(165deg, ${theme.text} 0%, ${theme.text} 50%, ${theme.headingSecondary} 50%, ${theme.headingSecondary} 100%)`,
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] sm:gap-0">
          {lineage.map((item, idx) => (
            <div
              key={idx}
              className="lineage-card relative aspect-[3/4] overflow-hidden group"
            >
              <img
                src={item.img}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover hover-zoom"
                style={{ filter: idx === lineage.length - 1 ? "brightness(1.1)" : undefined }}
                loading="lazy"
                decoding="async"
              />
              <div 
                className="lineage-overlay absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.44) 24%, rgba(0,0,0,0.25) 36%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0) 62%)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <p 
                  className="text-xs sm:text-sm font-light tracking-wide text-white"
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
