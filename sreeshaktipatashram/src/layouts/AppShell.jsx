import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import FloatingUI from "@/components/FloatingUI";
import RightFeed from "@/components/RightFeed";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { getTheme, getThemeCSSVars } from "@/config/themeConfig";

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
    { category: "NEWS", text: "Welcome to Sreeshaktipat Ashram – new blog posts coming soon." },
  ]);

  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const isHome = pathname === "/" || pathname === "";

  const chatPanelRef = useRef(null);
  const feedPanelRef = useRef(null);

  // ✅ Use centralized theme configuration
  const theme = useMemo(() => getTheme(isDark), [isDark]);
  const themeCSSVars = useMemo(() => getThemeCSSVars(isDark), [isDark]);


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
    const targetId = location.state?.scrollTo;
    if (!targetId || !isHome) return;

    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        navigate(location.pathname, { replace: true, state: {} });
        return;
      }
      attempts += 1;
      if (attempts < 12) {
        requestAnimationFrame(tryScroll);
      }
    };

    requestAnimationFrame(tryScroll);
  }, [isHome, location.pathname, location.state, navigate]);

  useEffect(() => {
    if (chatOpen) setActiveOverlay("chat");
  }, [chatOpen]);

  useEffect(() => {
    if (rightFeedOpen) setActiveOverlay("feed");
  }, [rightFeedOpen]);

  useEffect(() => {
    let isMounted = true;

    const loadFeed = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/feed?limit=10`);
        if (!res.ok) throw new Error("Failed to load feed");
        const data = await res.json();
        if (isMounted && Array.isArray(data) && data.length) {
          setFeedItems(data);
        }
      } catch (e) {
        if (isMounted) {
          setFeedItems((prev) => prev);
        }
      }
    };

    loadFeed();
    return () => {
      isMounted = false;
    };
  }, []);

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
    <div 
      className={`${theme.bg} ${theme.text} app-shell min-h-screen flex flex-col transition-colors duration-500`}
      style={themeCSSVars}
    >
      {/* Topbar on every route */}
      <Navbar isDark={isDark} theme={theme}/>

      {/* FloatingUI - contains sidebar internally */}
      <FloatingUI
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

      {/* Content outlet */}
      <div
        id="app-scroll"
        className={`
        ${isHome ? '' : 'pt-[110px]'} 
        flex-1 overflow-y-auto flex flex-col
      `}
      >
        <div className="flex-1">
          <Outlet context={{ isDark, theme, setCursorVariant }} />
        </div>
        <SiteFooter theme={theme} />
      </div>
    </div>
  );
}
