import { useEffect, useState } from "react";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";

export default function SiteFooter({ theme, zIndex = 20 }) {
  const [visitCount, setVisitCount] = useState(null);

  useEffect(() => {
    const counterUrl = import.meta.env.VITE_COUNTER_URL;
    if (!counterUrl || typeof window === "undefined") return;

    const host = window.location.hostname;
    const controller = new AbortController();

    fetch(`${counterUrl}/count?host=${encodeURIComponent(host)}`, {
      signal: controller.signal,
      cache: "no-store"
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setVisitCount(data.total ?? data.count ?? null);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  return (
    <footer
      className="py-20 px-8 md:px-24 transition-colors duration-500"
      style={{
        backgroundColor: theme.colors.bg.primary,
        position: 'relative',
        zIndex
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-10">
          <div className="text-center md:text-left">
            <h3
              className="text-2xl font-light tracking-tight mb-2"
              style={{
                color: theme.text,
                fontFamily: "'Source Sans 3', sans-serif"
              }}
            >
              Sreeshaktipat Ashram
            </h3>
            <p
              className="text-[10px] tracking-[0.3em]"
              style={{
                color: theme.textMuted,
                fontFamily: "'Source Sans 3', sans-serif"
              }}
            >
              Where Consciousness Expands
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6">
            <p
              className="text-xs"
              style={{
                color: theme.textMuted,
                fontFamily: "'Source Sans 3', sans-serif"
              }}
            >
              © 2024 All Rights Reserved
            </p>

            <div className="flex gap-0">
              {[
                { name: "Instagram", href: "https://www.instagram.com/vartikashukla_siddhamahayoga", Icon: FaInstagram },
                { name: "Facebook", href: "https://www.facebook.com/sreeshaktipatashram", Icon: FaFacebook },
                { name: "YouTube", href: "https://www.youtube.com/@sreeshaktipatashram3633", Icon: FaYoutube }
              ].map(({ name, href, Icon }, idx) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="w-12 h-12 border flex items-center justify-center transition-all duration-300"
                  style={{
                    borderColor: theme.border,
                    marginLeft: idx === 0 ? 0 : "-1px",
                    backgroundColor: "transparent"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.accent + "25";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <Icon
                    className="w-5 h-5 opacity-70"
                    style={{ color: theme.text }}
                  />
                </a>
              ))}
            </div>

            <p
              className="text-[10px] tracking-[0.2em] opacity-60 text-center"
              style={{
                color: theme.textMuted,
                fontFamily: "'Source Sans 3', sans-serif"
              }}
            >
              Total visits: {visitCount ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
