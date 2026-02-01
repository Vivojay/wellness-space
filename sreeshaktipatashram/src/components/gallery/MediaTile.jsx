// components/gallery/MediaTile.jsx
import { useEffect, useRef, useState } from "react";
import CarouselMedia from "./CarouselMedia"


export default function MediaTile({ item, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const [hoverReady, setHoverReady] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);

  const hoverTimer = useRef(null);
  const longPressTimer = useRef(null);
  const videoRef = useRef(null);

  const isVideo = item.type === "video";

  /* ---------- DESKTOP HOVER ---------- */
  const onMouseEnter = () => {
    hoverTimer.current = setTimeout(() => {
      setHoverReady(true);
    }, 500);
    setHovered(true);
  };

  const onMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    setHovered(false);
    setHoverReady(false);
    if (videoRef.current) videoRef.current.pause();
  };

  useEffect(() => {
    if (hoverReady && videoRef.current) {
      videoRef.current.play();
    }
  }, [hoverReady]);

  /* ---------- MOBILE LONG PRESS ---------- */
  const onTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setLongPressActive(true); // <-- activate visual feedback
      onOpen?.(item);
      setTimeout(() => setLongPressActive(false), 100); // remove after short delay
    }, 450); 
  };

  const onTouchEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  const onTouchMove = () => {
    // cancel if user scrolls
    clearTimeout(longPressTimer.current);
  };

  return (
    <div
      className="relative aspect-[9/16] overflow-hidden bg-black group"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDoubleClick={() => onOpen?.(item)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
    >
      {/* Mobile long-press visual feedback */}
      {longPressActive && (
        <div className="absolute inset-0 bg-white/10 pointer-events-none rounded-lg transition-opacity" />
      )}

      {/* Media */}
      {item.type === "carousel" && item.media?.length ? (
        <CarouselMedia
          media={item.media}
          className="transition-transform duration-300"
        />
      ) : item.type === "video" && item.media?.[0] ? (
        <video
          ref={videoRef}
          src={item.media[0]}
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ transform: hoverReady ? "scale(1.04)" : "scale(1)" }}
        />
      ) : item.media?.[0] ? (
        <img
          src={item.media[0]}
          loading="lazy"
          alt=""
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ transform: hoverReady ? "scale(1.04)" : "scale(1)" }}
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
