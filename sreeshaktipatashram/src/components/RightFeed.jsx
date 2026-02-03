import React, { useEffect, useRef } from 'react';
import { Minus } from 'lucide-react';

const RightFeed = ({ theme, rightFeedOpen, setRightFeedOpen, feedItems, activeOverlay, setActiveOverlay, feedPanelRef }) => {
  const feedRef = useRef(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [feedItems]);

  return (
    <>
      {/* Open Button */}
      {!rightFeedOpen && (
        <button
          onClick={() => { setRightFeedOpen(true); setActiveOverlay?.("feed"); }}
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
            <span 
              className="text-xs tracking-[0.25em]"
              style={{ color: theme.text }}
            >
              FEED
            </span>
            <button
              onClick={() => setRightFeedOpen(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center 
                border-2 transition-colors duration-200"
              style={{
                backgroundColor: theme.accentSecondary,
                borderColor: theme.borderStrong,
                color: theme.text
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.accentSecondary;
              }}
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Feed Content */}
          <div
            ref={feedRef}
            className="relative flex-1 overflow-y-auto p-4 space-y-4 feed-fade"
          >
            {feedItems && feedItems.length > 0 ? (
              feedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="border p-4 rounded-none"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border
                  }}
                >
                  <p 
                    className="text-xs tracking-wide opacity-60 mb-2"
                    style={{ color: theme.textMuted }}
                  >
                    {item.category || 'NEWS'}
                  </p>
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