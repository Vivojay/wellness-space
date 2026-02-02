import React from "react";

const LineageSection = ({ theme }) => {
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
    <section id="lineage" className={`${theme.bg} relative py-40 px-8 md:px-24`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-20">
          <span className={`text-[10px] tracking-[0.4em] ${theme.textMuted}`}>Lineage</span>
          <h2 className="text-5xl md:text-6xl font-light tracking-tight mt-6 font-playwrite-gb-s-headings">The Shaktipat Lineage</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          {lineage.map((item, idx) => (
            <div
              key={idx}
              className="relative aspect-[3/4] overflow-hidden group"
            >
              {/* Image */}
              <img
                src={`http://sreeshaktipatashram.com/upload/${item.img}`}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-sm font-light tracking-wide text-white">{item.name}</p>
                <div className={`mt-2 w-0 h-[1px] ${theme.accent} group-hover:w-16 transition-all duration-500`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LineageSection;
