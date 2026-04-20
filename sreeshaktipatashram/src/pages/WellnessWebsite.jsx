import React, { Suspense, lazy, useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Hero from "../components/sections/Hero";
import LazyMount from "@/components/LazyMount";
// import useLenisSmooth from "@/utils/lenisSmooth";
import { useOutletContext } from "react-router-dom";

const RevealSection = lazy(() => import("../components/sections/RevealSection"));
const LineageSection = lazy(() => import("../components/sections/LineageSection"));
const OfferingsSection = lazy(() => import("../components/sections/OfferingsSection"));
const TestimonialsSection = lazy(() => import("../components/sections/TestimonialsSection"));
const CTASection = lazy(() => import("../components/sections/CTASection"));
const FAQ = lazy(() => import("../components/sections/FAQ/FAQ"));

const ABOUT_BG_IMAGE_URL =
  "https://res.cloudinary.com/sidehustle-01/image/upload/f_auto,q_auto,w_1920/v1771367921/extended_bg_about_me_j7yco8.jpg";
const ABOUT_PORTRAIT_URL =
  "https://res.cloudinary.com/sidehustle-01/image/upload/f_auto,q_auto,w_900/v1771367922/IMG_20250512_143414_lxpoga.jpg";

function SectionFallback({ bgColor, minHeight }) {
  return <div className="w-full" style={{ minHeight, backgroundColor: bgColor }} aria-hidden />;
}

const FALLBACK_TESTIMONIALS = [
  { author: "Ananya M.", text: "A profound transformation. The energy here is unlike anywhere else.", role: "Seeker" },
  { author: "Rajesh K.", text: "Pure serenity. Every moment spent here deepens my practice.", role: "Practitioner" },
  { author: "Priya S.", text: "Life-changing wisdom delivered with grace and compassion.", role: "Devotee" },
  { author: "Vikram R.", text: "The sanctuary my soul was searching for.", role: "Wanderer" },
  { author: "Meera D.", text: "Authentic spiritual guidance that resonates deeply within.", role: "Believer" },
  { author: "Arjun P.", text: "A space where healing happens naturally and beautifully.", role: "Explorer" },
];

const WellnessWebsite = () => {
  const { isDark, theme, scrollProgress = 0 } = useOutletContext();

  const [testimonials, setTestimonials] = useState([]);

  const sectionPalette = isDark
    ? ["#101511", "#211913", "#12211e"]
    : ["#f4eee4", "#e8dccf", "#dcebe6"];
  const getSectionBg = (index) => sectionPalette[index % sectionPalette.length];


  useEffect(() => {
    let isMounted = true;

    const loadTestimonials = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/testimonials?limit=10`);
        if (!res.ok) throw new Error("Failed to load testimonials");
        const data = await res.json();
        if (isMounted && Array.isArray(data) && data.length) {
          setTestimonials(data.slice(0, 10));
        } else if (isMounted) {
          setTestimonials(FALLBACK_TESTIMONIALS);
        }
      } catch {
        if (isMounted) setTestimonials(FALLBACK_TESTIMONIALS);
      }
    };

    loadTestimonials();
    return () => {
      isMounted = false;
    };
  }, []);

  // Temporarily disable Lenis smooth scrolling
  // useLenisSmooth();

  const setCursorVariant = () => {};

  return (
    <MainLayout theme={theme}>
      {/* Hero Section */}
      <Hero scrollProgress={scrollProgress} theme={theme} isDark={isDark} />

      {/* Sticky Scroll Indicator */}
      <div
        className="fixed bottom-16 right-16 ml-auto mr-16
                  flex flex-col items-center gap-3
                  w-fit z-40 hidden md:flex pointer-events-none"
        style={{ opacity: 1 - scrollProgress * 6 }}
      >
        <div 
          className="w-px h-10 opacity-50"
          style={{ 
            background: `linear-gradient(to top, transparent, ${theme.text}, transparent)` 
          }}
        />
        <span 
          className="text-[10px] tracking-[0.3em] rotate-90"
          style={{ 
            color: theme.textMuted,
            fontFamily: "'Source Sans 3', sans-serif"
          }}
        >
          SCROLL
        </span>
        <div 
          className="w-px h-10 opacity-50"
          style={{ 
            background: `linear-gradient(to top, transparent, ${theme.text}, transparent)` 
          }}
        />
      </div>

      {/* About Me */}
      <section
        className="px-6 md:px-24 pt-32 md:pt-40 pb-0 relative overflow-hidden isolate"
        style={{
          backgroundColor: getSectionBg(0),
          backgroundImage: isDark
            ? `linear-gradient(rgba(12, 18, 14, 0.63), rgba(12, 18, 14, 0.63)), linear-gradient(122deg, rgba(55, 87, 66, 0.34) 0%, rgba(91, 72, 52, 0.27) 46%, rgba(58, 116, 109, 0.3) 100%), linear-gradient(to top, rgba(236, 244, 238, 0.92) 0%, rgba(236, 244, 238, 0.54) 8%, rgba(236, 244, 238, 0.16) 16%, rgba(236, 244, 238, 0) 22%), url(${ABOUT_BG_IMAGE_URL})`
            : `linear-gradient(rgba(255, 255, 255, 0.46), rgba(255, 255, 255, 0.46)), linear-gradient(122deg, rgba(137, 173, 143, 0.43) 0%, rgba(176, 148, 119, 0.34) 46%, rgba(113, 176, 168, 0.4) 100%), linear-gradient(to top, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.64) 8%, rgba(255, 255, 255, 0.18) 16%, rgba(255, 255, 255, 0) 22%), url(${ABOUT_BG_IMAGE_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "92vh",
          minHeight: "760px"
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            opacity: 1,
            backgroundImage: `url(${ABOUT_BG_IMAGE_URL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            // filter: "blur(2px)",
            WebkitMaskImage:
              "radial-gradient(circle at 52% 76%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 12%, rgba(0, 0, 0, 0.3) 24%, rgba(0, 0, 0, 0) 34%)",
            maskImage:
              "radial-gradient(circle at 52% 76%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 12%, rgba(0, 0, 0, 0.3) 24%, rgba(0, 0, 0, 0) 34%)"
          }}
        />
        <div className="absolute top-4 md:top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl z-40 px-4 sm:px-6 md:px-0">
          <div className="text-center">
            <span
              className="text-[10px] tracking-[0.4em] mb-4 block"
              style={{
                color: theme.textMuted,
                fontFamily: "'Source Sans 3', sans-serif",
                fontWeight: 400,
              }}
            >
              ABOUT
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tight leading-[1.15]">
              <span
                className="gradient-text"
                style={{
                  background: `linear-gradient(165deg, ${theme.text} 0%, ${theme.text} 50%, ${theme.headingSecondary} 50%, ${theme.headingSecondary} 100%)`,
                  display: "inline-block",
                  fontFamily: "'Source Sans 3', sans-serif",
                  fontWeight: 300,
                  letterSpacing: "-0.02em",
                  paddingBottom: "2px",
                  lineHeight: "1.15",
                }}
              >
                About Me
              </span>
            </h2>
          </div>
        </div>

        <div
          className="absolute z-[35] left-4 right-4 md:left-24 md:right-auto md:max-w-[38%] top-[38%] md:top-[48%] text-[10px]"
          style={{
            color: theme.textMuted,
            transform: "none"
          }}
        >
          <div
            className="flex flex-col justify-start px-3 py-4 space-y-3 md:pr-8"
            style={{
              minHeight: "180px",
              // backgroundColor: isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.65)",
              backgroundColor: isDark ? "rgba(0, 0, 0, 0)" : "rgba(255, 255, 255, 0)",
              color: isDark ? "#ffffff" : "rgba(12, 14, 18, 0.95)",
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            <p
              className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase"
              style={{ color: isDark ? theme.textMuted : "rgba(12, 14, 18, 0.75)" }}
            >
              Goddess Vartika (Grand Guru)
            </p>
            <p
              className="text-sm sm:text-base leading-relaxed max-w-[48ch]"
              style={{
                color: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(12, 14, 18, 0.95)",
                whiteSpace: "normal",
                wordBreak: "normal",
                overflowWrap: "break-word"
              }}
            >
              Vartika Shukla carries the Siddha Maha Yoga lineage with clarity and compassion, guiding seekers to awaken inner stillness and integrate spiritual practice into everyday life.
            </p>
          </div>
        </div>

        <div
          className="absolute z-[25] left-6 md:left-24 right-6 md:right-24 bottom-0"
          style={{
            fontFamily: "'Source Sans 3', sans-serif",
            color: theme.text
          }}
        >
            <div
              className="relative"
              style={{
                "--portrait-width": "clamp(190px, 34vw, 350px)",
                "--portrait-height": "clamp(280px, 46vw, 500px)",
                "--portrait-frame": "clamp(10px, 1.1vw, 16px)",
                "--portrait-bottom": "clamp(-1%, 0.5vh, 2%)"
              }}
            >
            <div
              className="absolute left-1/2 bottom-[3%] z-0"
              style={{
                width: "calc(var(--portrait-width) + (var(--portrait-frame) * 2))",
                height: "calc(var(--portrait-height) + (var(--portrait-frame) * 2))",
                bottom: "var(--portrait-bottom)",
                transform: "translateX(-50%)",
                padding: "var(--portrait-frame)",
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.16)" : "rgba(0, 0, 0, 0.45)",
                border: isDark
                  ? "1px solid rgba(255, 255, 255, 0.2)"
                  : "1px solid rgba(0, 0, 0, 0.45)",
                boxShadow: isDark
                  ? "0 30px 70px rgba(0, 0, 0, 0.35)"
                  : "0 30px 70px rgba(0, 0, 0, 0.35)",
                borderRadius: "3px"
              }}
            >
              <div
                className="w-full h-full overflow-hidden"
                style={{
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.2)",
                  border: isDark
                    ? "1px solid rgba(255, 255, 255, 0.12)"
                    : "1px solid rgba(0, 0, 0, 0.3)",
                  boxShadow: isDark
                    ? "0 25px 60px rgba(0, 0, 0, 0.35)"
                    : "0 25px 60px rgba(0, 0, 0, 0.2)",
                  borderRadius: "2px"
                }}
              >
                <img
                  src={ABOUT_PORTRAIT_URL}
                  alt="Vartika Shukla"
                  className="block w-full h-full object-contain"
                  style={{
                    filter: "grayscale(1) saturate(0.5) contrast(1.45) brightness(0.82)"
                  }}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
              </div>
            </div>
            <div
              className="relative z-10 w-full whitespace-nowrap leading-[0.85] tracking-[0.05em] text-center overflow-hidden"
              style={{
                fontSize: "clamp(2.5rem, 9.6vw, 10.5rem)",
                fontWeight: 600,
                fontFamily: "'Outfit', sans-serif",
                color: isDark ? theme.text : "#04070b"
              }}
            >
              <span
                aria-hidden
                className="absolute inset-0 z-5 block w-full"
                style={{
                  WebkitTextStroke: isDark ? "1px #000" : "1px #fff",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                  WebkitMaskImage: "linear-gradient(to right, #000 0, #000 calc(50% - (var(--portrait-width) * 0.5)), transparent calc(50% - (var(--portrait-width) * 0.5)), transparent calc(50% + (var(--portrait-width) * 0.5)), #000 calc(50% + (var(--portrait-width) * 0.5)), #000 100%)",
                  maskImage: "linear-gradient(to right, #000 0, #000 calc(50% - (var(--portrait-width) * 0.5)), transparent calc(50% - (var(--portrait-width) * 0.5)), transparent calc(50% + (var(--portrait-width) * 0.5)), #000 calc(50% + (var(--portrait-width) * 0.5)), #000 100%)"
                }}
              >
                Vartika Shukla
              </span>
              <span
                className="relative z-10 block w-full"
                style={{
                  WebkitMaskImage: "linear-gradient(to right, #000 0, #000 calc(50% - (var(--portrait-width) * 0.5)), transparent calc(50% - (var(--portrait-width) * 0.5)), transparent calc(50% + (var(--portrait-width) * 0.5)), #000 calc(50% + (var(--portrait-width) * 0.5)), #000 100%)",
                  maskImage: "linear-gradient(to right, #000 0, #000 calc(50% - (var(--portrait-width) * 0.5)), transparent calc(50% - (var(--portrait-width) * 0.5)), transparent calc(50% + (var(--portrait-width) * 0.5)), #000 calc(50% + (var(--portrait-width) * 0.5)), #000 100%)",
                  WebkitTextFillColor: isDark ? theme.text : "#1a1f24",
                  color: isDark ? theme.text : "#1a1f24"
                }}
              >
                Vartika Shukla
              </span>
              <span
                aria-hidden
                className="absolute inset-0 z-15 block w-full text-grain-base"
                style={{
                  WebkitMaskImage: "linear-gradient(to right, #000 0, #000 calc(50% - (var(--portrait-width) * 0.5)), transparent calc(50% - (var(--portrait-width) * 0.5)), transparent calc(50% + (var(--portrait-width) * 0.5)), #000 calc(50% + (var(--portrait-width) * 0.5)), #000 100%)",
                  maskImage: "linear-gradient(to right, #000 0, #000 calc(50% - (var(--portrait-width) * 0.5)), transparent calc(50% - (var(--portrait-width) * 0.5)), transparent calc(50% + (var(--portrait-width) * 0.5)), #000 calc(50% + (var(--portrait-width) * 0.5)), #000 100%)",
                  mixBlendMode: isDark ? "multiply" : "screen",
                  opacity: isDark ? 0.9 : 0.7,
                  WebkitTextStroke: "0 transparent"
                }}
              >
                Vartika Shukla
              </span>
              <span
                aria-hidden
                className="absolute inset-0 z-20 block w-full"
                style={{
                  opacity: isDark ? 0.1 : 0.45,
                  WebkitMaskImage: "linear-gradient(to right, transparent 0, transparent calc(50% - (var(--portrait-width) * 0.5)), #000 calc(50% - (var(--portrait-width) * 0.5)), #000 calc(50% + (var(--portrait-width) * 0.5)), transparent calc(50% + (var(--portrait-width) * 0.5)), transparent 100%)",
                  maskImage: "linear-gradient(to right, transparent 0, transparent calc(50% - (var(--portrait-width) * 0.5)), #000 calc(50% - (var(--portrait-width) * 0.5)), #000 calc(50% + (var(--portrait-width) * 0.5)), transparent calc(50% + (var(--portrait-width) * 0.5)), transparent 100%)",
                  WebkitTextStroke: "0 transparent"
                }}
              >
                Vartika Shukla
              </span>
              <span aria-hidden className="absolute inset-0 z-30 block w-full text-grain">
                Vartika Shukla
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Reveal Section - Notable Gurus */}
      <LazyMount minHeight={760}>
        <Suspense fallback={<SectionFallback bgColor={getSectionBg(1)} minHeight={760} />}>
          <RevealSection
            theme={theme}
            setCursorVariant={setCursorVariant}
            isDark={isDark}
            bgColor={getSectionBg(1)}
          />
        </Suspense>
      </LazyMount>

      {/* Lineage Section */}
      <div data-scroll-anchor="lineage">
        <LazyMount minHeight={640}>
          <Suspense fallback={<SectionFallback bgColor={getSectionBg(2)} minHeight={640} />}>
            <LineageSection theme={theme} bgColor={getSectionBg(2)} />
          </Suspense>
        </LazyMount>
      </div>

      {/* Offerings */}
      <div data-scroll-anchor="offerings">
        <LazyMount minHeight={720}>
          <Suspense fallback={<SectionFallback bgColor={getSectionBg(0)} minHeight={720} />}>
            <OfferingsSection
              theme={theme}
              isDark={isDark}
              setCursorVariant={setCursorVariant}
              bgColor={getSectionBg(0)}
            />
          </Suspense>
        </LazyMount>
      </div>

      {/* Testimonials */}
      <LazyMount minHeight={620}>
        <Suspense fallback={<SectionFallback bgColor={getSectionBg(1)} minHeight={620} />}>
          <TestimonialsSection
            theme={theme}
            testimonials={testimonials}
            setCursorVariant={setCursorVariant}
            bgColor={getSectionBg(1)}
          />
        </Suspense>
      </LazyMount>

      {/* CTA */}
      <LazyMount minHeight={360}>
        <Suspense fallback={<SectionFallback bgColor={getSectionBg(2)} minHeight={360} />}>
          <CTASection theme={theme} setCursorVariant={setCursorVariant} isDark={isDark} bgColor={getSectionBg(2)} />
        </Suspense>
      </LazyMount>

      {/* FAQs */}
      <div data-scroll-anchor="faqs">
        <LazyMount minHeight={620}>
          <Suspense fallback={<SectionFallback bgColor={getSectionBg(0)} minHeight={620} />}>
            <FAQ theme={theme} isDark={isDark} bgColor={getSectionBg(0)} />
          </Suspense>
        </LazyMount>
      </div>


      <style>{`
        @font-face {
          font-family: 'PetitFormal';
          src: url('/fonts/petit-formal-script.regular.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: 'ModernSansLight';
          src: url('/fonts/ModernSans-Light.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .font-petitformal {
          font-family: 'PetitFormal', serif;
        }

        .font-modernsanslight {
          font-family: 'ModernSansLight', serif;
          font-weight: bold;
        }

        .text-grain {
          color: transparent;
          -webkit-text-fill-color: transparent;
          background-image:
            linear-gradient(135deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.06) 45%, rgba(0, 0, 0, 0.18) 100%),
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/></filter><rect width='180' height='180' filter='url(%23n)' opacity='0.9'/></svg>");
          background-size: 240px 240px, 140px 140px;
          background-position: 0 0, 12px 8px;
          background-repeat: repeat;
          -webkit-background-clip: text;
          background-clip: text;
          mix-blend-mode: multiply;
          opacity: 0.35;
          pointer-events: none;
        }

        .text-grain-base {
          -webkit-text-fill-color: transparent;
          color: transparent;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320' viewBox='0 0 320 320'><filter id='velvet'><feTurbulence type='fractalNoise' baseFrequency='0.008' numOctaves='4' seed='12' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feGaussianBlur stdDeviation='0.45'/><feComponentTransfer><feFuncR type='gamma' amplitude='1' exponent='1.8' offset='0'/><feFuncG type='gamma' amplitude='1' exponent='1.8' offset='0'/><feFuncB type='gamma' amplitude='1' exponent='1.8' offset='0'/></feComponentTransfer></filter><rect width='320' height='320' filter='url(%23velvet)' opacity='0.85'/></svg>");
          background-size: 200px 200px;
          background-position: 0 0;
          background-repeat: repeat;
          -webkit-background-clip: text;
          background-clip: text;
          pointer-events: none;
        }

        .font-petitformal {
          font-family: "Playwrite GB S", cursive;
          font-optical-sizing: auto;
          font-style: normal;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-400px * ${testimonials.length} - 24px * ${testimonials.length})); }
        }
        @keyframes marqueeReverse {
          0% { transform: translateX(calc(-400px * ${testimonials.length} - 24px * ${testimonials.length})); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .animate-marquee-reverse {
          animation: marqueeReverse 55s linear infinite;
        }
        .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
        @media (pointer: coarse) {
          * {
            cursor: auto;
          }
        }
        .will-change-transform {
          will-change: transform;
        }

        @keyframes tealPulse {
          0% {
            background-color: rgba(13, 148, 136, 0.12);
          }
          50% {
            background-color: rgba(134, 255, 245, 0.6);
          }
          100% {
            background-color: rgba(13, 148, 136, 0.12);
          }
        }

        @keyframes tealPulseDark {
          0% {
            background-color: rgba(45, 212, 191, 0.10);
          }
          50% {
            background-color: rgba(45, 212, 191, 0.22);
          }
          100% {
            background-color: rgba(45, 212, 191, 0.10);
          }
        }

        .pulse-bg {
          animation: tealPulse 3.2s ease-in-out infinite;
        }

        .pulse-bg-dark {
          animation: tealPulseDark 3.2s ease-in-out infinite;
        }

        @keyframes arrowFloat {
          0%   { transform: translateY(0); opacity: 0.85; }
          50%  { transform: translateY(3px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.85; }
        }

        .arrow-locked {
          animation: arrowFloat 2.8s ease-in-out infinite;
        }

        .arrow-hover {
          transform: translateY(2px);
        }

        .crayon-z {
          position: absolute;
          left: -6%;
          width: 112%;
          height: 0.72em;
          top: 58%;

          background-image: url('../../textures/crayon-grain.png');
          background-repeat: repeat;
          background-size: 64px 64px;
          opacity: 0.95;

          clip-path: polygon(
            0% 40%,
            32% 30%,
            64% 46%,
            100% 34%,
            100% 70%,
            68% 78%,
            36% 62%,
            0% 74%
          );

          transform: rotate(-2.2deg) skewX(-1deg);
        }

        .shadow-layer {
          background-image: url('../../textures/soft-window-shadow.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;

          mix-blend-mode: multiply;
          opacity: 0.35;

          filter: blur(0.4px) contrast(1.05);
          transform: scale(1.05);
        }

        @keyframes shadowFloat {
          0%   { transform: scale(1.05) translate(0, 0); }
          50%  { transform: scale(1.05) translate(-1.5%, 1%); }
          100% { transform: scale(1.05) translate(0, 0); }
        }

        .shadow-layer {
          animation: shadowFloat 18s ease-in-out infinite;
        }

        .feed-fade {
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
        }

      `}</style>
    </MainLayout>
  );
};

export default WellnessWebsite;
