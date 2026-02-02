import React from "react";

export default function RevealSection({ theme, setCursorVariant }) {
  const guruCards = [
    {
      img: "https://dhunwellness.com/cdn/shop/files/Sound_healing_room.jpg?v=1751348144&width=1920",
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
      img: "https://dhunwellness.com/cdn/shop/files/Sound_healing_room.jpg?v=1751348144&width=1920",
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
    <section className="relative py-40 px-8 md:px-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="text-5xl md:text-6xl font-light tracking-tight mb-6 whitespace-nowrap font-petitformal">
            Notable Gurus
          </h2>
          <div className="flex items-center gap-6">
            <div className={`w-16 h-[1px] ${theme.accent}`} />
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
                />

                {/* ✅ On small screens, overlay veil to help readability */}
                <div className="absolute inset-0 lg:hidden bg-black/45" />
              </div>

              {/* CARD */}
              <div className="relative">
                {/* ✅ Mobile overlay: card sits on top of image */}
                <div className="
                  lg:static lg:translate-y-0
                  -mt-[460px] sm:-mt-[440px]
                  lg:mt-0
                ">
                  <div
                    className={`
                      ${theme.cardBg} border ${theme.border}
                      p-10 backdrop-blur-xl
                      lg:min-h-[520px] flex flex-col justify-center
                      shadow-2xl
                    `}
                    style={{
                      // ✅ force “overlay look” on mobile: translucent card so image shows through
                      background: "rgba(0,0,0,0.35)",
                    }}
                    onMouseEnter={() => setCursorVariant?.("hover")}
                    onMouseLeave={() => setCursorVariant?.("default")}
                  >
                    <h3 className="text-2xl font-light tracking-tight mb-2 text-white">
                      {g.title}
                    </h3>
                    <p className="text-xs tracking-[0.25em] text-white/70 mb-6">
                      {g.subtitle}
                    </p>
                    <p className="text-base font-light leading-relaxed text-white/75 whitespace-pre-line">
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
