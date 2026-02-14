import { X, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo } from "react";
import PlatformIcon from "./PlatformIcon";
import CarouselMedia from "./CarouselMedia";

function toYouTubeEmbed(url = "") {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.replace("/", "")}`;
    if (u.searchParams.get("v")) return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    if (url.includes("/embed/")) return url;
  } catch {}
  return url;
}

export default function MaximizedViewer({ items = [], activeIndex = 0, setActiveIndex, platform, onClose }) {
  const item = items[activeIndex];
  const hasPrevNext = items.length > 1;

  const prev = () => setActiveIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === items.length - 1 ? 0 : i + 1));

  // ✅ Lock scroll + ESC to close + arrow keys to navigate
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const ytEmbed = useMemo(() => {
    if (item?.platform !== "youtube") return null;
    const maybe = item?.media?.[0] || item?.externalUrl || "";
    return toYouTubeEmbed(maybe);
  }, [item]);

  if (!item) return null;

  return (
    <div 
      className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-sm"
      onClick={onClose} // ✅ Click outside carousel closes viewer
    >
      {/* ✅ Top bar with platform indication & prominent close button */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-[1000]">
        <div className="flex items-center gap-3 text-white/80">
          <PlatformIcon platform={item.platform} />
          <span className="text-xs tracking-[0.35em] uppercase">{platform}</span>
          <span className="text-white/30 text-xs">•</span>
          <span className="text-xs text-white/60">
            {activeIndex + 1} / {items.length}
          </span>
        </div>

        {/* ✅ VISIBLE CLOSE BUTTON with ESC hint */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex items-center gap-3 px-4 py-2 bg-white/10 hover:bg-white/20 
            border border-white/20 rounded-lg transition-all group"
          title="Close (Esc)"
        >
          <span className="text-xs tracking-wide text-white/70 group-hover:text-white hidden sm:inline">
            ESC
          </span>
          <X className="text-white/80 group-hover:text-white" />
        </button>
      </div>

      {/* Main layout - ✅ This is the carousel container */}
      <div 
        className="h-full w-full flex items-center justify-center px-6 pt-20 pb-10"
      >
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[minmax(0,520px)_1fr] gap-8 items-stretch relative">
          {/* ✅ Navigation click zones - full height, invisible, at carousel edges */}
          {hasPrevNext && (
            <>
              {/* Left click zone - full carousel height */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-0 top-0 bottom-0 w-12 z-[950] cursor-pointer group"
                aria-label="Previous"
                style={{ transform: 'translateX(-50%)' }}
              >
                {/* Visual arrow button - centered in click zone */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                  w-12 h-12 flex items-center justify-center
                  bg-black/40 group-hover:bg-black/60 backdrop-blur-sm
                  border border-white/20 group-hover:border-white/40
                  transition-all duration-300 rounded-full pointer-events-none">
                  <ChevronLeft 
                    size={24} 
                    strokeWidth={1.5} 
                    className="text-white/70 group-hover:text-white transition-colors" 
                  />
                </div>
              </button>

              {/* Right click zone - full carousel height */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-0 top-0 bottom-0 w-12 z-[950] cursor-pointer group"
                aria-label="Next"
                style={{ transform: 'translateX(50%)' }}
              >
                {/* Visual arrow button - centered in click zone */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                  w-12 h-12 flex items-center justify-center
                  bg-black/40 group-hover:bg-black/60 backdrop-blur-sm
                  border border-white/20 group-hover:border-white/40
                  transition-all duration-300 rounded-full pointer-events-none">
                  <ChevronRight 
                    size={24} 
                    strokeWidth={1.5} 
                    className="text-white/70 group-hover:text-white transition-colors" 
                  />
                </div>
              </button>
            </>
          )}
          {/* Media */}
          <div 
            className="relative bg-black/20 border border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking media
          >
            <div className="relative aspect-[9/16] w-full h-full max-h-[78vh] mx-auto">
              {item.platform === "youtube" && ytEmbed ? (
                <iframe
                  src={ytEmbed}
                  title={item.caption || "YouTube video"}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : item.type === "carousel" && item.media?.length ? (
                <CarouselMedia media={item.media} className="w-full h-full" />
              ) : item.type === "image" && item.media?.[0] ? (
                <img
                  src={item.media[0]}
                  className="w-full h-full object-cover"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
              ) : item.type === "video" && item.media?.[0] ? (
                <video
                  src={item.media[0]}
                  autoPlay
                  muted
                  loop
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-sm">
                  No media
                </div>
              )}
            </div>
          </div>

          {/* Details sidebar */}
          <aside 
            className="bg-black/20 border border-white/10 p-6 overflow-y-auto max-h-[78vh]"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking sidebar
          >
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3 text-white/80">
                <PlatformIcon platform={item.platform} />
                <h3 className="text-sm tracking-[0.25em] uppercase">{item.platform}</h3>
              </div>

              {item.externalUrl && (
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white transition text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={16} />
                  <span className="hidden sm:inline">Open original</span>
                </a>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                {item.caption || "No caption"}
              </p>

              {item.platform === "youtube" && ytEmbed && (
                <div className="text-xs text-white/50 break-all">
                  Embed: {ytEmbed}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
