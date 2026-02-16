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

      {/* Reveal Section - Notable Gurus */}
      <RevealSection theme={theme} setCursorVariant={setCursorVariant} />

      {/* Lineage Section */}
      <LineageSection theme={theme}/>

      {/* Offerings - with RED accent */}
      <OfferingsSection theme={theme} isDark={isDark} setCursorVariant={setCursorVariant} />

      {/* Testimonials */}
      <TestimonialsSection 
        theme={theme} 
        testimonials={testimonials}
        setCursorVariant={setCursorVariant} 
      />

      {/* CTA */}
      <CTASection theme={theme} setCursorVariant={setCursorVariant} />

      {/* FAQs - with RED accent */}
      <FAQ theme={theme} isDark={isDark} />


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
