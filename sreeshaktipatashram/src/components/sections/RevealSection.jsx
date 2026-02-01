import React from "react";

const RevealSection = ({ theme, setCursorVariant }) => {
  return (
    <section className="relative py-40 px-8 md:px-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-24 items-start">
          {/* Left: Heading */}
          <div>
            <h2 className="text-5xl md:text-6xl font-light tracking-tight mb-6 whitespace-nowrap font-petitformal">
              Notable Gurus
            </h2>
            <div className="flex items-center gap-6">
              <div className={`w-16 h-[1px] ${theme.accent}`} />
              {/* <span className={`text-[10px] tracking-[0.3em] ${theme.textMuted}`}>
                PATASHRAM
              </span> */}
            </div>
          </div>

          {/* Right: Cards */}
          <div className="grid gap-10">
            {/* Card 1 */}
            <div className={`${theme.cardBg} border ${theme.border} p-10 backdrop-blur-xl`}>
              <h3 className="text-2xl font-light tracking-tight mb-2">
                Paramesti Shaktipat Guru
              </h3>
              <p className={`text-xs tracking-[0.25em] ${theme.textMuted} mb-6`}>
                GREAT GRAND SHAKTIPAT GURU
              </p>
              <p className={`text-base font-light leading-relaxed ${theme.textMuted}`}>
                Born in a traditional Indian family, Swami Sahajananda Tirth was devotional from his young age.
                During his spiritual journey, His Holiness met many spiritual masters such as Sri Aurobindo,
                Ramana Maharshi of Thiruvannamalai, and Swami Bhaskarananda Tirth, spending time with them in
                meditating and sadhan. Meeting his master Swami Shivom Tirth Maharaj was an auspicious event
                for His Holiness as He was initiated into the Shaktipat Order and Sanyas tradition.
                <br /><br />
                His Holiness introduced the Shaktipat Order to the South Indian state of Andhra Pradesh.
                To bring awareness, His Holiness published many valuable books and initiated disciples
                in the Siddha Maha Yoga tradition.
              </p>
            </div>

            {/* Card 2 */}
            <div className={`${theme.cardBg} border ${theme.border} p-10 backdrop-blur-xl`}>
              <h3 className="text-2xl font-light tracking-tight mb-2">
                Guru T Sreenivasulu
              </h3>
              <p className={`text-xs tracking-[0.25em] ${theme.textMuted} mb-6`}>
                GRAND SHAKTIPAT GURU
              </p>
              <p className={`text-base font-light leading-relaxed ${theme.textMuted} opacity-60`}>
                His Holiness Col. T Sreenivasulu Ji is an alumnus of prestigious institutions like Sainik School Korukonda,
                National Defence Academy, and Indian Military Academy. At age fifteen, his passion for the Himalayas and
                mountaineering led him to a spiritual journey when he met his master on a train!
                <br /><br />
                Great Grand His Holiness Col. Sreenivasulu is now a Grand Guru in the Kundalini Yoga lineage. 
                Some of his disciples are Shaktipat Gurus spreading the message worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RevealSection;
