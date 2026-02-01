export default function CaptionSidebar({ open, caption, platform, externalUrl }) {
  return (
    <aside
      className="fixed left-0 top-0 h-full bg-[#111]
                 transition-all duration-500 ease-out
                 border-r border-white/10 z-[999]"
      style={{
        width: open ? "320px" : "0px",
        opacity: open ? 1 : 0,
      }}
    >
      <div
        className={`h-full p-6 text-sm text-white transition-opacity duration-300 ${
          open ? "opacity-100 delay-200" : "opacity-0"
        }`}
      >
        <h3 className="text-lg font-light mb-4 capitalize">
          {platform}
        </h3>

        <p className="leading-relaxed opacity-80 whitespace-pre-wrap">
          {caption || "No caption"}
        </p>

        <a
          href={externalUrl}
          target="_blank"
          className="block mt-6 text-xs underline opacity-60 hover:opacity-100"
        >
          View original post
        </a>
      </div>
    </aside>
  )
}
