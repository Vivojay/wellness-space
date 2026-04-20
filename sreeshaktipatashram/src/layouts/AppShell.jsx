import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import FloatingUI from "@/components/FloatingUI";
import RightFeed from "@/components/RightFeed";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { getTheme, getThemeCSSVars } from "@/config/themeConfig";
import { fetchFeed, fetchFeedMeta } from "@/api/feedApi";

import {
  Sun,
  Moon,
  MessageCircle,
  X,
  Minus,
  Send,
  Circle,
} from "lucide-react";

const FEED_READ_CURSOR_KEY = "ssa_feed_read_cursor_v1";
const FEED_LAST_NOTIFIED_CURSOR_KEY = "ssa_feed_last_notified_cursor_v1";
const FEED_DING_AUDIO_URL =
  "https://cdn.freesound.org/previews/740/740423_2675894-lq.mp3";

const readLocal = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeLocal = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore storage failures
  }
};

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
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem("ssa_theme");
      if (stored === "dark") return true;
      if (stored === "light") return false;
    } catch (e) {
      // ignore storage errors
    }
    return false;
  });

  const [cursorVariant, setCursorVariant] = useState("default");

  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef(null);
  const [scrollTarget, setScrollTarget] = useState(null);

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
  const [feedUnreadCount, setFeedUnreadCount] = useState(0);
  const [latestFeedCursor, setLatestFeedCursor] = useState(null);
  const [pendingBellCursor, setPendingBellCursor] = useState(null);
  const feedBellAudioRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const isHome = pathname === "/" || pathname === "";
  const rightFeedOpenRef = useRef(rightFeedOpen);
  const pathnameRef = useRef(pathname);

  const getScrollableContainer = useCallback(() => {
    const node = scrollContainerRef.current || document.getElementById("app-scroll");
    if (!node) return null;
    const isScrollable = node.scrollHeight > node.clientHeight + 2;
    return isScrollable ? node : null;
  }, []);

  const chatPanelRef = useRef(null);
  const feedPanelRef = useRef(null);

  // ✅ Use centralized theme configuration
  const theme = useMemo(() => getTheme(isDark), [isDark]);
  const themeCSSVars = useMemo(() => getThemeCSSVars(isDark), [isDark]);

  const playFeedBell = useCallback(async (cursor, { force = false } = {}) => {
    if (!cursor) return false;

    const lastNotifiedCursor = readLocal(FEED_LAST_NOTIFIED_CURSOR_KEY);
    if (!force && lastNotifiedCursor === cursor) {
      return false;
    }

    try {
      if (!feedBellAudioRef.current) {
        const audio = new Audio(FEED_DING_AUDIO_URL);
        audio.preload = "auto";
        feedBellAudioRef.current = audio;
      }

      const bell = feedBellAudioRef.current;
      bell.currentTime = 0;
      await bell.play();
      writeLocal(FEED_LAST_NOTIFIED_CURSOR_KEY, cursor);
      setPendingBellCursor(null);
      return true;
    } catch {
      setPendingBellCursor(cursor);
      return false;
    }
  }, []);

  const markFeedAsRead = useCallback(
    (cursorOverride = null) => {
      const cursor = cursorOverride || latestFeedCursor;
      if (!cursor) return;
      writeLocal(FEED_READ_CURSOR_KEY, cursor);
      setFeedUnreadCount(0);
      setPendingBellCursor(null);
    },
    [latestFeedCursor]
  );

  useEffect(() => {
    if (!feedBellAudioRef.current) {
      const audio = new Audio(FEED_DING_AUDIO_URL);
      audio.preload = "auto";
      feedBellAudioRef.current = audio;
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ssa_theme");
      if (stored === "dark") setIsDark(true);
      if (stored === "light") setIsDark(false);
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ssa_theme", isDark ? "dark" : "light");
    } catch (e) {
      // ignore storage errors
    }
  }, [isDark]);


  // Scroll progress
  useEffect(() => {
    const getProgress = () => {
      const target = getScrollableContainer();
      if (target) {
        const max = Math.max(1, target.scrollHeight - target.clientHeight);
        return target.scrollTop / max;
      }
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight || document.body.scrollHeight;
      const clientHeight = doc.clientHeight || window.innerHeight;
      const denom = Math.max(1, scrollHeight - clientHeight);
      return scrollTop / denom;
    };

    const onScroll = () => {
      setScrollProgress(getProgress());
    };

    const listenerTarget = getScrollableContainer() || window;
    listenerTarget.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      listenerTarget.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [getScrollableContainer, pathname, scrollTarget]);

  useEffect(() => {
    const targetId = location.state?.scrollTo;
    if (!targetId || !isHome) return;

    let attempts = 0;
    const getOffset = () => {
      const nav = document.querySelector("[data-navbar]");
      const navHeight = nav?.getBoundingClientRect().height || 110;
      return navHeight + 12;
    };
    const scrollToEl = (el) => {
      const scrollContainer = getScrollableContainer();
      const offset = getOffset();
      if (scrollContainer) {
        const elRect = el.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const targetTop = scrollContainer.scrollTop + (elRect.top - containerRect.top) - offset;
        scrollContainer.scrollTo({ top: Math.max(0, targetTop), left: 0, behavior: "smooth" });
      } else {
        const targetTop = window.scrollY + el.getBoundingClientRect().top - offset;
        window.scrollTo({ top: Math.max(0, targetTop), left: 0, behavior: "smooth" });
      }
    };
    const tryScroll = () => {
      if (targetId === "top") {
        const scrollContainer = getScrollableContainer();
        if (scrollContainer) {
          scrollContainer.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }
        navigate(location.pathname, { replace: true, state: {} });
        return;
      }

      const el = document.getElementById(targetId);
      if (el) {
        scrollToEl(el);
        navigate(location.pathname, { replace: true, state: {} });
        return;
      }
      attempts += 1;
      if (attempts < 60) {
        requestAnimationFrame(tryScroll);
      }
    };

    requestAnimationFrame(tryScroll);
  }, [getScrollableContainer, isHome, location.pathname, location.state, navigate]);

  useEffect(() => {
    if (chatOpen) setActiveOverlay("chat");
  }, [chatOpen]);

  useEffect(() => {
    if (rightFeedOpen) setActiveOverlay("feed");
  }, [rightFeedOpen]);

  useEffect(() => {
    rightFeedOpenRef.current = rightFeedOpen;
  }, [rightFeedOpen]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!pendingBellCursor) return;

    let disposed = false;
    const attempt = async () => {
      if (disposed) return;
      await playFeedBell(pendingBellCursor, { force: true });
    };

    window.addEventListener("pointerdown", attempt, { passive: true });
    window.addEventListener("keydown", attempt);
    window.addEventListener("touchstart", attempt, { passive: true });

    return () => {
      disposed = true;
      window.removeEventListener("pointerdown", attempt);
      window.removeEventListener("keydown", attempt);
      window.removeEventListener("touchstart", attempt);
    };
  }, [pendingBellCursor, playFeedBell]);

  useEffect(() => {
    if (rightFeedOpen) {
      markFeedAsRead();
    }
  }, [markFeedAsRead, rightFeedOpen]);

  useEffect(() => {
    if (pathname === "/feed") {
      markFeedAsRead();
    }
  }, [markFeedAsRead, pathname]);

  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const loadFeed = async ({ force = false } = {}) => {
      try {
        const readCursor = readLocal(FEED_READ_CURSOR_KEY);
        const [data, meta] = await Promise.all([
          fetchFeed({ limit: 10, force }),
          fetchFeedMeta({ since: readCursor || undefined }).catch(() => null),
        ]);
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        if (isMounted) {
          if (items.length) {
            setFeedItems(items);
          }

          const latestCursor = meta?.latest_cursor || items[0]?.created_at || null;
          setLatestFeedCursor(latestCursor);

          let unreadCount = Number(meta?.unread_count || 0);
          if (!meta) {
            if (readCursor) {
              unreadCount = items.filter((item) => {
                const createdAt = item?.created_at;
                return createdAt && createdAt > readCursor;
              }).length;
            } else {
              unreadCount = items.length;
            }
          }

          const shouldMarkReadImmediately = rightFeedOpenRef.current || pathnameRef.current === "/feed";
          if (shouldMarkReadImmediately && latestCursor) {
            writeLocal(FEED_READ_CURSOR_KEY, latestCursor);
            setFeedUnreadCount(0);
            setPendingBellCursor(null);
            return;
          }

          setFeedUnreadCount(Math.max(0, unreadCount));

          if (unreadCount > 0 && latestCursor) {
            playFeedBell(latestCursor);
          }
        }
      } catch (e) {
        if (isMounted) {
          setFeedItems((prev) => prev);
        }
      }
    };

    loadFeed({ force: true });
    intervalId = setInterval(() => {
      loadFeed({ force: true });
    }, 60000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [playFeedBell]);

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
        unreadCount={feedUnreadCount}
        onFeedOpened={markFeedAsRead}
        activeOverlay={activeOverlay}
        setActiveOverlay={setActiveOverlay}
        feedPanelRef={feedPanelRef}
      />

      {/* Content outlet */}
        <div
          id="app-scroll"
          ref={(node) => {
            scrollContainerRef.current = node;
            if (node) setScrollTarget(node);
          }}
          className={`
        ${isHome ? '' : 'pt-[110px]'} 
        flex-1 overflow-y-auto flex flex-col
      `}
        >
          <div className="flex-1">
            <Outlet context={{ isDark, theme, setCursorVariant, scrollProgress }} />
        </div>
        <SiteFooter
          theme={theme}
          zIndex={pathname === "/readings" ? -1 : pathname === "/donate" ? 80 : 20}
        />
      </div>
    </div>
  );
}
