import React, { useEffect, useRef } from 'react';
import { Minus } from 'lucide-react';

const RightFeed = ({ theme, rightFeedOpen, setRightFeedOpen, feedItems, activeOverlay, setActiveOverlay, feedPanelRef, isDark }) => {
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
          className={`
            fixed right-6 top-1/2 -translate-y-1/2 z-[70]
            w-10 h-32 rounded-full
            shadow-2xl
            ${theme.cardBg} border ${theme.border}
            backdrop-blur-xl
            flex items-center justify-center
            hover:scale-105 transition-all
          `}
          style={{ zIndex: activeOverlay === "feed" ? 120 : 110 }}
          data-feed-trigger
        >
          <span className="rotate-90 text-xs tracking-[0.3em]">FEED</span>
        </button>
      )}

      {/* Feed Panel */}
      {rightFeedOpen && (
        <div
          ref={feedPanelRef}
          className={`fixed right-6 top-1/2 z-[70]
            w-80 h-[420px]
            ${theme.cardBg} border ${theme.border}
            backdrop-blur-xl
            shadow-2xl
            rounded-none overflow-hidden
            flex flex-col
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${rightFeedOpen
              ? 'opacity-100 scale-100 -translate-y-1/2'
              : 'opacity-0 scale-95 -translate-y-[45%] pointer-events-none'}
          `}
          onMouseDown={() => setActiveOverlay?.("feed")}
          onTouchStart={() => setActiveOverlay?.("feed")}
          style={{ zIndex: activeOverlay === "feed" ? 120 : 110 }}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${theme.border}`}>
            <span className="text-xs tracking-[0.25em]">FEED</span>
            {/* ✅ FIXED: Only color change on hover, no scale */}
            <button
              onClick={() => setRightFeedOpen(false)}
              className={`
                w-9 h-9 rounded-full
                flex items-center justify-center
                border-2 transition-colors duration-200
                ${isDark 
                  ? "bg-[#c9a77c] hover:bg-[#b99263] border-[#9b774e]" 
                  : "bg-[#c9a77c] hover:bg-[#b99263] border-[#9b774e]"
                }
              `}
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
                  className={`${theme.cardBg} border ${theme.border} p-4 rounded-none`}
                >
                  <p className="text-xs tracking-wide opacity-60 mb-2">
                    {item.category || 'NEWS'}
                  </p>
                  <p className="text-sm leading-relaxed">{item.text}</p>
                </div>
              ))
            ) : (
              <p className={`${theme.textMuted} text-sm`}>No updates available…</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RightFeed;