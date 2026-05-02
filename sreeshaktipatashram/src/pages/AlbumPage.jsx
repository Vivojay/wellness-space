import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import { useOutletContext } from "react-router-dom";

import { fetchAlbum } from "@/api/albumApi";

function AlbumMasonryCard({ item, index, theme, isDark }) {
  const heightClass = [
    "md:mt-0",
    "md:mt-8",
    "md:mt-16",
    "md:mt-4",
    "md:mt-12",
  ][index % 5];

  return (
    <article
      className={`group break-inside-avoid mb-5 overflow-hidden border ${heightClass}`}
      style={{
        backgroundColor: theme.cardBg,
        borderColor: theme.border,
        borderRadius: "8px",
        boxShadow: isDark
          ? "0 24px 50px rgba(0, 0, 0, 0.28)"
          : "0 24px 50px rgba(29, 44, 34, 0.12)",
      }}
    >
      <div className="relative overflow-hidden">
        <img
          src={item.url}
          alt={item.name}
          className="block w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(to top, rgba(9, 14, 11, 0.52), rgba(9, 14, 11, 0) 45%)"
              : "linear-gradient(to top, rgba(18, 32, 23, 0.16), rgba(18, 32, 23, 0) 45%)",
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p
            className="truncate text-sm"
            style={{ color: theme.text, fontFamily: "'Source Sans 3', sans-serif" }}
            title={item.name}
          >
            {item.name}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.22em]" style={{ color: theme.textMuted }}>
            Dropbox Album
          </p>
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors"
          style={{
            borderColor: theme.borderSecondary,
            color: theme.textSecondary,
            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
          }}
        >
          Open
        </a>
      </div>
    </article>
  );
}

export default function AlbumPage() {
  const { isDark, theme } = useOutletContext();
  const [album, setAlbum] = useState({ photos: [], videos: [], rootPath: "", photosPath: "", videosPath: "", total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadAlbum = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchAlbum();
        if (mounted) {
          setAlbum(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load album");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAlbum();
    return () => {
      mounted = false;
    };
  }, []);

  const heading = useMemo(() => {
    const count = album.photos.length;
    if (!count) return "Ashram Photo Album";
    return `${count} Glimpses from the Ashram`;
  }, [album.photos.length]);

  return (
    <section
      className="min-h-screen px-5 pb-20 pt-10 md:px-10 lg:px-16"
      style={{
        backgroundColor: theme.colors.bg.gallery,
        color: theme.text,
        backgroundImage: isDark
          ? "linear-gradient(180deg, rgba(13, 19, 16, 0.95) 0%, rgba(20, 29, 24, 1) 100%)"
          : "linear-gradient(180deg, rgba(252, 248, 242, 1) 0%, rgba(231, 237, 226, 1) 100%)",
      }}
    >
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.26em]" style={{ borderColor: theme.borderSecondary, color: theme.textMuted, backgroundColor: theme.cardBg }}>
              <Sparkles className="h-3.5 w-3.5" />
              Album
            </div>
            <h1
              className="max-w-4xl text-4xl sm:text-5xl lg:text-6xl"
              style={{
                fontFamily: "'Source Sans 3', sans-serif",
                fontWeight: 300,
                lineHeight: 1.05,
                color: theme.text,
              }}
            >
              {heading}
            </h1>
            <p
              className="mt-4 max-w-2xl text-base leading-7 sm:text-lg"
              style={{ color: theme.textSecondary }}
            >
              A living moodboard of spaces, rituals, and quiet details, sourced directly from the Dropbox `photos/` directory inside the configured media root.
            </p>
          </div>

          <div
            className="grid gap-3 border p-5"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.cardBg,
              borderRadius: "8px",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="grid h-11 w-11 place-items-center rounded-full"
                style={{ backgroundColor: `${theme.accent}24`, color: theme.accent }}
              >
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em]" style={{ color: theme.textMuted }}>
                  Collection
                </p>
                <p className="text-2xl" style={{ color: theme.text }}>
                  {album.photos.length}
                </p>
              </div>
            </div>
            <p className="text-sm leading-6" style={{ color: theme.textSecondary }}>
              Root: <span style={{ color: theme.text }}>{album.rootPath || "Not configured"}</span>
            </p>
            <p className="text-sm leading-6" style={{ color: theme.textSecondary }}>
              Photos: <span style={{ color: theme.text }}>{album.photosPath || "Not configured"}</span>
            </p>
          </div>
        </header>

        {loading ? (
          <div className="grid min-h-[40vh] place-items-center">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em]" style={{ color: theme.textMuted }}>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading album
            </div>
          </div>
        ) : error ? (
          <div
            className="mx-auto max-w-2xl border px-6 py-8 text-center"
            style={{
              borderColor: "rgba(220, 38, 38, 0.35)",
              backgroundColor: isDark ? "rgba(42, 18, 18, 0.66)" : "rgba(255, 245, 245, 0.92)",
              borderRadius: "8px",
            }}
          >
            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: theme.textMuted }}>
              Album unavailable
            </p>
            <p className="mt-3 text-base" style={{ color: theme.text }}>
              {error}
            </p>
          </div>
        ) : album.photos.length ? (
          <div className="columns-1 gap-5 sm:columns-2 xl:columns-3 2xl:columns-4">
            {album.photos.map((item, index) => (
              <AlbumMasonryCard
                key={item.id || `${item.path}-${index}`}
                item={item}
                index={index}
                theme={theme}
                isDark={isDark}
              />
            ))}
          </div>
        ) : (
          <div
            className="mx-auto max-w-3xl border px-6 py-10 text-center"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.cardBg,
              borderRadius: "8px",
            }}
          >
            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: theme.textMuted }}>
              No photos found
            </p>
            <p className="mt-3 text-base leading-7" style={{ color: theme.textSecondary }}>
              The configured Dropbox root is reachable, but the `photos/` subdirectory does not currently contain supported image files.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
