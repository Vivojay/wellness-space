// components/gallery/MediaGrid.jsx
import MediaTile from "./MediaTile";
import { ImageOff } from "lucide-react";

export default function MediaGrid({ items = [], onOpen }) {
  const isDark = document.documentElement.classList.contains('dark');
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-6 py-12">
        {/* Icon with subtle animation */}
        <div className="relative mb-8">
          {/* Pulsing background circle - subtle, not distracting */}
          <div 
            className="absolute inset-0 -m-12 rounded-full bg-neutral-400/20"
            style={{
              animation: 'slowPulse 4s ease-in-out infinite'
            }}
          />
          
          {/* Icon container */}
          <div className={`relative w-24 h-24 rounded-full border flex items-center justify-center backdrop-blur-sm ${isDark ? 'bg-neutral-700/30 border-neutral-500/40' : 'bg-neutral-200/60 border-neutral-300'}`}>
            <ImageOff 
              size={40} 
              strokeWidth={1.5} 
              className={isDark ? 'text-neutral-300' : 'text-neutral-500'} 
            />
          </div>
        </div>

        {/* Text content - elegant and minimal */}
        <div className="text-center space-y-3 max-w-md">
          <h3 className={`text-xl font-light tracking-[0.3em] uppercase ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
            No Media Yet
          </h3>
          <p className={`text-sm leading-relaxed tracking-wide ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Content from this platform will appear here once available
          </p>
        </div>

        {/* Decorative dots - subtle indicator */}
        <div className="mt-10 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-neutral-500' : 'bg-neutral-400'}`}
            />
          ))}
        </div>

        <style>{`
          @keyframes slowPulse {
            0%, 100% { 
              opacity: 0.3; 
              transform: scale(0.98); 
            }
            50% { 
              opacity: 0.6; 
              transform: scale(1.02); 
            }
          }
        `}</style>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0 w-full">
      {items.map((item, idx) => (
        <MediaTile
          key={idx}
          item={item}
          onOpen={onOpen}
        />
      ))}
    </div>
  )
}
