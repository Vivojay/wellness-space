import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Plus, Pencil, Trash2, ArrowUpDown, Calendar, RotateCcw } from "lucide-react";
import { fetchBlogs } from "@/api/blogApi";

export default function BlogIndex() {
  const { isDark, theme } = useOutletContext();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newestFirst, setNewestFirst] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    let isMounted = true;
    fetchBlogs()
      .then(data => {
        if (!isMounted) return;
        setBlogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const parse = (d) => (d ? new Date(d).getTime() : null);

    const fromTs = fromDate ? new Date(fromDate + "T00:00:00").getTime() : null;
    const toTs = toDate ? new Date(toDate + "T23:59:59").getTime() : null;

    const arr = [...blogs].filter(b => {
      const ts = b?.created_at ? parse(b.created_at) : null;
      if (!ts) return true;

      if (fromTs && ts < fromTs) return false;
      if (toTs && ts > toTs) return false;
      return true;
    });

    arr.sort((a, b) => {
      const ta = a?.created_at ? parse(a.created_at) : 0;
      const tb = b?.created_at ? parse(b.created_at) : 0;
      return newestFirst ? (tb - ta) : (ta - tb);
    });

    return arr;
  }, [blogs, newestFirst, fromDate, toDate]);

  return (
    <section 
      className="py-16 px-6 md:px-24 min-h-screen"
      style={{ backgroundColor: theme.colors.bg.primary }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 
            className="text-6xl md:text-7xl font-light tracking-wider leading-tight mb-6 font-petitformal"
            style={{ color: theme.text }}
          >
            Blogs & Updates
          </h1>
          <p 
            className="text-sm md:text-base"
            style={{ color: theme.textMuted }}
          >
            Writings, reflections, and insights
          </p>

          {/* Refresh indicator */}
          <button
            onClick={() => {
              setLoading(true);
              fetchBlogs({ force: true })
                .then(data => {
                  setBlogs(Array.isArray(data) ? data : []);
                  setLoading(false);
                })
                .catch(() => setLoading(false));
            }}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 border transition-colors rounded-none"
            style={{
              borderColor: theme.accentTertiary + '40',
              backgroundColor: theme.accentTertiary + '15',
              color: theme.accent
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.accentTertiary + '25';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.accentTertiary + '15';
            }}
            aria-label="Refresh blogs"
            title="Refresh"
          >
            <RotateCcw size={14} style={{ color: isDark ? '#ffffff' : '#000000' }} />
            <span className="text-[10px] tracking-[0.35em] uppercase font-medium">Refresh</span>
          </button>
        </div>

        {/* Controls row */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Sort toggle */}
          <button
            onClick={() => setNewestFirst(v => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-none border transition-colors"
            style={{
              backgroundColor: theme.colors.bg.card,
              borderColor: theme.border,
              color: theme.text
            }}
          >
            <ArrowUpDown size={16} />
            <span className="text-sm">{newestFirst ? "Newest First" : "Oldest First"}</span>
          </button>

          {/* Date range filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-none border"
              style={{
                backgroundColor: theme.colors.bg.card,
                borderColor: theme.border
              }}
            >
              <Calendar 
                size={16} 
                className="opacity-70"
                style={{ color: theme.textMuted }}
              />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-sm outline-none"
                style={{ color: theme.text }}
              />
              <span 
                className="text-sm"
                style={{ color: theme.textMuted }}
              >
                →
              </span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-sm outline-none"
                style={{ color: theme.text }}
              />
              {(fromDate || toDate) && (
                <button
                  onClick={() => { setFromDate(""); setToDate(""); }}
                  className="ml-2 text-xs px-2 py-1 rounded-none border transition-colors"
                  style={{
                    backgroundColor: theme.colors.bg.primary,
                    borderColor: theme.border,
                    color: theme.text
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Floating create button */}
        <Link
          to="/blog/new"
          className="fixed right-10 bottom-28 z-[300] w-16 h-16 rounded-full
            border-2 flex items-center justify-center shadow-2xl
            hover:scale-110 transition-all group"
          style={{
            backgroundColor: theme.accentTertiary,
            borderColor: theme.accent,
          }}
          aria-label="Create new blog"
          title="Create new blog"
        >
          <Plus size={32} strokeWidth={2.5} style={{ color: '#ffffff' }} />
        </Link>

        {/* Loading */}
        {loading && (
          <p 
            className="text-center italic py-24"
            style={{ color: theme.textMuted }}
          >
            Loading posts…
          </p>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div 
            className="border-l-2 pl-6 italic py-12"
            style={{ 
              borderColor: theme.border,
              color: theme.textMuted
            }}
          >
            No blogs published yet (or none in this date range).
          </div>
        )}

        {/* Blog list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-6">
            {filtered.map((b) => (
              <div
                key={b.slug}
                className="relative group border rounded-none p-7 transition-all hover:shadow-lg"
                style={{
                  backgroundColor: theme.colors.bg.card,
                  borderColor: theme.border
                }}
              >
                {/* Hover action icons */}
                <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition flex gap-2">
                  <Link
                    to={`/blog/edit/${b.slug}`}
                    className="w-10 h-10 rounded-none border flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: theme.colors.bg.card,
                      borderColor: theme.border
                    }}
                    title="Edit"
                    aria-label="Edit"
                  >
                    <Pencil size={16} style={{ color: theme.accent }} />
                  </Link>

                  <button
                    className="w-10 h-10 rounded-none border flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: theme.colors.bg.card,
                      borderColor: theme.border
                    }}
                    title="Delete"
                    aria-label="Delete"
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!confirm("Delete this post?")) return;
                      const res = await fetch(`${import.meta.env.VITE_API_URL}/blog/${b.slug}`, { method: "DELETE" });
                      if (res.ok) setBlogs(prev => prev.filter(x => x.slug !== b.slug));
                    }}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>

                <Link to={`/blog/${b.slug}`} className="block">
                  <h2 
                    className="text-3xl md:text-4xl font-light leading-snug group-hover:text-teal-600 transition-colors"
                    style={{ color: theme.text }}
                  >
                    {b.title}
                  </h2>

                  <p 
                    className="mt-3 max-w-3xl text-base"
                    style={{ color: theme.textSecondary }}
                  >
                    {b.excerpt}
                  </p>

                  {b.created_at && (
                    <span 
                      className="text-sm mt-4 block"
                      style={{ color: theme.textMuted }}
                    >
                      {new Date(b.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
