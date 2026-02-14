import React from "react";

export default function RevealSection({ theme, setCursorVariant }) {
  const guruCards = [
    {
      img: "https://images.weserv.nl/?url=https://drive.google.com/uc?id=16RqiNKrawYBaQyWis9IQbg75Cseqq4oq&w=1200&q=85",
      title: "Paramesti Shaktipat Guru",
      subtitle: "GREAT GRAND SHAKTIPAT GURU",
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
      img: "https://images.weserv.nl/?url=https://drive.google.com/uc?id=1k26h7tuUlQc9_ufFEvthhz4IkLX4dVRu&w=1200&q=85",
      title: "Guru T Sreenivasulu",
      subtitle: "GRAND SHAKTIPAT GURU",
      body: `His Holiness Col. T Sreenivasulu Ji is an alumnus of prestigious institutions like Sainik School Korukonda,
National Defence Academy, and Indian Military Academy. At age fifteen, his passion for the Himalayas and
mountaineering led him to a spiritual journey when he met his master on a train!

Great Grand His Holiness Col. Sreenivasulu is now a Grand Guru in the Kundalini Yoga lineage.
Some of his disciples are Shaktipat Gurus spreading the message worldwide.`,
    },
  ];

  return (
    <section 
      className="cv-auto relative py-40 px-8 md:px-24 transition-colors duration-500"
      style={{ backgroundColor: theme.colors.bg.primary }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Two-toned diagonal title */}
        <div className="mb-16">
          <h2 className="text-5xl md:text-6xl font-light tracking-tight mb-6 relative inline-block">
            <span 
              className="relative gradient-text"
              style={{
                background: `linear-gradient(165deg, ${theme.text} 0%, ${theme.text} 50%, ${theme.accent} 50%, ${theme.accent} 100%)`,
                display: 'inline-block',
                fontFamily: "'Source Sans 3', sans-serif",
                fontWeight: 300,
                letterSpacing: '-0.02em'
              }}
            >
              Notable Gurus
            </span>
          </h2>
          <div className="flex items-center gap-6">
            <div 
              className="w-16 h-[1px]"
              style={{ backgroundColor: theme.accent }}
            />
          </div>
        </div>

        <div className="space-y-12">
          {guruCards.map((g, idx) => (
            <div key={idx} className="grid lg:grid-cols-2 gap-10 lg:gap-0 items-stretch">
              {/* IMAGE */}
              <div className="relative w-full overflow-hidden min-h-[520px]">
                <img
                  src={g.img}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
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
                <div className="-mt-[460px] sm:-mt-[440px] lg:mt-0">
                  <div
                    className="p-10 backdrop-blur-xl lg:min-h-[520px] flex flex-col justify-center shadow-2xl border transition-colors duration-500"
                    style={{
                      background: theme.colors.bg.card,
                      borderColor: theme.border,
                    }}
                    onMouseEnter={() => setCursorVariant?.("hover")}
                    onMouseLeave={() => setCursorVariant?.("default")}
                  >
                    <h3 
                      className="text-2xl font-light tracking-tight mb-2"
                      style={{ 
                        color: theme.text,
                        fontFamily: "'Source Sans 3', sans-serif"
                      }}
                    >
                      {g.title}
                    </h3>
                    <p 
                      className="text-xs tracking-[0.25em] mb-6"
                      style={{ color: theme.textMuted }}
                    >
                      {g.subtitle}
                    </p>
                    <p 
                      className="text-base font-light leading-relaxed whitespace-pre-line"
                      style={{ 
                        color: theme.textSecondary,
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
