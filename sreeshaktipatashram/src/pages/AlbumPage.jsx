import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Play, Sparkles } from "lucide-react";
import { useOutletContext } from "react-router-dom";

import { fetchAlbum, streamAlbum } from "@/api/albumApi";

function useNearViewport(rootMargin = "320px") {
  const ref = useRef(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    if (isNearViewport || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isNearViewport, rootMargin]);

  return [ref, isNearViewport];
}

function MediaCard({ item, index, theme, isDark }) {
  const [ref, isNearViewport] = useNearViewport(item.type === "video" ? "520px" : "300px");
  const offsetClass = [
    "md:mt-0",
    "md:mt-8",
    "md:mt-16",
    "md:mt-4",
    "md:mt-12",
  ][index % 5];

  return (
    <article
      ref={ref}
      className={`group break-inside-avoid mb-5 overflow-hidden border ${offsetClass}`}
      style={{
        backgroundColor: theme.cardBg,
        borderColor: theme.border,
        borderRadius: "8px",
        boxShadow: isDark
          ? "0 24px 50px rgba(0, 0, 0, 0.28)"
          : "0 24px 50px rgba(29, 44, 34, 0.12)",
      }}
    >
      <div className="relative overflow-hidden" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(20, 33, 25, 0.06)" }}>
        {item.type === "video" ? (
          isNearViewport ? (
            <video
              src={item.url}
              controls
              playsInline
              preload="metadata"
              className="block w-full h-auto object-cover"
            />
          ) : (
            <div className="grid aspect-[4/5] place-items-center">
              <div
                className="flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em]"
                style={{
                  borderColor: theme.borderSecondary,
                  color: theme.textSecondary,
                  backgroundColor: theme.cardBg,
                }}
              >
                <Play className="h-3.5 w-3.5" />
                Lazy video
              </div>
            </div>
          )
        ) : isNearViewport ? (
          <img
            src={item.url}
            alt={item.name}
            className="block w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="aspect-[4/5] w-full animate-pulse" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(20, 33, 25, 0.08)" }} />
        )}

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
            {item.type === "video" ? "Dropbox Video" : "Dropbox Photo"}
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
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const loadAlbum = async () => {
      try {
        setLoading(true);
        setStreaming(true);
        setError("");
        let sawItem = false;

        await streamAlbum({
          signal: controller.signal,
          onMeta: (meta) => {
            if (!mounted) return;
            setAlbum((prev) => ({
              ...prev,
              rootPath: meta.root_path || prev.rootPath,
              photosPath: meta.photos_path || prev.photosPath,
              videosPath: meta.videos_path || prev.videosPath,
            }));
          },
          onItem: (item) => {
            if (!mounted) return;
            sawItem = true;
            setAlbum((prev) => {
              if (item.bucket === "videos") {
                return {
                  ...prev,
                  videos: [...prev.videos, item],
                  total: prev.total + 1,
                };
              }
              return {
                ...prev,
                photos: [...prev.photos, item],
                total: prev.total + 1,
              };
            });
          },
          onDone: (counts) => {
            if (!mounted) return;
            setStreaming(false);
            setLoading(false);
            setAlbum((prev) => ({
              ...prev,
              total: Number(counts?.total || prev.total),
            }));
          },
        });

        if (mounted && !sawItem) {
          setStreaming(false);
          setLoading(false);
        }
      } catch (err) {
        if (!mounted || controller.signal.aborted) return;
        try {
          const data = await fetchAlbum();
          if (mounted) {
            setAlbum(data);
            setStreaming(false);
            setLoading(false);
            return;
          }
        } catch {
          if (mounted) {
            setError(err instanceof Error ? err.message : "Failed to load album");
            setStreaming(false);
            setLoading(false);
          }
        }
      }
    };

    loadAlbum();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const heading = useMemo(() => {
    const count = album.photos.length;
    if (!count) return "Ashram Photo Album";
    return `${count} Glimpses from the Ashram`;
  }, [album.photos.length]);

  const mixedMedia = useMemo(
    () => [...album.photos, ...album.videos].sort((a, b) => (b.modified_at || "").localeCompare(a.modified_at || "")),
    [album.photos, album.videos]
  );

  return (
    <section
      className="min-h-screen px-5 pb-20 pt-12 md:px-10 lg:px-16"
      style={{
        backgroundColor: theme.colors.bg.gallery,
        color: theme.text,
        backgroundImage: isDark
          ? "linear-gradient(180deg, rgba(13, 19, 16, 0.95) 0%, rgba(20, 29, 24, 1) 100%)"
          : "linear-gradient(180deg, rgba(252, 248, 242, 1) 0%, rgba(231, 237, 226, 1) 100%)",
      }}
    >
      <div className="mx-auto w-full max-w-7xl">
        <header className="mx-auto mb-12 max-w-4xl text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.26em]"
            style={{
              borderColor: theme.borderSecondary,
              color: theme.textMuted,
              backgroundColor: theme.cardBg,
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Album
          </div>

          <h1
            className="mx-auto max-w-4xl text-4xl sm:text-5xl lg:text-6xl"
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
            className="mx-auto mt-5 max-w-2xl text-base leading-7 sm:text-lg"
            style={{ color: theme.textSecondary }}
          >
            A living moodboard of spaces, rituals, and quiet details, sourced from the Dropbox media root and arranged as a calm, scrollable album.
          </p>

          {!!mixedMedia.length && streaming && (
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6" style={{ color: theme.textMuted }}>
              Rendering as media arrives. {mixedMedia.length} item{mixedMedia.length === 1 ? "" : "s"} ready so far.
            </p>
          )}

          {!!album.videos.length && !loading && !error && (
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6" style={{ color: theme.textMuted }}>
              Videos stay out of the way until they approach the viewport, then load with metadata only so the page keeps its pace.
            </p>
          )}
        </header>

        {loading && !mixedMedia.length ? (
          <div className="grid min-h-[40vh] place-items-center">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em]" style={{ color: theme.textMuted }}>
              <Loader2 className="h-4 w-4 animate-spin" />
              Fetching first media
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
        ) : mixedMedia.length ? (
          <div className="columns-1 gap-5 sm:columns-2 xl:columns-3 2xl:columns-4">
            {mixedMedia.map((item, index) => (
              <MediaCard
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
              No media found
            </p>
            <p className="mt-3 text-base leading-7" style={{ color: theme.textSecondary }}>
              The configured Dropbox root is reachable, but the `photos/` and `videos/` subdirectories do not currently contain supported media files.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
