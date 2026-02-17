import { ArrowDown, Minus, X } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import ConfirmDialog from "@/components/ConfirmDialog";

const ScrollToBottomButton = ({ chatRef, messages, theme }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hover, setHover] = useState(false);

  const pressTimer = useRef(null);
  const clickCount = useRef(0);
  const clickTimer = useRef(null);
  const LONG_PRESS_MS = 600;
  const DOUBLE_CLICK_MS = 300;

  // Handle double-click to toggle lock (desktop)
  const handleClick = () => {
    clickCount.current += 1;
    
    if (clickCount.current === 1) {
      // First click - start timer
      clickTimer.current = setTimeout(() => {
        // Single click - scroll once
        scrollOnce();
        clickCount.current = 0;
      }, DOUBLE_CLICK_MS);
    } else if (clickCount.current === 2) {
      // Double click - toggle lock
      clearTimeout(clickTimer.current);
      setIsLocked(prev => !prev);
      clickCount.current = 0;
    }
  };

  // Handle long press (mobile)
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
    ? `2px solid ${theme.accentTertiary}`
    : clicked
      ? `2px solid ${theme.accent}`
      : hover
        ? `2px solid ${theme.borderSecondary}`
        : `2px solid ${theme.border}`;

  const bgEffect = isLocked
    ? { backgroundColor: theme.accentTertiary + '30' }
    : { backgroundColor: 'transparent' };

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
      className="absolute bottom-20 right-4 w-10 h-10 flex items-center justify-center
        rounded-full transition-all duration-300 z-40"
      style={{
        border: borderColor,
        ...bgEffect
      }}
      onClick={handleClick}
      onPointerDown={(e) => { e.preventDefault(); startPress(); }}
      onPointerUp={(e) => { e.preventDefault(); endPress(); }}
      onPointerCancel={cancelPress}
      onPointerLeave={handleMouseLeave}
      onPointerEnter={() => setHover(true)}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setHover(true)}
      title={isLocked ? "Locked to bottom (double-click to unlock)" : "Double-click to lock / Long-press on mobile"}
    >
      <ArrowDown 
        className="w-5 h-5 transition-transform duration-300"
        style={{ color: theme.text }}
      />
    </button>
  );
};

