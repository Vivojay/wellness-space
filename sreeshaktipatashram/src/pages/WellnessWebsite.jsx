import { Menu, Minus, ArrowRight, Circle, Sun, Moon, MessageCircle, Send, X } from 'lucide-react';
import { FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MainLayout from "../layouts/MainLayout";
import Hero from "../components/sections/Hero";
import RevealSection from "../components/sections/RevealSection";
import LineageSection from "../components/sections/LineageSection";
import OfferingsSection from "../components/sections/OfferingsSection";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import CTASection from "../components/sections/CTASection";
// import useLenisSmooth from "@/utils/lenisSmooth";
import FAQ from "../components/sections/FAQ/FAQ";
import { useOutletContext } from "react-router-dom";

const WellnessWebsite = () => {
  const { isDark, theme, scrollProgress = 0 } = useOutletContext();

  const [currentSlide, setCurrentSlide] = useState(0);

  const [testimonials, setTestimonials] = useState([]);
  const fallbackTestimonials = [
    { author: 'Ananya M.', text: 'A profound transformation. The energy here is unlike anywhere else.', role: 'Seeker' },
    { author: 'Rajesh K.', text: 'Pure serenity. Every moment spent here deepens my practice.', role: 'Practitioner' },
    { author: 'Priya S.', text: 'Life-changing wisdom delivered with grace and compassion.', role: 'Devotee' },
    { author: 'Vikram R.', text: 'The sanctuary my soul was searching for.', role: 'Wanderer' },
    { author: 'Meera D.', text: 'Authentic spiritual guidance that resonates deeply within.', role: 'Believer' },
    { author: 'Arjun P.', text: 'A space where healing happens naturally and beautifully.', role: 'Explorer' }
  ];

  const sectionPalette = isDark
    ? ["#1a241f", "#28211b", "#16242a"]
    : ["#e6efe6", "#eadfd3", "#ddeef2"];
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
          setTestimonials(fallbackTestimonials);
        }
      } catch (e) {
        if (isMounted) setTestimonials(fallbackTestimonials);
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
        className="px-6 md:px-24 pt-24 pb-0 relative"
        style={{
          backgroundColor: getSectionBg(0),
          backgroundImage: isDark
            ? "linear-gradient(rgba(10, 14, 18, 0.55), rgba(10, 14, 18, 0.55)), linear-gradient(120deg, rgba(40, 86, 64, 0.35) 0%, rgba(123, 88, 60, 0.3) 45%, rgba(46, 94, 98, 0.35) 100%), linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.6) 8%, rgba(255, 255, 255, 0.18) 16%, rgba(255, 255, 255, 0) 22%), url(/src/assets/images/extended_bg_about_me.jpeg)"
            : "linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), linear-gradient(120deg, rgba(114, 186, 150, 0.45) 0%, rgba(210, 165, 120, 0.4) 45%, rgba(112, 186, 196, 0.45) 100%), linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.6) 8%, rgba(255, 255, 255, 0.18) 16%, rgba(255, 255, 255, 0) 22%), url(/src/assets/images/extended_bg_about_me.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "90vh",
          minHeight: "680px"
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 1,
            backgroundImage: "url(/src/assets/images/extended_bg_about_me.jpeg)",
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
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 relative h-full">
          <div className="flex flex-col h-full relative">
            <p
              className="text-[11px] tracking-[0.4em] uppercase"
              style={{ color: isDark ? theme.textMuted : "#121417" }}
            >
              About Me
            </p>
          </div>

        </div>

        <div
          className="absolute left-6 md:left-24 top-1/2 text-[10px]"
          style={{
            color: theme.textMuted,
            width: "calc((100% - 6rem) * 0.55)",
            transform: "translateY(-50%)"
          }}
        >
          <div
            className="inline-flex flex-col justify-start px-3 py-4 space-y-2"
            style={{
              height: "45vh",
              minHeight: "320px",
              // backgroundColor: isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.65)",
              backgroundColor: isDark ? "rgba(0, 0, 0, 0)" : "rgba(255, 255, 255, 0)",
              color: isDark ? "#ffffff" : "rgba(12, 14, 18, 0.95)",
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            <p>Guiding seekers toward inner steadiness and self-awareness.</p>
            <p>Rooted in Siddha Maha Yoga, centered on lived transformation.</p>
          </div>
        </div>

        <div
          className="absolute left-6 md:left-24 right-6 md:right-24 bottom-0"
          style={{
            fontFamily: "'Source Sans 3', sans-serif",
            color: theme.text
          }}
        >
          <div
            className="relative"
            style={{
              "--portrait-width": "clamp(120px, 14vw, 220px)",
              "--portrait-height": "clamp(180px, 22vw, 340px)",
              "--portrait-bottom": "3%"
            }}
          >
            <div
              className="absolute left-1/2 bottom-[3%] z-0"
              style={{
                width: "calc(var(--portrait-width) + 32px)",
                height: "calc(var(--portrait-height) + 32px)",
                bottom: "var(--portrait-bottom)",
                transform: "translateX(-50%)",
                padding: "16px",
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
                  src="/src/assets/images/IMG_20250512_143414.jpg"
                  alt="Vartika Shukla"
                  className="block w-full h-full object-contain"
                  style={{
                    filter: "grayscale(1) saturate(0.5) contrast(1.45) brightness(0.82)"
                  }}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
            <div
              className="relative z-10 w-full whitespace-nowrap leading-[0.85] tracking-[0.05em] text-center overflow-hidden"
              style={{
                fontSize: "clamp(2.75rem, 10.5vw, 12rem)",
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
      <RevealSection theme={theme} setCursorVariant={setCursorVariant} bgColor={getSectionBg(1)} />

      {/* Lineage Section */}
      <LineageSection theme={theme} bgColor={getSectionBg(2)} />

      {/* Offerings - with RED accent */}
      <OfferingsSection theme={theme} isDark={isDark} setCursorVariant={setCursorVariant} bgColor={getSectionBg(0)} />

      {/* Testimonials */}
      <TestimonialsSection 
        theme={theme} 
        testimonials={testimonials}
        setCursorVariant={setCursorVariant}
        bgColor={getSectionBg(1)}
      />

      {/* CTA */}
      <CTASection theme={theme} setCursorVariant={setCursorVariant} isDark={isDark} bgColor={getSectionBg(2)} />

      {/* FAQs - with RED accent */}
      <FAQ theme={theme} isDark={isDark} bgColor={getSectionBg(0)} />


      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');

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
