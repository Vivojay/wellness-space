// components/gallery/MediaTile.jsx
import { useEffect, useRef, useState } from "react";
import CarouselMedia from "./CarouselMedia";

export default function MediaTile({ item, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const [hoverReady, setHoverReady] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);

  const hoverTimer = useRef(null);
  const longPressTimer = useRef(null);
  const videoRef = useRef(null);

  const isVideo = item.type === "video";

  // Tune these
  const HOVER_DELAY_MS = 120; // slight delay to feel intentional
  const HOVER_SCALE = 1.04;

  /* ---------- DESKTOP HOVER ---------- */
  const onMouseEnter = () => {
    setHovered(true);

    // delay "ready" state for smoother intentional hover
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setHoverReady(true);
    }, HOVER_DELAY_MS);
  };

  const onMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    setHovered(false);
    setHoverReady(false);

    if (videoRef.current) {
      videoRef.current.pause();
      // optional: rewind a bit for nicer re-hover behavior
      // videoRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;

    if (hoverReady) {
      // play on hoverReady (after delay)
      const p = videoRef.current.play();
      // avoid uncaught promise in some browsers
      if (p?.catch) p.catch(() => {});
    } else {
      // pause when hover ends
      videoRef.current.pause();
    }
  }, [hoverReady]);

  /* ---------- MOBILE LONG PRESS ---------- */
  const onTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setLongPressActive(true);
      onOpen?.(item);
      setTimeout(() => setLongPressActive(false), 120);
    }, 450);
  };

  const onTouchEnd = () => clearTimeout(longPressTimer.current);
  const onTouchMove = () => clearTimeout(longPressTimer.current);

  const mediaClass =
    "w-full h-full object-cover " +
    "transform-gpu will-change-transform " +
    "transition-transform duration-700 ease-out " + // slower + smoother
    (hoverReady ? " scale-[1.04]" : " scale-100");

  return (
    <div
      className="relative aspect-[9/16] overflow-hidden bg-black group rounded-none"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDoubleClick={() => onOpen?.(item)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
    >
      {/* Mobile long-press visual feedback */}
      {longPressActive && (
        <div className="absolute inset-0 bg-white/10 pointer-events-none rounded-lg transition-opacity duration-300" />
      )}

      {/* Optional: subtle dim overlay on hover (nice “premium” feel) */}
      <div
        className={
          "absolute inset-0 pointer-events-none transition-opacity duration-700 ease-out " +
          (hoverReady ? "opacity-10 bg-black" : "opacity-0")
        }
      />

      {/* Media */}
      {item.type === "carousel" && item.media?.length ? (
        <CarouselMedia media={item.media} className={mediaClass} />
      ) : item.type === "video" && item.media?.[0] ? (
        <video
          ref={videoRef}
          src={item.media[0]}
          muted
          playsInline
          preload="none"
          className={mediaClass}
        />
      ) : item.media?.[0] ? (
        <img
          src={item.media[0]}
          loading="lazy"
          decoding="async"
          alt=""
          className={mediaClass}
        />
      ) : (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-sm">
          No media
        </div>
      )}

      {/* Video progress pulse */}
      {isVideo && hovered && (
        <div className="absolute bottom-0 left-0 w-full h-[2px] overflow-hidden">
          <div className="h-full w-full animate-videoPulse bg-gradient-to-r from-transparent via-white to-transparent" />
        </div>
      )}
    </div>
  );
}
