import { useEffect, useState } from "react";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";

export default function SiteFooter({ theme }) {
  const [uniqueVisitCount, setUniqueVisitCount] = useState(null);

  useEffect(() => {
    const key = "ssa_unique_visited_v1";
    const countKey = "ssa_unique_counter_v1";

    const already = localStorage.getItem(key);
    let count = Number(localStorage.getItem(countKey) || "0");

    if (!already) {
      localStorage.setItem(key, "1");
      count += 1;
      localStorage.setItem(countKey, String(count));
    }
    setUniqueVisitCount(count);
  }, []);

  return (
    <footer
      className="border-t py-20 px-8 md:px-24 transition-colors duration-500"
      style={{
        borderColor: theme.border,
        backgroundColor: theme.colors.bg.primary,
        position: 'relative',
        zIndex: 20
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div>
            <h3
              className="text-2xl font-light tracking-tight mb-2"
              style={{
                color: theme.text,
                fontFamily: "'Source Sans 3', sans-serif"
              }}
            >
              Sreeshakti Patashram
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
              Unique visits (this device): {uniqueVisitCount ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
