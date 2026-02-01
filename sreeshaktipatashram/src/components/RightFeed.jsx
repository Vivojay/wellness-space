import React, { useEffect, useRef } from 'react';
import { Minus } from 'lucide-react';

const RightFeed = ({ theme, rightFeedOpen, setRightFeedOpen, feedItems }) => {
  const feedRef = useRef(null);

  // Auto-scroll to bottom whenever feedItems change
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
          onClick={() => setRightFeedOpen(true)}
          className={`fixed right-6 top-1/2 -translate-y-1/2 z-[70]
            w-10 h-32 rounded-full
            ${theme.cardBg} border ${theme.border}
            backdrop-blur-xl
            flex items-center justify-center
            hover:scale-105 transition-all`}
        >
          <span className="rotate-90 text-xs tracking-[0.3em]">FEED</span>
        </button>
      )}

      {/* Feed Panel */}
      {rightFeedOpen && (
        <div
          className={`fixed right-6 top-1/2 z-[70]
            w-80 h-[420px]
            ${theme.cardBg} border ${theme.border}
            backdrop-blur-xl
            rounded-2xl shadow-2xl
            flex flex-col
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${rightFeedOpen
              ? 'opacity-100 scale-100 -translate-y-1/2'
              : 'opacity-0 scale-95 -translate-y-[45%] pointer-events-none'}
          `}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${theme.border}`}>
            <span className="text-xs tracking-[0.25em]">FEED</span>
            <button
              onClick={() => setRightFeedOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition"
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
                  className={`${theme.cardBg} border ${theme.border} rounded-xl p-4 shadow-sm`}
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
