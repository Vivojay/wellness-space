// ✅ FIXED: Chat scroll + minimize button hover (only color change, no scale)

import { ArrowDown, Minus, X } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

const ScrollToBottomButton = ({ chatRef, messages, isDark }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hover, setHover] = useState(false);

  const pressTimer = useRef(null);
  const LONG_PRESS_MS = 600;

  const startPress = () => {
    pressTimer.current = setTimeout(() => {
      setIsLocked(prev => !prev);
      pressTimer.current = null;
    }, LONG_PRESS_MS);
  };

  const endPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
      scrollOnce();
    }
  };

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    if (!isLocked) return;

    const lockToBottom = (e) => {
      e.preventDefault();
      el.scrollTop = el.scrollHeight;
    };

    el.scrollTop = el.scrollHeight;
    el.addEventListener('wheel', lockToBottom, { passive: false });
    el.addEventListener('touchmove', lockToBottom, { passive: false });
    el.style.overflowY = 'hidden';

    return () => {
      el.style.overflowY = '';
      el.removeEventListener('wheel', lockToBottom);
      el.removeEventListener('touchmove', lockToBottom);
    };
  }, [isLocked, messages.length]);

  const scrollOnce = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
      setClicked(true);
      setTimeout(() => setClicked(false), 800);
    }
  };

  const borderColor = isLocked
    ? 'border-teal-500'
    : clicked
      ? 'border-teal-400'
      : hover
        ? 'border-teal-300'
        : 'border-black';

  const bgEffect = isLocked
    ? isDark
      ? 'pulse-bg-dark bg-teal-900/30'
      : 'pulse-bg bg-teal-100'
    : 'bg-transparent';

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleMouseLeave = () => {
    setHover(false);
    endPress();
  };

  return (
    <button
      className={`absolute bottom-20 right-4 w-10 h-10 flex items-center justify-center
        border-2 rounded-full ${borderColor} ${bgEffect} transition-colors duration-300 z-40`}
      onPointerDown={(e) => { e.preventDefault(); startPress(); }}
      onPointerUp={(e) => { e.preventDefault(); endPress(); }}
      onPointerCancel={cancelPress}
      onPointerLeave={handleMouseLeave}
      onPointerEnter={() => setHover(true)}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setHover(true)}
    >
      <ArrowDown className={`w-5 h-5 transition-transform duration-300 
        ${isLocked ? 'arrow-locked' : hover ? 'arrow-hover' : ''}`} />
    </button>
  );
};

