import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import FloatingUI from "@/components/FloatingUI";
import RightFeed from "@/components/RightFeed";
import Navbar from "@/components/Navbar";

import {
  Sun,
  Moon,
  MessageCircle,
  X,
  Minus,
  Send,
  Circle,
} from "lucide-react";

/**
 * Simple hamburger icon component expected by FloatingUI
 */
function HamburgerIcon({ open }) {
  return (
    <div className="relative w-5 h-5 flex flex-col items-center justify-center">
      {/* Top stick */}
      <span
        className="absolute w-5 h-[2px] bg-current transition-all duration-300 origin-center"
        style={{
          transform: open 
            ? "translateY(0) rotate(45deg)" 
            : "translateY(-6px) rotate(0deg)"
        }}
      />
      {/* Middle stick */}
      <span
        className="absolute w-5 h-[2px] bg-current transition-all duration-200"
        style={{ opacity: open ? 0 : 1 }}
      />
      {/* Bottom stick */}
      <span
        className="absolute w-5 h-[2px] bg-current transition-all duration-300 origin-center"
        style={{
          transform: open 
            ? "translateY(0) rotate(-45deg)" 
            : "translateY(6px) rotate(0deg)"
        }}
      />
    </div>
  );
}

export default function AppShell() {
  // Core UI state
  const [isDark, setIsDark] = useState(false);

  const [cursorVariant, setCursorVariant] = useState("default");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [scrollProgress, setScrollProgress] = useState(0);

  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Chat UI
  const [chatOpen, setChatOpen] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [botTyping, setBotTyping] = useState(false);

  const [messages, setMessages] = useState([
    { type: "bot", text: "Hi – how can I help you today?" },
  ]);

  const quickQuestions = useMemo(
    () => [
      "How do I book a session?",
      "What is Shaktipat?",
      "Where can I read the PDFs?",
      "How do I contact the ashram?",
    ],
    []
  );

  // Right feed UI
  const [rightFeedOpen, setRightFeedOpen] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [feedItems, setFeedItems] = useState([
    { category: "NEWS", text: "Welcome to Sreeshakti – new blog posts coming soon." },
  ]);

  const { pathname } = useLocation();
  const isHome = pathname === "/" || pathname === "";

  const chatPanelRef = useRef(null);
  const feedPanelRef = useRef(null);

  // Theme tokens
  const theme = useMemo(() => {
    if (isDark) {
      return {
        bg: "bg-[#121212]",
        text: "text-[#f3f3f3]",
        textMuted: "text-white/60",
        cardBg: "bg-[#1a1a1a]/70",
        sidebarBg: "bg-[#141414]/80",
        border: "border-white/10",
        accent: "bg-[#d4a574]",
        accentHover: "bg-[#c79a5f]",
      };
    }
    return {
      bg: "bg-[#faf8f5]",
      text: "text-[#1a1a1a]",
      textMuted: "text-black/60",
      cardBg: "bg-white/70",
      sidebarBg: "bg-white/80",
      border: "border-black/10",
      accent: "bg-[#15616c]",
      accentHover: "bg-[#0f4f58]",
    };
  }, [isDark]);

  // Mouse tracking
  useEffect(() => {
    const onMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight || document.body.scrollHeight;
      const clientHeight = doc.clientHeight || window.innerHeight;
      const denom = Math.max(1, scrollHeight - clientHeight);
      setScrollProgress(scrollTop / denom);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (chatOpen) setActiveOverlay("chat");
  }, [chatOpen]);

  useEffect(() => {
    if (rightFeedOpen) setActiveOverlay("feed");
  }, [rightFeedOpen]);

  // Click outside handler - CLOSE BOTH PANELS
  useEffect(() => {
    const onDown = (e) => {
      const t = e.target;
      const inChat = chatPanelRef.current?.contains(t);
      const inFeed = feedPanelRef.current?.contains(t);

      // Check if click is on chat/feed button
      const isChatButton = t.closest('[data-chat-trigger]');
      const isFeedButton = t.closest('[data-feed-trigger]');

      if (!inChat && !inFeed && !isChatButton && !isFeedButton) {
        setChatOpen(false);
        setRightFeedOpen(false);
        setActiveOverlay(null);
      }
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, []);

  // Chat send handler
  const handleSendMessage = useCallback((text) => {
    const trimmed = String(text ?? "").trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { type: "user", text: trimmed }]);
    setInputValue("");
    setBotTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Got it – I'll help with that." },
      ]);
      setBotTyping(false);
    }, 1200);
  }, []);

  return (
    <div className={`${theme.bg} ${theme.text} min-h-screen transition-colors duration-500`}>
      {/* Topbar on every route */}
      <Navbar isDark={isDark} theme={theme}/>

      {/* ✅ ONLY FloatingUI - it contains the navbar internally */}
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
        X={X}
        MessageCircle={MessageCircle}
        Minus={Minus}
        Send={Send}
        Circle={Circle}
        activeOverlay={activeOverlay}
        setActiveOverlay={setActiveOverlay}
        chatPanelRef={chatPanelRef}
      />

      <RightFeed
        theme={theme}
        isDark={isDark}
        rightFeedOpen={rightFeedOpen}
        setRightFeedOpen={setRightFeedOpen}
        feedItems={feedItems}
        activeOverlay={activeOverlay}
        setActiveOverlay={setActiveOverlay}
        feedPanelRef={feedPanelRef}
      />

      {/* ✅ Content outlet - navbar topbar padding only for non-home pages */}
      {/* <div className={isHome ? "" : "pt-[110px]" + " flex-1 overflow-y-auto"}> */}
      <div className={`
        ${isHome ? '' : 'pt-[110px]'} 
        flex-1 overflow-y-auto
      `}>

        <Outlet context={{ isDark, theme }} />
      </div>
    </div>
  );
}