import React, { useState, useEffect, useRef } from 'react';
import { Menu, Minus, ArrowRight, Circle, Sun, Moon, MessageCircle, Send, X } from 'lucide-react';

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
  const [inputValue, setInputValue] = useState('');

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&h=1080&fit=crop&q=90',
      title: 'Inner Peace',
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
    setMessages([...messages, { type: 'user', text }]);
    setInputValue('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Thank you for your question. Our team will guide you on your spiritual journey.' 
      }]);
    }, 1000);
  };

  const theme = {
    bg: isDark ? 'bg-[#1a1a1a]' : 'bg-[#faf8f5]',
    text: isDark ? 'text-[#e8e4df]' : 'text-[#3a3633]',
    textMuted: isDark ? 'text-[#a39e99]' : 'text-[#8a827c]',
    border: isDark ? 'border-[#3a3633]' : 'border-[#e8e4df]',
    cardBg: isDark ? 'bg-[#242424]' : 'bg-[#ffffff]',
    sidebarBg: isDark ? 'bg-[#1a1a1a]/98' : 'bg-[#faf8f5]/98',
    accent: isDark ? 'bg-[#d4a574]' : 'bg-[#c9a77c]',
    accentHover: isDark ? 'over:bg-[#e0b585]' : 'hover:bg-[#d8b68b]',
    overlay: isDark ? 'from-[#1a1a1a]/90' : 'from-[#faf8f5]/90'
  };

  return (
    <div className={`${theme.bg} ${theme.text} overflow-x-hidden transition-colors duration-500`}>
      {/* Custom Cursor */}
      <div
        className={`fixed w-5 h-5 rounded-full border ${isDark ? 'border-[#d4a574]' : 'border-[#c9a77c]'} pointer-events-none z-[9999] transition-transform duration-75`}
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          transform: `translate(-50%, -50%) scale(${cursorVariant === 'hover' ? 1.8 : 1})`,
        }}
      />

      {/* Progress Bar */}
      <div className={`fixed top-0 left-0 w-full h-[1px] ${isDark ? 'bg-[#3a3633]' : 'bg-[#e8e4df]'} z-50`}>
        <div
          className={`h-full ${theme.accent} transition-all duration-300`}
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`fixed right-8 top-8 z-[60] w-11 h-11 rounded-full ${theme.cardBg} backdrop-blur-xl border ${theme.border} flex items-center justify-center transition-all duration-300 hover:scale-110`}
        onMouseEnter={() => setCursorVariant('hover')}
        onMouseLeave={() => setCursorVariant('default')}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Chatbot */}
      <div className="fixed bottom-8 right-8 z-[60]">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            onMouseEnter={() => setChatExpanded(true)}
            onMouseLeave={() => setChatExpanded(false)}
            className={`group flex items-center gap-3 ${theme.cardBg} backdrop-blur-xl border ${theme.border} rounded-full px-5 py-3 transition-all duration-300 hover:scale-105 shadow-lg`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className={`overflow-hidden transition-all duration-300 ${chatExpanded ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}>
              <span className="text-sm whitespace-nowrap">Ask us anything</span>
            </span>
          </button>
        ) : (
          <div className={`${theme.cardBg} backdrop-blur-xl border ${theme.border} rounded-2xl shadow-2xl w-96 h-[500px] flex flex-col`}>
            {/* Chat Header */}
            <div className={`flex items-center justify-between p-5 border-b ${theme.border}`}>
              <div>
                <h3 className="font-medium text-base">Sreeshakti Guide</h3>
                <p className={`text-xs ${theme.textMuted}`}>We're here to help</p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className={`${theme.cardBg} w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform`}
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="p-5 space-y-2">
                <p className={`text-xs ${theme.textMuted} mb-3`}>Quick questions:</p>
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className={`w-full text-left text-sm p-3 rounded-lg border ${theme.border} ${theme.cardBg} hover:${theme.accent} transition-colors`}
                    onMouseEnter={() => setCursorVariant('hover')}
                    onMouseLeave={() => setCursorVariant('default')}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                      msg.type === 'user'
                        ? `${theme.accent} ${isDark ? 'text-[#1a1a1a]' : 'text-[#faf8f5]'}`
                        : `${theme.cardBg} border ${theme.border}`
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className={`p-4 border-t ${theme.border}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                  placeholder="Type your message..."
                  className={`flex-1 ${theme.cardBg} border ${theme.border} rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#c9a77c]`}
                />
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  className={`${theme.accent} ${isDark ? 'text-[#1a1a1a]' : 'text-[#faf8f5]'} w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110`}
                  onMouseEnter={() => setCursorVariant('hover')}
                  onMouseLeave={() => setCursorVariant('default')}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen ${theme.sidebarBg} backdrop-blur-xl border-r ${theme.border} transition-all duration-500 ease-out z-50`}
        style={{
          width: sidebarExpanded ? '280px' : '0px',
          opacity: sidebarExpanded ? 1 : 0
        }}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className={`h-full flex flex-col justify-between p-10 transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100 delay-200' : 'opacity-0'}`}>
          <div>
            <div className="mb-16">
              <h2 className="text-2xl font-light tracking-tight mb-2">Sreeshakti</h2>
              <div className={`w-12 h-[1px] ${theme.accent}`} />
            </div>
            
            <nav className="space-y-5">
              {['Home', 'Philosophy', 'Practices', 'Journey', 'Connect'].map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.toLowerCase()}`}
                  className="group block relative"
                  onMouseEnter={() => setCursorVariant('hover')}
                  onMouseLeave={() => setCursorVariant('default')}
                >
                  <span className={`block text-lg font-light tracking-wide transition-all duration-300 group-hover:translate-x-3 ${theme.text}`}>
                    {item}
                  </span>
                  <div className={`absolute bottom-0 left-0 w-0 h-[1px] ${theme.accent} transition-all duration-300 group-hover:w-full`} />
                </a>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Circle className={`w-2 h-2 fill-current ${isDark ? 'text-[#d4a574]' : 'text-[#c9a77c]'}`} />
              <span className={`text-xs tracking-wide ${theme.textMuted}`}>Open to Seekers</span>
            </div>
            <p className={`text-xs tracking-wide ${theme.textMuted} opacity-50`}>
              © 2024 Patashram
            </p>
          </div>
        </div>
      </aside>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarExpanded(!sidebarExpanded)}
        className={`fixed left-8 top-8 z-[60] w-11 h-11 rounded-full ${theme.cardBg} backdrop-blur-xl border ${theme.border} flex items-center justify-center transition-all duration-300 hover:scale-110`}
        onMouseEnter={() => setCursorVariant('hover')}
        onMouseLeave={() => setCursorVariant('default')}
      >
        {sidebarExpanded ? <Minus className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
            style={{
              opacity: idx === currentSlide ? 1 : 0
            }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover will-change-transform"
              style={{
                transform: idx === currentSlide ? 'scale(1)' : 'scale(1.03)',
                transition: 'transform 7s ease-out'
              }}
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${theme.overlay} to-transparent`} />
          </div>
        ))}

        <div className="relative h-full flex items-center justify-center">
          <div className="text-center px-8 max-w-6xl">
            <h1 
              className="text-[11vw] md:text-[8rem] font-light tracking-tight leading-none mb-6"
              style={{
                transform: `translateY(${scrollProgress * 60}px)`,
                opacity: 1 - scrollProgress * 2
              }}
            >
              {slides[currentSlide].title}
            </h1>
            <p 
              className="text-xl md:text-2xl tracking-[0.25em] font-light opacity-70"
              style={{
                transform: `translateY(${scrollProgress * 100}px)`,
                opacity: 1 - scrollProgress * 2
              }}
            >
              {slides[currentSlide].subtitle}
            </p>
          </div>
        </div>

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-5 z-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className="group"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <div className={`h-[1px] transition-all duration-500 ${
                idx === currentSlide 
                  ? `w-16 ${theme.accent}` 
                  : `w-8 ${theme.border}`
              }`} />
            </button>
          ))}
        </div>

        <div 
          className="absolute bottom-16 right-16 flex flex-col items-center gap-3"
          style={{ opacity: 1 - scrollProgress * 3 }}
        >
          <span className={`text-[10px] tracking-[0.3em] rotate-90 origin-center ${theme.textMuted}`}>SCROLL</span>
          <div className={`w-[1px] h-12 ${theme.border}`} />
        </div>
      </section>

      {/* Reveal Section */}
      <section className="relative py-40 px-8 md:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-6xl md:text-7xl font-light leading-tight tracking-tight mb-8">
                Where
                <br />
                Souls
                <br />
                Unite
              </h2>
              <div className="flex items-center gap-6">
                <div className={`w-16 h-[1px] ${theme.accent}`} />
                <span className={`text-[10px] tracking-[0.3em] ${theme.textMuted}`}>PATASHRAM</span>
              </div>
            </div>

            <div className="space-y-8">
              <p className={`text-xl font-light leading-relaxed ${theme.textMuted}`}>
                A sanctuary where ancient wisdom meets contemporary consciousness. 
                We exist in the space between breath and awareness.
              </p>
              <p className={`text-lg font-light leading-relaxed ${theme.textMuted} opacity-70`}>
                Here, transformation is not a destination—it's a perpetual unfolding.
              </p>
              <button 
                className={`px-10 py-4 ${theme.cardBg} border ${theme.border} backdrop-blur-xl transition-all duration-300 hover:scale-105 flex items-center gap-3`}
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
              >
                <span className="tracking-wide text-sm">Begin Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section className={`py-40 px-8 md:px-24 ${isDark ? 'bg-[#242424]' : 'bg-[#f5f2ed]'} transition-colors duration-500`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <span className={`text-[10px] tracking-[0.4em] ${theme.textMuted} mb-6 block`}>Our Offerings</span>
            <h2 className="text-5xl md:text-6xl font-light tracking-tight">Paths to Enlightenment</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: 'Meditation', desc: 'Journey inward through guided silence', img: 'photo-1506126613408-eca07ce68773' },
              { title: 'Yoga', desc: 'Unite body and spirit through asanas', img: 'photo-1599901860904-17e6ed7083a0' },
              { title: 'Healing', desc: 'Restore balance through energy work', img: 'photo-1544367567-0f2fcb009e0b' }
            ].map((item, idx) => (
              <div
                key={idx}
                className="group"
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
              >
                <div className="relative h-[450px] overflow-hidden mb-6">
                  <img
                    src={`https://images.unsplash.com/${item.img}?w=600&h=800&fit=crop&q=80`}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-2xl font-light tracking-wide mb-3">{item.title}</h3>
                <p className={`${theme.textMuted} leading-relaxed`}>{item.desc}</p>
                <div className={`w-0 h-[1px] ${theme.accent} group-hover:w-full transition-all duration-500 mt-5`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-24 overflow-hidden`}>
        <div className="text-center mb-20">
          <span className={`text-[10px] tracking-[0.4em] ${theme.textMuted}`}>Voices of Transformation</span>
        </div>

        <div className="flex animate-marquee gap-6">
          {[...testimonials, ...testimonials, ...testimonials].map((t, idx) => (
            <div
              key={idx}
              className={`flex-shrink-0 w-[400px] ${theme.cardBg} border ${theme.border} p-10`}
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <p className={`text-base font-light leading-relaxed mb-6 ${theme.text}`}>
                "{t.text}"
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-light text-sm">{t.author}</p>
                  <p className={`text-xs ${theme.textMuted} mt-1`}>{t.role}</p>
                </div>
                <div className={`w-10 h-[1px] ${theme.border}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-40 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-6xl md:text-7xl font-light tracking-tight leading-tight mb-10">
            Your Journey Begins
          </h2>
          <p className={`text-lg font-light ${theme.textMuted} mb-12`}>
            Step into a space where transformation unfolds naturally
          </p>
          <button 
            className={`px-16 py-5 ${theme.cardBg} border ${theme.border} backdrop-blur-xl transition-all duration-300 hover:scale-105`}
            onMouseEnter={() => setCursorVariant('hover')}
            onMouseLeave={() => setCursorVariant('default')}
          >
            <span className="tracking-[0.2em] text-sm">EXPERIENCE SREESHAKTI</span>
          </button>
        </div>
      </section>

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
      `}</style>
    </div>
  );
};

export default WellnessWebsite;
