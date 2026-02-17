import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Pencil, Trash2, Plus, RotateCcw, ArrowUpDown, Calendar } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { fetchFeed } from "@/api/feedApi";
import { createAdminFeed, deleteAdminFeed, fetchAdminFeed, updateAdminFeed } from "@/api/adminApi";

export default function FeedPage({ adminView = false }) {
  const { isDark, theme } = useOutletContext();
  const { isAdmin, token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({ category: "NEWS", text: "", published: true });
  const [editingId, setEditingId] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const MAX_PAGE_CACHE = 10;
  const forceRefreshKey = "ssa_feed_force_refresh";
  const [newestFirst, setNewestFirst] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const tabsRef = useRef(null);
  const [tabsWidth, setTabsWidth] = useState(null);
  const cacheKeyPreview = "ssa_feed_preview_cache_v3";
  const cacheKeyAdmin = "ssa_feed_admin_cache_v3";

  const readCache = (key) => {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const writeCache = (key, data) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch {
      // ignore storage failures
    }
  };

  const updatePageCache = (key, pageNumber, items, totalPagesValue, refreshedAt) => {
    const existing = readCache(key) || {};
    const pages = { ...(existing.pages || {}) };
    const order = Array.isArray(existing.order) ? existing.order.slice() : [];
    const pageKey = String(pageNumber);
    pages[pageKey] = items;
    const nextOrder = order.filter((p) => p !== pageKey);
    nextOrder.unshift(pageKey);
    if (nextOrder.length > MAX_PAGE_CACHE) {
      const removed = nextOrder.splice(MAX_PAGE_CACHE);
      removed.forEach((p) => {
        delete pages[p];
      });
    }
    writeCache(key, { pages, order: nextOrder, total_pages: totalPagesValue, lastRefreshed: refreshedAt });
  };

  const normalizeFeed = (data) => {
    if (Array.isArray(data)) return { items: data, total_pages: 1 };
    if (Array.isArray(data?.items)) return data;
    return { items: [], total_pages: 1 };
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const shouldForce = !!sessionStorage.getItem(forceRefreshKey);
      if (shouldForce) {
        sessionStorage.removeItem(forceRefreshKey);
      }
      const activeKey = adminView ? cacheKeyAdmin : cacheKeyPreview;
      const cached = readCache(activeKey);
      const pageKey = String(page);
      if (!shouldForce && cached?.pages?.[pageKey]) {
        setItems(cached.pages[pageKey]);
        setTotalPages(cached.total_pages || 1);
        setLastRefreshed(cached.lastRefreshed || null);
        setLoading(false);
        return;
      }
      try {
        if (token) {
          const [previewRaw, adminRaw] = await Promise.all([
            fetchFeed({ limit: 15, page, force: shouldForce }),
            fetchAdminFeed(token, { limit: 15, page })
          ]);
          if (!isMounted) return;
          const previewData = normalizeFeed(previewRaw);
          const adminData = normalizeFeed(adminRaw);
          const now = new Date().toISOString();
          updatePageCache(cacheKeyPreview, page, previewData.items, previewData.total_pages || 1, now);
          updatePageCache(cacheKeyAdmin, page, adminData.items, adminData.total_pages || 1, now);
          if (adminView) {
            setItems(adminData.items);
            setTotalPages(adminData.total_pages || 1);
          } else {
            setItems(previewData.items);
            setTotalPages(previewData.total_pages || 1);
          }
          setLastRefreshed(now);
          return;
        }
        if (adminView) {
          setLoading(false);
          return;
        }
        const data = normalizeFeed(await fetchFeed({ limit: 15, page, force: shouldForce }));
        if (!isMounted) return;
        setItems(data.items);
        setTotalPages(data.total_pages || 1);
        const now = new Date().toISOString();
        updatePageCache(cacheKeyPreview, page, data.items, data.total_pages || 1, now);
        setLastRefreshed(now);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    setPageLoading(true);
    load().finally(() => setPageLoading(false));
    return () => {
      isMounted = false;
    };
  }, [adminView, token, page]);


  useEffect(() => {
    if (!tabsRef.current) return;
    const update = () => {
      const rect = tabsRef.current?.getBoundingClientRect();
      if (!rect) return;
      setTabsWidth(Math.ceil(rect.width));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(tabsRef.current);
    return () => observer.disconnect();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const parse = (d) => (d ? new Date(d).getTime() : null);
    const fromTs = fromDate ? new Date(fromDate + "T00:00:00").getTime() : null;
    const toTs = toDate ? new Date(toDate + "T23:59:59").getTime() : null;

    const arr = [...items].filter((item) => {
      const ts = item?.created_at ? parse(item.created_at) : null;
      if (!ts) return true;
      if (fromTs && ts < fromTs) return false;
      if (toTs && ts > toTs) return false;
      return true;
    });

    arr.sort((a, b) => {
      const ta = a?.created_at ? parse(a.created_at) : 0;
      const tb = b?.created_at ? parse(b.created_at) : 0;
      return newestFirst ? tb - ta : ta - tb;
    });

    return arr;
  }, [items, newestFirst, fromDate, toDate]);

  const submit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (editingId) {
      await updateAdminFeed(editingId, form, token);
      setItems((prev) => prev.map((i) => (i.id === editingId ? { ...form, id: editingId } : i)));
    } else {
      const res = await createAdminFeed(form, token);
      setItems((prev) => [{ ...form, id: res.id }, ...prev]);
    }
    sessionStorage.setItem("ssa_feed_force_refresh", Date.now().toString());
    setPage(1);
    setForm({ category: "NEWS", text: "", published: true });
    setEditingId(null);
  };

  return (
    <section className="py-16 px-6 md:px-24 min-h-screen" style={{ backgroundColor: theme.colors.bg.primary }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-6xl md:text-7xl font-light tracking-wider leading-tight mb-6" style={{ color: theme.accentSecondary }}>
            Feed
          </h1>
          <p className="text-sm md:text-base" style={{ color: theme.textMuted }}>
            Short updates and announcements
          </p>
          {!isAdmin && (
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const raw = await fetchFeed({ force: true, limit: 15, page });
                  const data = normalizeFeed(raw);
                  setItems(data.items);
                  setTotalPages(data.total_pages || 1);
                  const now = new Date().toISOString();
                  updatePageCache(cacheKeyPreview, page, data.items, data.total_pages || 1, now);
                  setLastRefreshed(now);
                } finally {
                  setLoading(false);
                }
              }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 border transition-colors rounded-none"
              style={{
                borderColor: theme.accentTertiary + "40",
                backgroundColor: theme.accentTertiary + "15",
                color: theme.accent
              }}
            >
              <RotateCcw size={14} color={isDark ? "#ffffff" : "#000000"} />
              <span className="text-[10px] tracking-[0.35em] uppercase font-medium">Refresh</span>
            </button>
          )}
          {!isAdmin && lastRefreshed && (
            <div className="mt-2 text-xs" style={{ color: theme.textMuted }}>
              Last refreshed: {new Date(lastRefreshed).toLocaleString()}
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="flex items-center justify-center mb-10">
            <div className="inline-flex flex-col items-center">
              <div
                ref={tabsRef}
                className="inline-flex border rounded-none overflow-hidden"
                style={{ borderColor: theme.border }}
              >
                <Link
                  to="/feed"
                  className="px-4 py-2 text-xs tracking-wide"
                  style={{
                    backgroundColor: adminView ? "transparent" : theme.colors.bg.secondary,
                    color: adminView ? theme.textMuted : theme.text,
                  }}
                >
                  Preview
                </Link>
                <Link
                  to="/admin/feed"
                  className="px-4 py-2 text-xs tracking-wide"
                  style={{
                    backgroundColor: adminView ? theme.colors.bg.secondary : "transparent",
                    color: adminView ? theme.text : theme.textMuted,
                  }}
                >
                  Admin
                </Link>
              </div>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    if (token) {
                      const [previewRaw, adminRaw] = await Promise.all([
                        fetchFeed({ force: true, limit: 15, page }),
                        fetchAdminFeed(token, { limit: 15, page })
                      ]);
                      const previewData = normalizeFeed(previewRaw);
                      const adminData = normalizeFeed(adminRaw);
                      const now = new Date().toISOString();
                      updatePageCache(cacheKeyPreview, page, previewData.items, previewData.total_pages || 1, now);
                      updatePageCache(cacheKeyAdmin, page, adminData.items, adminData.total_pages || 1, now);
                      if (adminView) {
                        setItems(adminData.items);
                        setTotalPages(adminData.total_pages || 1);
                      } else {
                        setItems(previewData.items);
                        setTotalPages(previewData.total_pages || 1);
                      }
                      setLastRefreshed(now);
                    } else {
                      const raw = await fetchFeed({ force: true, limit: 15, page });
                      const data = normalizeFeed(raw);
                      setItems(data.items);
                      setTotalPages(data.total_pages || 1);
                      const now = new Date().toISOString();
                      updatePageCache(cacheKeyPreview, page, data.items, data.total_pages || 1, now);
                      setLastRefreshed(now);
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
                className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 border transition-colors rounded-none"
                style={{
                  width: tabsWidth ? `${tabsWidth}px` : undefined,
                  borderColor: theme.accentTertiary + "40",
                  backgroundColor: theme.accentTertiary + "15",
                  color: theme.accent
                }}
              >
                <RotateCcw size={14} color={isDark ? "#ffffff" : "#000000"} />
                <span className="text-[10px] tracking-[0.35em] uppercase font-medium">Refresh</span>
              </button>
              {lastRefreshed && (
                <div
                  className="mt-2 text-xs text-left"
                  style={{ color: theme.textMuted, width: tabsWidth ? `${tabsWidth}px` : undefined }}
                >
                  Last refreshed: {new Date(lastRefreshed).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <button
            onClick={() => setNewestFirst((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-none border transition-colors"
            style={{
              backgroundColor: theme.colors.bg.card,
              borderColor: theme.border,
              color: theme.text
            }}
          >
            <ArrowUpDown size={16} color={isDark ? "#ffffff" : "#000000"} />
            <span className="text-sm">{newestFirst ? "Newest First" : "Oldest First"}</span>
          </button>

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
              <span className="text-sm" style={{ color: theme.textMuted }}>
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

        {isAdmin && adminView && (
          <div className="flex justify-center mb-10">
            <button
              onClick={() => {
                setEditingId("new");
                setForm({ category: "NEWS", text: "", published: true });
              }}
              className="fixed right-10 bottom-28 z-[300] w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-2xl hover:scale-110 transition-all"
              style={{ backgroundColor: theme.accentSecondary, borderColor: theme.accent }}
              aria-label="Add feed"
              title="Add feed"
            >
              <Plus size={32} strokeWidth={2.5} style={{ color: "#ffffff" }} />
            </button>
          </div>
        )}

        {(loading || pageLoading) && (
          <p className="text-center italic py-24" style={{ color: theme.textMuted }}>
            Loading page…
          </p>
        )}

        {!loading && !pageLoading && filtered.length === 0 && (
          <div className="border-l-2 pl-6 italic py-12" style={{ borderColor: theme.border, color: theme.textMuted }}>
            No feed items yet.
          </div>
        )}

        {!loading && !pageLoading && filtered.length > 0 && (
          <div className="space-y-6">
            {filtered.map((item) => (
              <div
                key={item.id || item.text}
                className="relative border rounded-none p-6 transition-all duration-300 hover:shadow-xl"
                style={{ backgroundColor: theme.colors.bg.secondary, borderColor: theme.border }}
              >
                {isAdmin && adminView && item.id && (
                  <div className="absolute top-5 right-5 flex gap-2">
                    <button
                      className="w-10 h-10 rounded-none border flex items-center justify-center"
                      style={{ borderColor: theme.border, color: theme.text }}
                      onClick={() => {
                        setEditingId(item.id);
                        setForm({ category: item.category || "NEWS", text: item.text || "", published: !!item.published });
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="w-10 h-10 rounded-none border flex items-center justify-center"
                      style={{ borderColor: theme.border, color: "#b91c1c" }}
                      onClick={async () => {
                        if (!token) return;
                        await deleteAdminFeed(item.id, token);
                        setItems((prev) => prev.filter((i) => i.id !== item.id));
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                <p className="text-xs tracking-wide opacity-60 mb-2" style={{ color: theme.textMuted }}>
                  {item.category || "NEWS"}
                </p>
                <p className="text-base leading-relaxed" style={{ color: theme.text }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        )}
        {isAdmin && adminView && editingId && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40">
            <form
              onSubmit={submit}
              className="border p-6 w-full max-w-xl bg-white"
              style={{ borderColor: theme.border, backgroundColor: theme.colors.bg.card }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg" style={{ color: theme.text }}>
                  {editingId === "new" ? "Add Feed" : "Edit Feed"}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="text-sm"
                  style={{ color: theme.textMuted }}
                >
                  Close
                </button>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <input
                  className="border px-3 py-2 rounded-none"
                  style={{ backgroundColor: theme.colors.bg.card, borderColor: theme.border, color: theme.text }}
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  placeholder="Category"
                />
              </div>
              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
                  Status
                </p>
                <div className="inline-flex border rounded-none overflow-hidden" style={{ borderColor: theme.border }}>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, published: false }))}
                    className="px-4 py-2 text-xs tracking-wide"
                    style={{
                      backgroundColor: !form.published ? theme.colors.bg.secondary : "transparent",
                      color: !form.published ? theme.text : theme.textMuted,
                    }}
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, published: true }))}
                    className="px-4 py-2 text-xs tracking-wide"
                    style={{
                      backgroundColor: form.published ? theme.accent : "transparent",
                      color: form.published ? "#ffffff" : theme.textMuted,
                    }}
                  >
                    Publish Live
                  </button>
                </div>
              </div>
              <textarea
                className="w-full border p-3 rounded-none min-h-[120px]"
                style={{ backgroundColor: theme.colors.bg.card, borderColor: theme.border, color: theme.text }}
                value={form.text}
                onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
                placeholder="Write a feed update..."
                required
              />
              <button
                type="submit"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 border rounded-none"
                style={{ borderColor: theme.border, color: theme.text }}
              >
                <Plus size={14} /> {editingId === "new" ? "Add" : "Update"}
              </button>
            </form>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <div className="inline-flex items-center gap-2 flex-wrap justify-center">
              <button
                className="px-3 py-2 border rounded-none text-xs"
                style={{ borderColor: theme.border, color: theme.text }}
                onClick={() => setPage(1)}
                disabled={page === 1 || pageLoading}
              >
                First
              </button>
              <button
                className="px-3 py-2 border rounded-none text-xs"
                style={{ borderColor: theme.border, color: theme.text }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || pageLoading}
              >
                Prev
              </button>
              {(() => {
                const maxButtons = 7;
                const pages = [];
                const start = Math.max(1, page - 2);
                const end = Math.min(totalPages, page + 2);
                if (start > 1) {
                  pages.push(1);
                  if (start > 2) pages.push("...");
                }
                for (let p = start; p <= end; p += 1) pages.push(p);
                if (end < totalPages) {
                  if (end < totalPages - 1) pages.push("...");
                  pages.push(totalPages);
                }
                return pages.slice(0, maxButtons);
              })().map((p, idx) =>
                p === "..." ? (
                  <span key={`dots-${idx}`} className="px-2 text-xs" style={{ color: theme.textMuted }}>
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${p}`}
                    className="px-3 py-2 border rounded-none text-xs"
                    style={{
                      borderColor: theme.border,
                      color: page === p ? theme.accent : theme.text,
                      backgroundColor: page === p ? theme.accentTertiary + "20" : "transparent"
                    }}
                    onClick={() => setPage(p)}
                    disabled={pageLoading}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                className="px-3 py-2 border rounded-none text-xs"
                style={{ borderColor: theme.border, color: theme.text }}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || pageLoading}
              >
                Next
              </button>
              <button
                className="px-3 py-2 border rounded-none text-xs"
                style={{ borderColor: theme.border, color: theme.text }}
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages || pageLoading}
              >
                Last
              </button>
            </div>
            <div className="text-xs" style={{ color: theme.textMuted }}>
              Page {page} of {totalPages}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
