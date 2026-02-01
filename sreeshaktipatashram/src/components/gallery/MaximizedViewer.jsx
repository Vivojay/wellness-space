import { X, ExternalLink, ChevronLeft } from "lucide-react"
import { useEffect, useState } from "react"
import CaptionSidebar from "./CaptionSidebar"
import PlatformIcon from "./PlatformIcon"
import CarouselMedia from "./CarouselMedia"

export default function MaximizedViewer({ item, onClose }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => (document.body.style.overflow = "")
  }, [])

  return (
    <div className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-sm">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-[1000] text-white opacity-80 hover:opacity-100"
      >
        <X />
      </button>

      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-1/2 left-4 z-[1000] text-white opacity-70 hover:opacity-100"
      >
        <ChevronLeft
          className={`transition-transform ${
            sidebarOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Caption Sidebar */}
      <CaptionSidebar
        open={sidebarOpen}
        caption={item.caption}
        platform={item.platform}
        externalUrl={item.externalUrl}
      />

      {/* Media */}
      <div className="relative aspect-[9/16] h-[85vh] max-w-[480px] group">
        {item.type === "carousel" && item.media?.length ? (
          <CarouselMedia media={item.media} />
        ) : item.type === "image" && item.media?.[0] ? (
          <img
            src={item.media[0]}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : item.type === "video" && item.media?.[0] ? (
          <video
            src={item.media[0]}
            autoPlay
            muted
            loop
            controls
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-sm">
            No media
          </div>
        )}
      </div>

      {/* Platform link */}
      <a
        href={item.externalUrl}
        target="_blank"
        className="absolute bottom-6 right-6 flex items-center gap-2 text-white opacity-80 hover:opacity-100"
      >
        <PlatformIcon platform={item.platform} />
        <ExternalLink size={16} />
      </a>
    </div>
  )
}
