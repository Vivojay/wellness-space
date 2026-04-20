import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { createAdminFeed, deleteAdminFeed, updateAdminFeed } from "@/api/adminApi";
import { Minus } from 'lucide-react';

const RightFeed = ({
  theme,
  isDark,
  rightFeedOpen,
  setRightFeedOpen,
  feedItems,
  unreadCount = 0,
  onFeedOpened,
  activeOverlay,
  setActiveOverlay,
  feedPanelRef,
}) => {
  const navigate = useNavigate();
  const { isAdmin, token } = useAuth();
  const feedRef = useRef(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickText, setQuickText] = useState("");
  const [quickCategory, setQuickCategory] = useState("NEWS");
  const [quickBusy, setQuickBusy] = useState(false);
  const [localItems, setLocalItems] = useState([]);

  const minimizeButtonBaseBg = isDark ? "rgba(255, 255, 255, 0.92)" : theme.accentSecondary;
  const minimizeButtonHoverBg = isDark ? "#ffffff" : theme.accent;
  const minimizeButtonBorder = isDark ? "rgba(255, 255, 255, 0.98)" : theme.borderStrong;
  const minimizeButtonIcon = isDark ? "#0f172a" : theme.text;

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [rightFeedOpen]);

  useEffect(() => {
    setLocalItems(feedItems || []);
  }, [feedItems]);

  const handleQuickPost = async () => {
    if (!token || !quickText.trim()) return;
    setQuickBusy(true);
    try {
      const payload = { category: quickCategory.trim() || "NEWS", text: quickText.trim(), published: true };
      const res = await createAdminFeed(payload, token);
      const newItem = { ...payload, id: res.id };
      setLocalItems((prev) => [newItem, ...prev]);
      setQuickText("");
      setQuickOpen(false);
    } finally {
      setQuickBusy(false);
    }
  };

  return (
    <>
      {/* Open Button */}
      {!rightFeedOpen && (
        <button
          onClick={() => {
            setRightFeedOpen(true);
            setActiveOverlay?.("feed");
            onFeedOpened?.();
          }}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-[70]
            w-10 h-32 rounded-full shadow-2xl backdrop-blur-xl
            border flex items-center justify-center
            hover:scale-105 transition-all"
          style={{ 
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
            color: theme.text,
            zIndex: activeOverlay === "feed" ? 120 : 110 
          }}
          data-feed-trigger
        >
          <span 
            className="rotate-90 text-xs tracking-[0.3em]"
            style={{ color: theme.text }}
          >
            FEED
          </span>
          {unreadCount > 0 && (
            <span
              className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full text-[10px] leading-5 font-semibold text-center"
              style={{
                backgroundColor: "#ef4444",
                color: "#ffffff",
                boxShadow: "0 6px 14px rgba(239, 68, 68, 0.35)",
              }}
              aria-label={`${unreadCount} unread feed updates`}
              title={`${unreadCount} unread feed updates`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Feed Panel */}
      {rightFeedOpen && (
        <div
          ref={feedPanelRef}
          className="fixed right-6 top-1/2 z-[70]
            w-80 h-[420px] backdrop-blur-xl border shadow-2xl
            rounded-none overflow-hidden flex flex-col
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
            opacity: rightFeedOpen ? 1 : 0,
            transform: rightFeedOpen ? 'translateY(-50%) scale(1)' : 'translateY(-45%) scale(0.95)',
            pointerEvents: rightFeedOpen ? 'auto' : 'none',
            zIndex: activeOverlay === "feed" ? 120 : 110
          }}
          onMouseDown={() => setActiveOverlay?.("feed")}
          onTouchStart={() => setActiveOverlay?.("feed")}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: theme.border }}
          >
            <div className="flex items-center gap-3">
              <span 
                className="text-xs tracking-[0.25em]"
                style={{ color: theme.text }}
              >
                FEED
              </span>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => setQuickOpen((v) => !v)}
                    className="text-[10px] tracking-[0.2em] border px-2 py-1"
                    style={{ borderColor: theme.border, color: theme.textMuted }}
                  >
                    +
                  </button>
                )}
                <button
                  onClick={() => {
                    onFeedOpened?.();
                    navigate("/feed");
                  }}
                  className="text-[10px] tracking-[0.2em] border px-2 py-1"
                  style={{ borderColor: theme.border, color: theme.textMuted }}
                >
                  OPEN
                </button>
              </div>
            </div>
            <button
              onClick={() => setRightFeedOpen(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center 
                border-2 transition-colors duration-200"
              style={{
                backgroundColor: minimizeButtonBaseBg,
                borderColor: minimizeButtonBorder,
                color: minimizeButtonIcon
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = minimizeButtonHoverBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = minimizeButtonBaseBg;
              }}
            >
              <Minus className="w-4 h-4" style={{ color: minimizeButtonIcon }} />
            </button>
          </div>

          {/* Feed Content */}
          <div
            ref={feedRef}
            className="relative flex-1 overflow-y-auto p-4 space-y-4 feed-fade"
          >
            {isAdmin && quickOpen && (
              <div className="border p-3 rounded-none" style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}>
                <div className="flex items-center gap-2 mb-2 justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      value={quickCategory}
                      onChange={(e) => setQuickCategory(e.target.value)}
                      className="border px-2 py-1 text-xs rounded-none"
                      style={{ borderColor: theme.border, color: theme.text, backgroundColor: theme.colors.bg.card }}
                      placeholder="NEWS"
                    />
                    <button
                      onClick={handleQuickPost}
                      disabled={quickBusy}
                      className="text-xs px-2 py-1 border"
                      style={{ borderColor: theme.border, color: theme.text }}
                    >
                      {quickBusy ? "Posting" : "Post"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickOpen(false);
                      setQuickText("");
                    }}
                    className="text-xs px-2 py-1 border"
                    style={{ borderColor: theme.border, color: theme.textMuted }}
                    aria-label="Close"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  value={quickText}
                  onChange={(e) => setQuickText(e.target.value)}
                  className="w-full border p-2 text-xs rounded-none"
                  style={{ borderColor: theme.border, color: theme.text, backgroundColor: theme.colors.bg.card }}
                  placeholder="Write a quick update..."
                  rows={3}
                />
              </div>
            )}

            {localItems && localItems.length > 0 ? (
              localItems.map((item) => (
                <div
                  key={item.id || item.text}
                  className="border p-4 rounded-none"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p 
                      className="text-xs tracking-wide opacity-60"
                      style={{ color: theme.textMuted }}
                    >
                      {item.category || 'NEWS'}
                    </p>
                    {isAdmin && item.id && (
                      <div className="flex items-center gap-2">
                        <button
                          className="text-[10px] border px-2 py-1"
                          style={{ borderColor: theme.border, color: theme.textMuted }}
                          onClick={async () => {
                            const nextText = prompt("Edit feed text:", item.text || "");
                            if (nextText === null) return;
                            const nextCategory = prompt("Edit category:", item.category || "NEWS");
                            const payload = {
                              category: (nextCategory || "NEWS").trim(),
                              text: (nextText || "").trim(),
                              published: item.published ?? true,
                            };
                            await updateAdminFeed(item.id, payload, token);
                            setLocalItems((prev) => prev.map((i) => (i.id === item.id ? { ...payload, id: item.id } : i)));
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-[10px] border px-2 py-1"
                          style={{ borderColor: theme.border, color: "#b91c1c" }}
                          onClick={async () => {
                            await deleteAdminFeed(item.id, token);
                            setLocalItems((prev) => prev.filter((i) => i.id !== item.id));
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: theme.text }}
                  >
                    {item.text}
                  </p>
                </div>
              ))
            ) : (
              <p 
                className="text-sm"
                style={{ color: theme.textMuted }}
              >
                No updates available…
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RightFeed;
