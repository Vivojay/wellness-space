import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

export default function CarouselMedia({ media = [], className = "" }) {
  const [index, setIndex] = useState(0)

  if (!media.length) return null

  const prev = (e) => {
    e.stopPropagation()
    setIndex((i) => (i === 0 ? media.length - 1 : i - 1))
  }

  const next = (e) => {
    e.stopPropagation()
    setIndex((i) => (i === media.length - 1 ? 0 : i + 1))
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <img
        src={media[index]}
        className="w-full h-full object-cover"
        draggable={false}
        loading="lazy"
        decoding="async"
      />

      {media.length > 1 && (
        <>
          {/* Left */}
          <button
            onClick={prev}
            className="
              absolute left-2 top-1/2 -translate-y-1/2
              opacity-0 group-hover:opacity-100
              transition-opacity
              bg-black/50 rounded-full p-1
              text-white
            "
          >
            <ChevronLeft size={16} />
          </button>

          {/* Right */}
          <button
            onClick={next}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              opacity-0 group-hover:opacity-100
              transition-opacity
              bg-black/50 rounded-full p-1
              text-white
            "
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  )
}
