import React from "react";

export default function RevealSection({ theme, setCursorVariant, bgColor, isDark }) {
  const cardBackgrounds = [
    isDark
      ? "linear-gradient(155deg, #5c422e 0%, #7a5940 100%)"
      : `linear-gradient(155deg, ${theme.colors.bg.card} 0%, ${theme.accentSecondary}33 100%)`,
    isDark
      ? "linear-gradient(155deg, #7b5b42 0%, #503929 100%)"
      : `linear-gradient(155deg, ${theme.accentSecondary}2b 0%, ${theme.colors.bg.card} 100%)`,
  ];

  const guruCards = [
    {
      img: "https://images.weserv.nl/?url=https://drive.google.com/uc?id=16RqiNKrawYBaQyWis9IQbg75Cseqq4oq&w=960&q=75&output=webp",
      title: "Swami Sahajananda Tirth",
      subtitle: "Shaktipat Guru",
      body: `Born in a traditional Indian family, Swami Sahajananda Tirth was devotional from his young age.
During his spiritual journey, His Holiness met many spiritual masters such as Sri Aurobindo,
Ramana Maharshi of Thiruvannamalai, and Swami Bhaskarananda Tirth, spending time with them in
meditating and sadhan. Meeting his master Swami Shivom Tirth Maharaj was an auspicious event
for His Holiness as He was initiated into the Shaktipat Order and Sanyas tradition.

His Holiness introduced the Shaktipat Order to the South Indian state of Andhra Pradesh.
To bring awareness, His Holiness published many valuable books and initiated disciples
in the Siddha Maha Yoga tradition.`,
    },
    {
      img: "https://images.weserv.nl/?url=https://drive.google.com/uc?id=1k26h7tuUlQc9_ufFEvthhz4IkLX4dVRu&w=960&q=75&output=webp",
      title: "Col. T Sreenivasulu (R)",
      subtitle: "Shaktipat Guru",
      body: `His Holiness Col. T Sreenivasulu Ji is an alumnus of prestigious institutions like Sainik School Korukonda,
National Defence Academy, and Indian Military Academy. At age fifteen, his passion for the Himalayas and
mountaineering led him to a spiritual journey when he met his master on a train!

Great Grand His Holiness Col. Sreenivasulu is now a Grand Guru in the Kundalini Yoga lineage.
Some of his disciples are Shaktipat Gurus spreading the message worldwide.`,
    },
  ];

  const cardTitleColor = isDark ? "#f6f2ea" : "#111111";
  const cardMetaColor = isDark ? "rgba(246, 240, 229, 0.72)" : "rgba(17, 17, 17, 0.62)";
  const cardBodyColor = isDark ? "rgba(250, 245, 236, 0.9)" : "#1a1a1a";

  return (
    <section 
      className="cv-auto relative py-40 px-8 md:px-24 transition-colors duration-500"
      style={{ backgroundColor: bgColor ?? theme.colors.bg.primary }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Two-toned diagonal title */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tight mb-6 relative inline-block">
            <span 
              className="relative gradient-text"
              style={{
                background: `linear-gradient(165deg, ${theme.text} 0%, ${theme.text} 50%, ${theme.headingSecondary} 50%, ${theme.headingSecondary} 100%)`,
                display: 'inline-block',
                fontFamily: "'Source Sans 3', sans-serif",
                fontWeight: 300,
                letterSpacing: '-0.02em'
              }}
            >
              Notable Gurus
            </span>
          </h2>
        </div>

        <div className="space-y-12">
          {guruCards.map((g, idx) => (
            <div key={idx} className="grid lg:grid-cols-2 gap-0 items-stretch">
              {/* IMAGE */}
              <div className="relative w-full overflow-hidden min-h-[360px] sm:min-h-[420px] lg:min-h-[520px] group">
                <img
                  src={g.img}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover hover-zoom"
                  loading="lazy"
                  decoding="async"
                />
                <div 
                  className="absolute inset-0 lg:hidden"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
                />
              </div>

              {/* CARD */}
              <div className="relative">
                <div className="mt-0 lg:mt-0 lg:-mt-[460px]">
                  <div
                    className="p-8 sm:p-10 backdrop-blur-0 md:backdrop-blur-sm lg:backdrop-blur-xl lg:min-h-[520px] flex flex-col justify-center shadow-2xl border transition-colors duration-500"
                    style={{
                      background: cardBackgrounds[idx % cardBackgrounds.length],
                      borderColor: isDark ? "transparent" : theme.border,
                      backdropFilter: isDark ? "none" : undefined,
                    }}
                    onMouseEnter={() => setCursorVariant?.("hover")}
                    onMouseLeave={() => setCursorVariant?.("default")}
                  >
                    <h3 
                      className="text-2xl font-light tracking-tight mb-2"
                      style={{ 
                        color: cardTitleColor,
                        fontFamily: "'Source Sans 3', sans-serif"
                      }}
                    >
                      {g.title}
                    </h3>
                    <p 
                      className="text-xs tracking-[0.25em] mb-6"
                      style={{ color: cardMetaColor }}
                    >
                      {g.subtitle}
                    </p>
                    <p 
                      className="text-base font-light leading-relaxed whitespace-pre-line"
                      style={{ 
                        color: cardBodyColor,
                        fontFamily: "'Source Sans 3', sans-serif"
                      }}
                    >
                      {g.body}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