export default function FloatingUI(props) {
  const {
    mousePos, botTyping, cursorVariant, setCursorVariant, isDark, setIsDark,
    theme, scrollProgress, chatOpen, setChatOpen, chatExpanded, setChatExpanded,
    messages, quickQuestions, handleSendMessage, inputValue, setInputValue,
    sidebarExpanded, setSidebarExpanded, HamburgerIcon, Sun, Moon,
    MessageCircle, Send, Circle, activeOverlay, setActiveOverlay, chatPanelRef
  } = props;

  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const sidebarRef = useRef(null);
  const hamburgerBtnRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const goToSection = async (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const THRESHOLD_PX = 80;
    const CLOSE_GAP_PX = 120;

    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    const onMove = (e) => {
      const btn = hamburgerBtnRef.current;
      const sidebar = sidebarRef.current;
      if (!btn) return;

      const r = btn.getBoundingClientRect();
      const btnCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      const p = { x: e.clientX, y: e.clientY };

      const nearHamburger = dist(p, btnCenter) <= THRESHOLD_PX;
      const inSidebar = sidebar?.contains(e.target);

      if (!sidebarExpanded && nearHamburger) setSidebarExpanded(true);

      if (sidebarExpanded && !inSidebar) {
        const closeNear = dist(p, btnCenter) <= CLOSE_GAP_PX;
        if (!closeNear) setSidebarExpanded(false);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [sidebarExpanded, setSidebarExpanded]);

  return (
    <>
      {/* Custom Cursor */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: mousePos.x, top: mousePos.y,
          transform: `translate(-50%, -50%) scale(${cursorVariant === 'hover' ? 1.6 : 1})`,
        }}
      >
        <div
          className="w-5 h-5 rounded-full border"
          style={{
            borderColor: isDark ? '#d4a574' : '#c9a77c',
            backgroundColor: isDark ? '#00000080': '#ffffff80',
            borderWidth: "2px",
          }}
        />
      </div>

      {/* Progress Bar */}
      <div className={`fixed top-0 left-0 w-full h-[2px] ${isDark ? 'bg-[#3a3633]' : 'bg-[#e8e4df]'} z-50`}>
        <div className={`h-full bg-teal-500 transition-all duration-300`}
          style={{ width: `${scrollProgress * 100}%` }} />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`fixed right-8 top-8 z-[100] w-11 h-11 rounded-full ${theme.cardBg} 
          backdrop-blur-xl border ${theme.border} flex items-center justify-center 
          transition-all duration-300 hover:scale-110`}
        onMouseEnter={() => setCursorVariant('hover')}
        onMouseLeave={() => setCursorVariant('default')}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Chatbot */}
      <div
        className="fixed bottom-8 right-8"
        style={{ zIndex: activeOverlay === "chat" ? 120 : 110 }}
        onMouseDown={() => setActiveOverlay?.("chat")}
        onTouchStart={() => setActiveOverlay?.("chat")}
      >
        {!chatOpen ? (
          <button
            onClick={() => { setChatOpen(true); setActiveOverlay?.("chat"); }}
            onMouseEnter={() => setChatExpanded(true)}
            onMouseLeave={() => setChatExpanded(false)}
            className={`group flex items-center gap-3 ${theme.cardBg} backdrop-blur-xl 
              border ${theme.border} rounded-full px-5 py-3 transition-all duration-300 
              hover:scale-105 shadow-lg`}
            data-chat-trigger
          >
            <MessageCircle className="w-5 h-5" />
            <span className={`overflow-hidden transition-all duration-1000 
              ${chatExpanded ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}>
              <span className="text-sm whitespace-nowrap">Chat with us</span>
            </span>
          </button>
        ) : (
          <div className='relative'>
            <div ref={chatPanelRef} className={`${theme.cardBg} backdrop-blur-xl border 
              ${theme.border} shadow-2xl w-96 h-[500px] flex flex-col relative rounded-none 
              overflow-hidden`}>
              {/* Chat Header */}
              <div className={`flex items-center justify-between p-5 border-b ${theme.border}`}>
                <div>
                  <h3 className="font-medium text-base">Sreeshakti Guide</h3>
                  <p className={`text-xs ${theme.textMuted}`}>We're here to help</p>
                </div>
                {/* ✅ FIXED: Only color change on hover, no scale */}
                <button
                  onClick={() => setChatOpen(false)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center 
                    border-2 transition-colors duration-200
                    ${isDark 
                      ? "bg-[#c9a77c] hover:bg-[#b99263] border-[#9b774e]" 
                      : "bg-[#c9a77c] hover:bg-[#b99263] border-[#9b774e]"
                    }`}
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              {/* ✅ FIXED: Proper scrollable messages container */}
              <div className="flex-1 overflow-hidden">
                <div
                  ref={chatRef}
                  className="h-full px-5 py-5 space-y-4 overflow-y-auto"
                  style={{ 
                    scrollbarWidth: 'thin', 
                    scrollbarColor: `${isDark ? '#4a4a4a' : '#d0d0d0'} transparent` 
                  }}
                >
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-3 text-sm rounded-none 
                        ${msg.type === 'user' ? `${theme.accent} ${isDark ? 'text-[#1a1a1a]' : 'text-[#faf8f5]'}` : `${theme.cardBg} border ${theme.border}`}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {messages.length === 1 && (
                    <div className="space-y-2 mt-4">
                      <p className={`text-xs ${theme.textMuted} mb-3`}>Quick questions:</p>
                      {quickQuestions.map((q, idx) => (
                        <button key={idx} onClick={() => handleSendMessage(q)}
                          className={`w-full text-left text-sm p-3 rounded-none border ${theme.border} 
                            ${theme.cardBg} hover:${theme.accent} transition-colors`}
                          onMouseEnter={() => setCursorVariant('hover')}
                          onMouseLeave={() => setCursorVariant('default')}>
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {botTyping && (
                    <div className="flex items-center gap-2 p-3 rounded-none shadow bg-gray-100">
                      <p className="text-xs opacity-70 mb-0">BOT</p>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-none animate-bounce delay-75"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-none animate-bounce delay-150"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-none animate-bounce delay-200"></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input */}
              <div className={`p-4 border-t ${theme.border}`}>
                <div className="flex gap-2">
                  <input ref={inputRef} type="text" value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(inputValue); }}
                    placeholder="Type your message..."
                    className={`flex-1 ${theme.cardBg} border ${theme.border} px-4 py-2 text-sm 
                      rounded-none focus:outline-none focus:border-[#c9a77c] cursor-text caret-current`}
                    style={{ cursor: 'text' }} />
                  <button onClick={() => handleSendMessage(inputValue)}
                    className={`${theme.accent} ${isDark ? 'text-[#1a1a1a]' : 'text-[#faf8f5]'} 
                      w-10 h-10 rounded-none border border-neutral-600 flex items-center justify-center 
                      transition-transform hover:scale-110`}
                    onMouseEnter={() => setCursorVariant('hover')}
                    onMouseLeave={() => setCursorVariant('default')}>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {chatOpen && <ScrollToBottomButton chatRef={chatRef} messages={messages} isDark={isDark} theme={theme} />}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside ref={sidebarRef}
        className={`fixed left-0 top-0 h-screen ${theme.sidebarBg} backdrop-blur-xl 
          border-r ${theme.border} transition-all duration-500 ease-out z-50`}
        style={{ width: sidebarExpanded ? '280px' : '0px', opacity: sidebarExpanded ? 1 : 0 }}>
        <div className={`h-full flex flex-col justify-between p-10 transition-opacity duration-300 
          ${sidebarExpanded ? 'opacity-100 delay-200' : 'opacity-0'}`}>
          <div>
            <div className="mb-16">
              <h2 className="text-2xl font-light tracking-[0.14em] mb-2">Sree shakti</h2>
              <div className={`w-12 h-[1px] ${theme.accent}`} />
            </div>
            
            <nav className="space-y-5">
              {[
                { name: 'Home', onClick: () => navigate("/") },
                { name: 'Readings', onClick: () => navigate("/readings") },
                { name: 'Gallery', onClick: () => navigate("/gallery") },
                { name: 'Book Session', onClick: () => navigate("/booking") },
                { name: 'Blogs & Updates', onClick: () => navigate("/blog") },
                { name: 'New Blog (Admin)', onClick: () => navigate("/blog/new") },
                { name: 'Offerings', onClick: () => goToSection("offerings") },
                { name: 'Lineage', onClick: () => goToSection("lineage") },
                { name: 'FAQs', onClick: () => goToSection("faqs") },
              ].map((item, idx) => (
                <button key={idx} type="button" onClick={item.onClick}
                  className="group block relative text-left w-full"
                  onMouseEnter={() => setCursorVariant('hover')}
                  onMouseLeave={() => setCursorVariant('default')}>
                  <span className={`block text-lg font-light tracking-wide transition-all duration-300
                    group-hover:translate-x-3 ${theme.text}`}>
                    {item.name}
                  </span>
                  <div className={`absolute bottom-0 left-0 w-0 h-[1px] ${theme.accent}
                    transition-all duration-300 group-hover:w-full`} />
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Circle className={`w-2 h-2 fill-current ${isDark ? 'text-[#d4a574]' : 'text-[#c9a77c]'}`} />
              <span className={`text-xs tracking-wide ${theme.textMuted}`}>Open to Seekers</span>
            </div>
            <p className={`text-xs tracking-wide ${theme.textMuted} opacity-50`}>© 2024 Patashram</p>
          </div>
        </div>
      </aside>

      {/* Hamburger icon */}
      <button ref={hamburgerBtnRef} onClick={() => setSidebarExpanded(!sidebarExpanded)}
        className={`fixed top-8 z-[60] w-11 h-11 rounded-full ${theme.cardBg}
          backdrop-blur-xl border ${theme.border} flex items-center justify-center 
          transition-all duration-500`}
        style={{ left: sidebarExpanded ? '300px' : '32px' }}>
        <HamburgerIcon open={sidebarExpanded} />
      </button>

      <svg width="0" height="0" aria-hidden>
        <defs>
          <filter id="crayonNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="noStitch" />
            <feColorMatrix type="saturate" values="0"/>
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.15"/>
            </feComponentTransfer>
          </filter>
          <linearGradient id="crayonFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6d463"/>
            <stop offset="55%" stopColor="#f1c84b"/>
            <stop offset="100%" stopColor="#e9ba32"/>
          </linearGradient>
          <mask id="crayonMask">
            <rect width="100%" height="100%" fill="white"/>
            <rect width="100%" height="100%" filter="url(#crayonNoise)" opacity="0.35" />
          </mask>
        </defs>
      </svg>
    </>
  );
}