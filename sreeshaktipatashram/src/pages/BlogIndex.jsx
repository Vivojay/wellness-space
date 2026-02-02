import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, ArrowUpDown, Calendar, TrendingUp } from "lucide-react";

export default function BlogIndex({ theme }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newestFirst, setNewestFirst] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/blog`)
      .then(res => res.json())
      .then(data => {
        setBlogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
    <section className={`py-16 px-6 md:px-24 ${theme?.bg || "bg-gray-50"} min-h-screen`}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className={`text-6xl md:text-7xl font-light tracking-wider leading-tight mb-6 ${theme?.text || "text-gray-900"} font-petitformal`}>
            Blogs & Updates
          </h1>
          <p className={`text-sm md:text-base ${theme?.textMuted || "text-gray-600"}`}>
            Writings, reflections, and insights
          </p>

          {/* Latest indicator */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-50/60">
            <TrendingUp size={14} className="text-teal-600" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-teal-700 font-medium">
              {newestFirst ? "Latest on top" : "Oldest on top"}
            </span>
          </div>
        </div>

        {/* Controls row */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Sort toggle */}
          <button
            onClick={() => setNewestFirst(v => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 bg-white/70 hover:bg-white transition"
          >
            <ArrowUpDown size={16} />
            <span className="text-sm">{newestFirst ? "Newest First" : "Oldest First"}</span>
          </button>

          {/* Date range filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 bg-white/70">
              <Calendar size={16} className="opacity-70" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-sm outline-none"
              />
              <span className="text-black/40 text-sm">→</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-sm outline-none"
              />
              {(fromDate || toDate) && (
                <button
                  onClick={() => { setFromDate(""); setToDate(""); }}
                  className="ml-2 text-xs px-2 py-1 rounded-lg border border-black/10 bg-white hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Floating create button - FIXED POSITION */}
        <Link
          to="/blog/new"
          className="
            fixed right-10 bottom-28 z-[300]
            w-16 h-16 rounded-full
            border-2 border-teal-800
            bg-teal-200 hover:bg-teal-300
            flex items-center justify-center
            shadow-2xl hover:shadow-teal-500/50
            hover:scale-110 transition-all
            group
          "
          aria-label="Create new blog"
          title="Create new blog"
        >
          <Plus size={32} className="text-black" strokeWidth={2.5} />
        </Link>

        {/* Loading */}
        {loading && (
          <p className={`text-center text-neutral-400 dark:text-neutral-500 italic py-24`}>
            Loading posts…
          </p>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className={`border-l-2 border-gray-300 dark:border-gray-700 pl-6 text-gray-500 dark:text-gray-400 italic py-12`}>
            No blogs published yet (or none in this date range).
          </div>
        )}

        {/* Blog list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-6">
            {filtered.map((b) => (
              <div
                key={b.slug}
                className="relative group border border-black/10 rounded-2xl p-7 bg-white/80 hover:bg-white transition-all hover:shadow-lg"
              >
                {/* Hover action icons */}
                <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition flex gap-2">
                  <Link
                    to={`/blog/edit/${b.slug}`}
                    className="w-10 h-10 rounded-full border border-black/10 bg-white hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center transition-all"
                    title="Edit"
                    aria-label="Edit"
                  >
                    <Pencil size={16} className="text-blue-600" />
                  </Link>

                  <button
                    className="w-10 h-10 rounded-full border border-black/10 bg-white hover:bg-red-50 hover:border-red-300 flex items-center justify-center transition-all"
                    title="Delete"
                    aria-label="Delete"
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!confirm("Delete this post?")) return;
                      const res = await fetch(`${import.meta.env.VITE_API_URL}/blog/${b.slug}`, { method: "DELETE" });
                      if (res.ok) setBlogs(prev => prev.filter(x => x.slug !== b.slug));
                    }}
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>

                <Link to={`/blog/${b.slug}`} className="block">
                  <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-snug group-hover:text-teal-600 transition-colors">
                    {b.title}
                  </h2>

                  <p className="text-gray-600 mt-3 max-w-3xl text-base">
                    {b.excerpt}
                  </p>

                  {b.created_at && (
                    <span className="text-sm text-gray-400 mt-4 block">
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