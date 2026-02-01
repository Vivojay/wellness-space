import { Menu, Minus, ArrowRight, Circle, Sun, Moon, MessageCircle, Send, X } from 'lucide-react';
import React, { useState, useEffect } from "react";
import FloatingUI from "../components/FloatingUI";
import MainLayout from "../layouts/MainLayout";
import Hero from "../components/sections/Hero";
import RevealSection from "../components/sections/RevealSection";
import LineageSection from "../components/sections/LineageSection";
import OfferingsSection from "../components/sections/OfferingsSection";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import CTASection from "../components/sections/CTASection";
import RightFeed from "../components/RightFeed";
import useLenisSmooth from "@/utils/lenisSmooth";
import FAQ from "../components/sections/FAQ/FAQ";

const WellnessWebsite = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState('default');
  const [isDark, setIsDark] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Welcome to Sreeshakti Patashram. How may I guide you?' }
  ]);
  const [rightFeedOpen, setRightFeedOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [botTyping, setBotTyping] = useState(false);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&h=1080&fit=crop&q=90',
      title: 'Sree Shaktipat Ashram',
      subtitle: 'Discover the silence within'
    },
    {
      image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=1920&h=1080&fit=crop&q=90',
      title: 'Divine Balance',
      subtitle: 'Harmonize your existence'
    },
    {
      image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1920&h=1080&fit=crop&q=90',
      title: 'Spiritual Awakening',
      subtitle: 'Transcend the ordinary'
    },
    {
      image: 'https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=1920&h=1080&fit=crop&q=90',
      title: 'Sacred Journey',
      subtitle: 'Walk the path of enlightenment'
    }
  ];

  const testimonials = [
    { author: 'Ananya M.', text: 'A profound transformation. The energy here is unlike anywhere else.', role: 'Seeker' },
    { author: 'Rajesh K.', text: 'Pure serenity. Every moment spent here deepens my practice.', role: 'Practitioner' },
    { author: 'Priya S.', text: 'Life-changing wisdom delivered with grace and compassion.', role: 'Devotee' },
    { author: 'Vikram R.', text: 'The sanctuary my soul was searching for.', role: 'Wanderer' },
    { author: 'Meera D.', text: 'Authentic spiritual guidance that resonates deeply within.', role: 'Believer' },
    { author: 'Arjun P.', text: 'A space where healing happens naturally and beautifully.', role: 'Explorer' }
  ];

  const quickQuestions = [
    'What programs do you offer?',
    'How can I book a retreat?',
    'Tell me about meditation practices',
    'What are your visiting hours?'
  ];

  useEffect(() => {
    const handleScroll = () => {
      const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setScrollProgress(progress);
    };

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { type: 'user', text }]);
    setInputValue('');

    setBotTyping(true); // start typing animation

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Thank you for your question. Our team will guide you on your spiritual journey.' 
      }]);
      setBotTyping(false); // stop typing
    }, 1200); // delay for realism
  };

  const theme = {
    bg: isDark ? 'bg-[#1a1a1a]' : 'bg-[#faf8f5]',
    // text: isDark ? 'text-[#e8e4df]' : 'text-[#3a3633]',
    text: isDark ? 'text-[#fff]' : 'text-[#000]',
    textMuted: isDark ? 'text-[#a39e99]' : 'text-[#8a827c]',
    border: isDark ? 'border-[#3a3633]' : 'border-[#e8e4df]',
    cardBg: isDark ? 'bg-[#242424]' : 'bg-[#ffffff]',
    sidebarBg: isDark ? 'bg-[#1a1a1a]/98' : 'bg-[#faf8f5]/98',
    accent: isDark ? 'bg-[#d4a574]' : 'bg-[#c9a77c]',
    accentHover: isDark ? 'over:bg-[#e0b585]' : 'hover:bg-[#d8b68b]',
    overlay: isDark ? 'from-[#1a1a1a]/90' : 'from-[#faf8f5]/90'
  };

  const HamburgerIcon = ({ open }) => (
    <div className="relative w-5 h-5">
      {/* Top bar */}
      <span
        className={`absolute left-0 w-full h-[2px] bg-current transition-all duration-300
          ${open
            ? 'top-1/2 -translate-y-1/2 rotate-45'
            : 'top-1'
          }`}
      />

      {/* Middle bar */}
      <span
        className={`absolute left-0 top-1/2 w-full h-[2px] bg-current transition-opacity duration-200
          ${open
            ? 'opacity-0'
            : '-translate-y-1/2 opacity-100'
          }`}
      />

      {/* Bottom bar */}
      <span
        className={`absolute left-0 w-full h-[2px] bg-current transition-all duration-300
          ${open
            ? 'top-1/2 -translate-y-1/2 -rotate-45'
            : 'top-4'
          }`}
      />
    </div>
  );

  useLenisSmooth();

  return (
    <MainLayout theme={theme}>
      <FloatingUI
        mousePos={mousePos}
        botTyping={botTyping}
        cursorVariant={cursorVariant}
        setCursorVariant={setCursorVariant}
        isDark={isDark}
        setIsDark={setIsDark}
        theme={theme}
        scrollProgress={scrollProgress}
        chatOpen={chatOpen}
        setChatOpen={setChatOpen}
        chatExpanded={chatExpanded}
        setChatExpanded={setChatExpanded}
        messages={messages}
        quickQuestions={quickQuestions}
        handleSendMessage={handleSendMessage}
        inputValue={inputValue}
        setInputValue={setInputValue}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        HamburgerIcon={HamburgerIcon}
        Sun={Sun}
        Moon={Moon}
        MessageCircle={MessageCircle}
        X={X}
        Send={Send}
        Circle={Circle}
      />

      {/* Hero Section */}
      <Hero scrollProgress={scrollProgress} theme={theme} isDark={isDark} />

      {/* Sticky Scroll Indicator */}
      <div
        className="fixed bottom-16 right-16 ml-auto mr-16
                  flex flex-col items-center gap-3
                  w-fit z-40 hidden md:flex"
        style={{ opacity: 1 - scrollProgress * 6 }}
      >
        <div className="w-px h-10 bg-gradient-to-t from-transparent via-current to-transparent opacity-50" />

        <p></p>
        <span className={`text-[10px] tracking-[0.3em] rotate-90 ${theme.textMuted}`}>
          SCROLL
        </span>

        <p></p>

        <div className="w-px h-10 bg-gradient-to-t from-transparent via-current to-transparent opacity-50" />

        {/* <div className="w-[1.5]px h-10 bg-gradient-to-b from-transparent via-current to-transparent opacity-50" /> */}
      </div>

      {/* Reveal Section */}
      <RevealSection theme={theme} setCursorVariant={setCursorVariant} />

      {/* Lineage Section */}
      <LineageSection theme={theme}/>

      {/* Offerings */}
      <OfferingsSection theme={theme} isDark={isDark} setCursorVariant={setCursorVariant} />

      {/* Testimonials */}
      <TestimonialsSection 
        theme={theme} 
        testimonials={testimonials} 
        setCursorVariant={setCursorVariant} 
      />

      {/* CTA */}
      <CTASection theme={theme} setCursorVariant={setCursorVariant} />

      {/* FAQs */}
      <FAQ theme={theme}/>

      {/* Right Vertical Feed */}
      <RightFeed
        theme={theme}
        rightFeedOpen={rightFeedOpen}
        setRightFeedOpen={setRightFeedOpen}
        messages={messages}
        botTyping={botTyping}
      />

      {/* Footer */}
      <footer className={`border-t ${theme.border} py-20 px-8 md:px-24 transition-colors duration-500`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h3 className="text-2xl font-light tracking-tight mb-2">Sreeshakti Patashram</h3>
            <p className={`text-[10px] tracking-[0.3em] ${theme.textMuted}`}>Where Consciousness Expands</p>
          </div>
          <div className="text-right">
            <p className={`text-xs ${theme.textMuted} mb-3`}>© 2024 All Rights Reserved</p>
            <div className="flex gap-6">
              {['Instagram', 'Facebook', 'YouTube'].map((social, idx) => (
                <a
                  key={idx}
                  href="#"
                  className={`text-xs ${theme.textMuted} hover:${theme.text} transition-colors`}
                  onMouseEnter={() => setCursorVariant('hover')}
                  onMouseLeave={() => setCursorVariant('default')}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
  
        @font-face {
          font-family: 'Evafiya';
          src: url('/fonts/Evafiya.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

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

        /* optional helper class */
        .font-evafiya {
          font-family: 'Evafiya', serif;
          // color: black;
          font-weight: bold;
        }

        .font-petitformal {
          font-family: 'PetitFormal', serif;
          // color: black;
          // font-weight: bold;
        }

        .font-modernsanslight {
          font-family: 'ModernSansLight', serif;
          // color: black;
          font-weight: bold;
        }

        .font-petitformal {
          font-family: "Playwrite GB S", cursive;
          font-optical-sizing: auto;
          font-weight: <weight>;
          font-style: normal;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-400px * ${testimonials.length} - 24px * ${testimonials.length})); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        * {
          cursor: none;
        }
        .will-change-transform {
          will-change: transform;
        }

        @keyframes tealPulse {
          0% {
            background-color: rgba(13, 148, 136, 0.12); /* teal-600 */
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
            background-color: rgba(45, 212, 191, 0.10); /* teal-400 */
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

          /* Z-shaped polygon */
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

          /* The most important part */
          mix-blend-mode: multiply;
          opacity: 0.35;

          /* realism */
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
