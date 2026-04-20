import { useEffect, useState } from "react";

export default function SiteFooter({ theme, zIndex = 20 }) {
  const [visitCount, setVisitCount] = useState(null);

  useEffect(() => {
    const counterUrl = import.meta.env.VITE_COUNTER_URL;
    if (!counterUrl || typeof window === "undefined") return;

    const host = window.location.hostname;
    if (import.meta.env.DEV || host === "localhost" || host === "127.0.0.1") return;

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
                {
                  name: "Instagram",
                  href: "https://www.instagram.com/vartikashukla_siddhamahayoga",
                  hoverBg: "linear-gradient(135deg, rgba(254, 218, 117, 0.35) 0%, rgba(250, 126, 30, 0.3) 30%, rgba(214, 41, 118, 0.3) 55%, rgba(150, 47, 191, 0.3) 78%, rgba(79, 91, 213, 0.3) 100%)"
                },
                {
                  name: "Facebook",
                  href: "https://www.facebook.com/sreeshaktipatashram",
                  hoverBg: "linear-gradient(135deg, rgba(24, 119, 242, 0.35) 0%, rgba(66, 165, 255, 0.28) 55%, rgba(123, 196, 255, 0.26) 100%)"
                },
                {
                  name: "YouTube",
                  href: "https://www.youtube.com/@sreeshaktipatashram3633",
                  hoverBg: "linear-gradient(135deg, rgba(255, 59, 48, 0.35) 0%, rgba(255, 0, 0, 0.3) 45%, rgba(176, 0, 0, 0.28) 100%)"
                }
              ].map(({ name, href, hoverBg }, idx) => {
                const isGradientIcon = ["Instagram", "Facebook", "YouTube"].includes(name);
                const gradientStops = {
                  Instagram: [
                    "#feda75 0%",
                    "#fa7e1e 30%",
                    "#d62976 55%",
                    "#962fbf 78%",
                    "#4f5bd5 100%"
                  ],
                  Facebook: ["#1877f2 0%", "#42a5ff 55%", "#7bc4ff 100%"],
                  YouTube: ["#ff3b30 0%", "#ff0000 45%", "#b00000 100%"]
                };

                const paths = {
                  Instagram:
                    "M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9 114.9-51.3 114.9-114.9S287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.9 0-184.9zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z",
                  Facebook:
                    "M279.14 288l14.22-92.66h-88.91V117.78c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.2V288z",
                  YouTube:
                    "M186.8 202.1l95.7 57.4-95.7 57.4v-114.8zM438.2 122.9c-5.4-20.3-21.2-36.2-41.6-41.6C360.6 72 224 72 224 72s-136.6 0-172.6 9.3c-20.3 5.4-36.2 21.2-41.6 41.6C0 159 0 224 0 224s0 65 9.3 101.1c5.4 20.3 21.2 36.2 41.6 41.6 36.1 9.3 172.6 9.3 172.6 9.3s136.6 0 172.6-9.3c20.3-5.4 36.2-21.2 41.6-41.6 9.3-36.1 9.3-101.1 9.3-101.1s0-65-9.3-101.1z"
                };

                const gradientId = `socialGradient-${name.toLowerCase()}`;

                return (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className={`w-12 h-12 border flex items-center justify-center transition-all duration-300 ${
                      isGradientIcon ? "group" : ""
                    }`}
                    style={{
                      borderColor: theme.border,
                      marginLeft: idx === 0 ? 0 : "-1px",
                      backgroundColor: "transparent"
                    }}
                    onMouseEnter={(e) => {
                      if (hoverBg) e.currentTarget.style.backgroundImage = hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundImage = "none";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span className="relative w-5 h-5">
                      <svg
                        viewBox="0 0 448 512"
                        className="absolute inset-0 w-5 h-5 opacity-85 transition-opacity duration-300 group-hover:opacity-0"
                        aria-hidden
                      >
                        <path fill={theme.text} d={paths[name]} />
                      </svg>
                      <svg
                        viewBox="0 0 448 512"
                        className="absolute inset-0 w-5 h-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        aria-hidden
                      >
                        <defs>
                          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            {gradientStops[name].map((stop, index) => {
                              const [color, offset] = stop.split(" ");
                              return <stop key={index} offset={offset} stopColor={color} />;
                            })}
                          </linearGradient>
                        </defs>
                        <path fill={`url(#${gradientId})`} d={paths[name]} />
                      </svg>
                    </span>
                  </a>
                );
              })}
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
