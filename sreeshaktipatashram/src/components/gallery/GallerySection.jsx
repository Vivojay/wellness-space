import { useState, useEffect } from "react";
import MediaGrid from "./MediaGrid";
import MaximizedViewer from "./MaximizedViewer";
import PlatformIcon from "./PlatformIcon";

export function GallerySection({ platform }) {
  const isDark = document.documentElement.classList.contains('dark');
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/gallery/${platform}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          console.error("Invalid gallery response:", data);
          setItems([]);
        }
      })
      .catch(err => {
        console.error("Gallery fetch failed:", err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [platform]);

  return (
    <>
      {/* ✅ BETTER LOADING UI - Minimal & Professional */}
      {loading && (
        <div className="w-full min-h-screen flex flex-col items-center justify-center">
          {/* Platform indicator while loading */}
          <div className="flex items-center gap-4 mb-8">
            <PlatformIcon platform={platform} />
            <h2 className={`text-2xl font-light tracking-[0.35em] uppercase ${isDark ? 'text-white/70' : 'text-neutral-700'}`}>
              {platform}
            </h2>
          </div>

          {/* Elegant loading animation */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-white/30"
                style={{
                  animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`
                }}
              />
            ))}
          </div>

          <p className={`mt-6 text-sm tracking-wide ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>Loading media...</p>

          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 0.3; transform: scale(0.95); }
              50% { opacity: 1; transform: scale(1.05); }
            }
          `}</style>
        </div>
      )}

      {/* Section header with platform indication */}
      {!loading && (
        <div className="px-6 py-8 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <div className="flex items-center gap-4 mb-3">
            <PlatformIcon platform={platform} />
            <h2 className={`text-2xl font-light tracking-[0.35em] uppercase ${isDark ? 'text-white/80' : 'text-neutral-700'}`}>
              {platform}
            </h2>
          </div>
          <p className={`text-sm ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
            {items.length > 0
              ? `${items.length} ${items.length === 1 ? 'post' : 'posts'}`
              : 'No media yet…'}
          </p>
        </div>
      )}

      {!loading && (
        <MediaGrid
          items={items}
          onOpen={(item) => {
            const idx = items.findIndex(x => x === item);
            setActiveIndex(idx >= 0 ? idx : 0);
          }}
        />
      )}

      {activeIndex !== null && items[activeIndex] && (
        <MaximizedViewer
          items={items}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          platform={platform}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </>
  );
}
