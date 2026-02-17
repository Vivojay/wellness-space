import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Eye, Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { deleteAdminBlog, fetchAdminBlogs, updateAdminBlog } from "@/api/adminApi";
import AdminHeader from "@/components/AdminHeader";

export default function AdminBlog() {
  const { theme } = useOutletContext();
  const { token } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!token) return;

    fetchAdminBlogs(token)
      .then((data) => {
        if (isMounted) setBlogs(Array.isArray(data) ? data : []);
      })
      .finally(() => isMounted && setLoading(false));

    return () => {
      isMounted = false;
    };
  }, [token]);

  const sorted = useMemo(() => {
    return [...blogs].sort((a, b) => {
      const ta = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });
  }, [blogs]);

  const togglePublished = async (item) => {
    if (!token) return;
    const payload = { ...item, published: !item.published };
    await updateAdminBlog(item.slug, payload, token);
    setBlogs((prev) => prev.map((b) => (b.slug === item.slug ? payload : b)));
  };

  const handleDelete = async (item) => {
    if (!token) return;
    if (!confirm(`Delete "${item.title}"?`)) return;
    await deleteAdminBlog(item.slug, token);
    setBlogs((prev) => prev.filter((b) => b.slug !== item.slug));
  };

  return (
    <section className="min-h-screen px-6 md:px-24 py-16" style={{ backgroundColor: theme.colors.bg.primary }}>
      <div className="max-w-6xl mx-auto">
        <AdminHeader theme={theme} />
        <div className="flex items-center justify-between gap-6 mb-10">
          <h1 className="text-4xl md:text-5xl font-light" style={{ color: theme.text }}>
            Admin Blog
          </h1>
          <Link
            to="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-none"
            style={{ borderColor: theme.border, color: theme.text }}
          >
            <Plus size={16} />
            New post
          </Link>
        </div>

        {loading ? (
          <p style={{ color: theme.textMuted }}>Loading…</p>
        ) : (
          <div className="space-y-4">
            {sorted.map((item) => (
              <div
                key={item.slug}
                className="border p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                style={{ borderColor: theme.border, backgroundColor: theme.colors.bg.card }}
              >
                <div>
                  <h3 className="text-lg" style={{ color: theme.text }}>
                    {item.title}
                  </h3>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    /blog/{item.slug}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => togglePublished(item)}
                    className="px-3 py-1 border text-xs rounded-none"
                    style={{
                      borderColor: theme.border,
                      color: item.published ? "#15803d" : theme.textMuted,
                      backgroundColor: item.published ? "rgba(22, 163, 74, 0.1)" : "transparent",
                    }}
                  >
                    {item.published ? "Published" : "Draft"}
                  </button>
                  <Link
                    to={`/admin/blog/edit/${item.slug}`}
                    className="inline-flex items-center gap-2 text-sm"
                    style={{ color: theme.text }}
                  >
                    <Pencil size={14} /> Edit
                  </Link>
                  <Link
                    to={`/admin/blog/preview/${item.slug}`}
                    className="inline-flex items-center gap-2 text-sm"
                    style={{ color: theme.text }}
                  >
                    <Eye size={14} /> Preview
                  </Link>
                  <button
                    onClick={() => handleDelete(item)}
                    className="inline-flex items-center gap-2 text-sm"
                    style={{ color: "#b91c1c" }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