export default function FloatingUI(props) {
  const {
    botTyping, cursorVariant, setCursorVariant, isDark, setIsDark,
    theme, scrollProgress, chatOpen, setChatOpen, chatExpanded, setChatExpanded,
    messages, quickQuestions, handleSendMessage, inputValue, setInputValue,
    sidebarExpanded, setSidebarExpanded, HamburgerIcon, Sun, Moon,
    MessageCircle, Send, Circle, activeOverlay, setActiveOverlay, chatPanelRef
  } = props;

  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const sidebarRef = useRef(null);
  const hamburgerBtnRef = useRef(null);
  const [showCursor, setShowCursor] = useState(true);
  const [hideCursor, setHideCursor] = useState(false);
  const hideCursorRef = useRef(false);
  const cursorRef = useRef(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const isDonatePage = location.pathname === "/donate";
  const { user, signOut } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const goHomeTop = () => {
    if (location.pathname === "/") {
      const scrollContainer = document.getElementById("app-scroll");
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
      return;
    }

    navigate("/", { state: { scrollTo: "top" } });
  };

  const goToSection = async (id) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    const nav = document.querySelector("[data-navbar]");
    const navHeight = nav?.getBoundingClientRect().height || 110;
    const offset = navHeight + 12;
    const scrollContainer = document.getElementById("app-scroll");
    if (scrollContainer) {
      const elRect = el.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      const targetTop = scrollContainer.scrollTop + (elRect.top - containerRect.top) - offset;
      scrollContainer.scrollTo({ top: Math.max(0, targetTop), left: 0, behavior: "smooth" });
      return;
    }
    const targetTop = window.scrollY + el.getBoundingClientRect().top - offset;
    window.scrollTo({ top: Math.max(0, targetTop), left: 0, behavior: "smooth" });
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

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(pointer: fine)');
    const update = () => setShowCursor(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    if (!showCursor) return;

    const handleMove = (e) => {
      const target = e.target instanceof Element ? e.target : null;
      const disabledTarget = target?.closest?.('[disabled], [aria-disabled="true"]');
      const cursorStyle = target ? window.getComputedStyle(target).cursor : "";
      const shouldHide = Boolean(disabledTarget) || cursorStyle === "not-allowed";

      if (hideCursorRef.current !== shouldHide) {
        hideCursorRef.current = shouldHide;
        setHideCursor(shouldHide);
      }

      lastPos.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const node = cursorRef.current;
        if (node) {
          node.style.transform = `translate3d(${lastPos.current.x}px, ${lastPos.current.y}px, 0)`;
        }
        rafRef.current = null;
      });
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [showCursor]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--sidebar-width", sidebarExpanded ? "280px" : "0px");
  }, [sidebarExpanded]);

  return (
    <>
      {/* Custom Cursor */}
      {showCursor && !hideCursor && (
        <div
          className="fixed pointer-events-none z-[9999]"
          ref={cursorRef}
          style={{
            left: 0,
            top: 0,
            transform: `translate3d(${lastPos.current.x}px, ${lastPos.current.y}px, 0)`,
            willChange: 'transform'
          }}
        >
          {cursorVariant === 'text' ? (
            <div
              className="relative w-3 h-4"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <span
                className="absolute left-1/2 -translate-x-1/2 w-[1px] h-4"
                style={{ backgroundColor: theme.text, opacity: 0.7 }}
              />
              <span
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  top: 0,
                  width: '8px',
                  height: '1px',
                  backgroundColor: theme.text,
                  opacity: 0.7
                }}
              />
              <span
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: 0,
                  width: '8px',
                  height: '1px',
                  backgroundColor: theme.text,
                  opacity: 0.7
                }}
              />
            </div>
          ) : (
            <div
              className="w-5 h-5 rounded-full border-2"
              style={{
                borderColor: theme.accentSecondary,
                backgroundColor: theme.cardBg,
                transform: `translate(-50%, -50%) scale(${cursorVariant === 'hover' ? 1.6 : 1})`
              }}
            />
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 w-full h-[2px] z-50"
        style={{ backgroundColor: theme.borderLight }}
      >
        <div 
          className="h-full transition-all duration-300"
          style={{ 
            width: `${scrollProgress * 100}%`,
            backgroundColor: theme.accentTertiary
          }}
        />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="fixed right-8 top-8 z-[100] w-11 h-11 rounded-full backdrop-blur-xl 
          border flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          color: theme.text
        }}
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
            className="group flex items-center gap-3 backdrop-blur-xl 
              border rounded-full px-5 py-3 transition-all duration-300 
              hover:scale-105 shadow-lg"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              color: theme.text
            }}
            data-chat-trigger
          >
            <MessageCircle className="w-5 h-5" />
            <span className={`overflow-hidden transition-all duration-1000 
              ${chatExpanded ? 'w-38 opacity-100' : 'w-0 opacity-0'}`}>
              {/* <span className="text-sm whitespace-nowrap">Chat with us (UNDER DEVELOPMENT)</span> */}
              <span className="text-sm whitespace-nowrap">[UNDER DEVELOPMENT]</span>
            </span>
          </button>
        ) : (
          <div className='relative'>
            <div 
              ref={chatPanelRef} 
              className="backdrop-blur-xl border shadow-2xl w-96 h-[500px] flex flex-col relative rounded-none overflow-hidden"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border
              }}
            >
              {/* Chat Header */}
              <div 
                className="flex items-center justify-between p-5 border-b"
                style={{ borderColor: theme.border }}
              >
                <div>
                  <h3 className="font-medium text-base" style={{ color: theme.text }}>
                    Chat with us [UNDER DEVELOPMENT]
                  </h3>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    We're here to help
                  </p>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center 
                    border-2 transition-colors duration-200"
                  style={{
                    backgroundColor: theme.accentSecondary,
                    borderColor: theme.borderStrong
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.accentSecondary;
                  }}
                >
                  <Minus className="w-4 h-4" style={{ color: isDark ? theme.textMuted : theme.text }} />
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-hidden">
                <div
                  ref={chatRef}
                  className="h-full px-5 py-5 space-y-4 overflow-y-auto"
                  style={{ 
                    scrollbarWidth: 'thin', 
                    scrollbarColor: `${theme.borderSecondary} transparent` 
                  }}
                >
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className="max-w-[80%] px-4 py-3 text-sm rounded-none"
                        style={{
                          backgroundColor: msg.type === 'user' 
                            ? theme.accent 
                            : theme.cardBg,
                          color: msg.type === 'user' 
                            ? '#ffffff' 
                            : theme.text,
                          border: msg.type === 'bot' ? `1px solid ${theme.border}` : 'none'
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {messages.length === 1 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-xs mb-3" style={{ color: theme.textMuted }}>
                        Quick questions:
                      </p>
                      {quickQuestions.map((q, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => handleSendMessage(q)}
                          className="w-full text-left text-sm p-3 rounded-none border transition-colors"
                          style={{
                            backgroundColor: theme.cardBg,
                            borderColor: theme.border,
                            color: theme.text
                          }}
                          onMouseEnter={() => setCursorVariant('hover')}
                          onMouseLeave={() => setCursorVariant('default')}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {botTyping && (
                    <div 
                      className="flex items-center gap-2 p-3 rounded-none shadow"
                      style={{ backgroundColor: theme.bgSecondary }}
                    >
                      <p className="text-xs opacity-70 mb-0" style={{ color: theme.textMuted }}>
                        BOT
                      </p>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-none animate-bounce delay-75" style={{ backgroundColor: theme.textMuted }}></span>
                        <span className="w-2 h-2 rounded-none animate-bounce delay-150" style={{ backgroundColor: theme.textMuted }}></span>
                        <span className="w-2 h-2 rounded-none animate-bounce delay-200" style={{ backgroundColor: theme.textMuted }}></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input */}
              <div 
                className="p-4 border-t"
                style={{ borderColor: theme.border }}
              >
                <div className="flex gap-2">
                  <input 
                    ref={inputRef} 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(inputValue); }}
                    placeholder="Type your message..."
                    className="flex-1 border px-4 py-2 text-sm rounded-none 
                      focus:outline-none cursor-text caret-current"
                    style={{ 
                      backgroundColor: theme.cardBg,
                      borderColor: theme.border,
                      color: theme.text,
                      cursor: 'text' 
                    }}
                  />
                  <button 
                    onClick={() => handleSendMessage(inputValue)}
                    className="w-10 h-10 rounded-none border flex items-center justify-center 
                      transition-transform hover:scale-110"
                    style={{
                      backgroundColor: theme.accent,
                      borderColor: theme.borderStrong,
                      color: '#ffffff'
                    }}
                    onMouseEnter={() => setCursorVariant('hover')}
                    onMouseLeave={() => setCursorVariant('default')}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {chatOpen && <ScrollToBottomButton chatRef={chatRef} messages={messages} theme={theme} />}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className="fixed left-0 top-0 h-screen backdrop-blur-xl 
          border-r transition-all duration-500 ease-out z-50"
        style={{ 
          width: sidebarExpanded ? '280px' : '0px', 
          opacity: sidebarExpanded ? 1 : 0,
          backgroundColor: theme.sidebarBg,
          borderColor: theme.border
        }}
      >
        <div className={`h-full flex flex-col justify-between p-10 transition-opacity duration-300 
          ${sidebarExpanded ? 'opacity-100 delay-200' : 'opacity-0'}`}>
          <div>
            <div className="mb-16">
              <button
                type="button"
                onClick={goHomeTop}
                className="text-2xl font-light tracking-[0.14em] mb-2 text-left transition-transform duration-300 hover:translate-x-1"
                style={{ color: theme.text }}
              >
                Sreeshaktipat
              </button>
              <div 
                className="w-12 h-[1px]"
                style={{ backgroundColor: theme.accent }}
              />
            </div>
            
            <nav className="space-y-5">
              {[
                { name: 'Home', onClick: goHomeTop },
                { name: 'Readings', onClick: () => navigate("/readings") },
                { name: 'Gallery', onClick: () => navigate("/gallery") },
                { name: 'Donate', onClick: () => navigate("/donate"), isDonate: true },
                { name: 'Join Us', onClick: () => navigate("/booking") },
                { name: 'Blogs & Updates', onClick: () => navigate("/blog") },
                { name: 'Lineage', onClick: () => goToSection("lineage") },
                { name: 'Offerings', onClick: () => goToSection("offerings") },
                { name: 'FAQs', onClick: () => goToSection("faqs") },
                ...(user ? [{ name: 'Sign Out', onClick: () => setConfirmOpen(true), isSignOut: true }] : []),
              ].map((item, idx) => (
                <button 
                  key={idx} 
                  type="button" 
                  onClick={item.onClick}
                  className="group block relative text-left w-full"
                  onMouseEnter={() => setCursorVariant('hover')}
                  onMouseLeave={() => setCursorVariant('default')}
                >
                  <span 
                    className="block text-lg font-light tracking-wide transition-all duration-300 group-hover:translate-x-3"
                    style={{ color: item.isDonate ? "#b91c1c" : item.isSignOut ? "#f59e0b" : theme.text }}
                  >
                    {item.name}
                  </span>
                  <div
                    className="absolute bottom-0 left-0 h-[2px] nav-underline"
                    style={{ backgroundColor: item.isDonate ? "#b91c1c" : item.isSignOut ? "#f59e0b" : theme.accent }}
                  />
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Circle 
                className="w-2 h-2 fill-current"
                style={{ color: theme.accentSecondary }}
              />
              <span 
                className="text-xs tracking-wide"
                style={{ color: theme.textMuted }}
              >
                Open to Seekers
              </span>
            </div>
            <p 
              className="text-xs tracking-wide opacity-50"
              style={{ color: theme.textMuted }}
            >
              © 2024 Sreeshaktipat Ashram
            </p>
          </div>
        </div>
      </aside>

      <ConfirmDialog
        open={confirmOpen}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        theme={theme}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          await signOut();
          navigate("/admin/login");
        }}
      />

      {/* Hamburger icon */}
      <button 
        ref={hamburgerBtnRef} 
        onClick={() => setSidebarExpanded(!sidebarExpanded)}
        className="fixed top-8 z-[60] w-11 h-11 rounded-full backdrop-blur-xl 
          border flex items-center justify-center transition-all duration-500"
        style={{ 
          left: sidebarExpanded ? '300px' : '32px',
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          color: theme.text
        }}
      >
        <HamburgerIcon open={sidebarExpanded} />
      </button>

      {/* Donate quick access */}
      {!isDonatePage && (
        <button
          type="button"
          onClick={() => navigate("/donate")}
          className="fixed bottom-8 left-8 z-[60] px-4 py-2 rounded-full border text-sm tracking-[0.12em] uppercase transition-all duration-300"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: "#b91c1c",
            color: "#b91c1c",
            boxShadow: "0 12px 30px rgba(185, 28, 28, 0.18)",
            left: sidebarExpanded ? "320px" : "32px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(185, 28, 28, 0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.cardBg;
          }}
        >
          Donate
        </button>
      )}
    </>
  );
}
