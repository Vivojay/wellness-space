// components/gallery/SectionRingIndicator.jsx
export default function SectionRingIndicator({ platforms = [], activeIndex = 0 }) {
  const rotation = (360 / platforms.length) * activeIndex;

  return (
    <div className="fixed top-6 right-6 z-[900] pointer-events-none">
      <div className="relative w-16 h-16">
        {/* Ring */}
        <div
          className="
            absolute inset-0 rounded-full
            border-[6px] border-white/20
            transition-transform duration-500 ease-out
          "
          style={{ transform: `rotate(${rotation}deg)` }}
        />

        {/* Label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] uppercase tracking-wide text-white/70">
            {platforms[activeIndex]}
          </span>
        </div>
      </div>
    </div>
  );
}
