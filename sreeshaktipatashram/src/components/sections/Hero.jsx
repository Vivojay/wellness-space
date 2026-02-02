import React from "react";

const Hero = ({ scrollProgress, theme, isDark }) => {
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="https://res.cloudinary.com/sidehustle-01/video/upload/v1765290038/telegram_videos/wj0pmxcjppvmd0sfzjau.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* Shadow Overlay (kept for potential effects, can be empty) */}
      <div className="absolute inset-0 pointer-events-none shadow-layer" />

      {/* Hero Content */}
      <div className="relative h-full grid place-items-center">
        <div className="text-center px-8 w-full flex flex-col items-center">

          {/* Logo */}
          <img
            src="/icons/logo-removebg-preview.png"
            alt="logo"
            className="
              mb-2 sm:mb-3 md:mb-4
              w-[6.6em]
              sm:w-[7.8em]
              md:w-[9em]
              h-auto
              -translate-y-2 sm:-translate-y-3 md:-translate-y-4
              drop-shadow-[0_6px_18px_rgba(0,0,0,0.2)]
            "
            style={{
              transform: `translateY(${scrollProgress * 40}px)`,
              opacity: 1 - scrollProgress * 2
            }}
          />

          {/* Heading */}
          <h1
            className="
              relative inline-block
              text-[10vw] md:text-[7rem]
              font-neutral
              tracking-[0.12em]
              leading-none
              mb-6
              mt-6
              text-balance
              font-playwrite-gb-s-headings
              text-center
              text-neutral-300
              drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]
            "
            style={{
              transform: `translateY(${scrollProgress * 60}px)`,
              opacity: 1 - scrollProgress * 2,
              WebkitTextStroke: !isDark ? "0.5px rgba(0, 0, 0, 0.9)" : "0px"
            }}
          >
            <span className="absolute inset-0 -z-10 pointer-events-none">
              <svg
                viewBox="0 0 1000 120"
                preserveAspectRatio="none"
                className="w-[112%] h-[0.9em] absolute left-[-6%] top-[58%]"
                style={{ transform: 'rotate(-2deg)' }}
              >
                <path
                  d="
                    M 0 55
                    Q 170 35 340 50
                    Q 520 70 700 45
                    Q 860 30 1000 42
                    L 1000 85
                    Q 830 95 650 78
                    Q 420 60 220 75
                    Q 90 88 0 82
                    Z
                  "
                  fill="url(#crayonFill)"
                  mask="url(#crayonMask)"
                />
              </svg>
            </span>
            Shaktipat
          </h1>

          {/* Subtitle */}
          <p
            className={`
              text-lg sm:text-xl md:text-2xl
              tracking-[0.12em]
              text-center
              transition-colors duration-500
              ${isDark ? 'text-teal-100' : 'text-teal-200'}
              drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]
              mt-10
              pointer-events-none
            `}
            style={{
              transform: `translateY(${scrollProgress * 100}px)`,
              opacity: 1 - scrollProgress * 2,
            }}
          >
            Discovering the True Self
          </p>

        </div>
      </div>

    </section>
  );
};

export default Hero;
