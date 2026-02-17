import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";
import { Trash2, Pencil } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { deleteAdminBlog, fetchAdminBlog } from "@/api/adminApi";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function AdminBlogPreview() {
  const { slug } = useParams();
  const { isDark, theme } = useOutletContext();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug || !token) return;
    setLoading(true);
    setError(null);
    fetchAdminBlog(slug, token)
      .then((data) => setBlog(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug, token]);

  if (loading) {
    return (
      <p className="text-center py-24 italic" style={{ backgroundColor: theme.colors.bg.primary, color: theme.textMuted }}>
        Loading…
      </p>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24" style={{ backgroundColor: theme.colors.bg.primary, color: "#ef4444" }}>
        {error}
      </div>
    );
  }

  if (!blog) return null;

  return (
    <section className="py-12 px-6 md:px-24 min-h-screen" style={{ backgroundColor: theme.colors.bg.primary }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1
            className="text-5xl md:text-6xl font-light tracking-wider leading-tight mb-4 font-petitformal"
            style={{ color: theme.text }}
          >
            Blog Preview
          </h1>
          <p className="text-sm md:text-base" style={{ color: theme.textMuted }}>
            Admin view of this post
          </p>
          <button
            onClick={() => navigate("/admin/blog")}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 border transition-colors rounded-none"
            style={{
              borderColor: theme.accentTertiary + "40",
              backgroundColor: theme.accentTertiary + "15",
              color: theme.accent
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.accentTertiary + "25";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.accentTertiary + "15";
            }}
          >
            Back to blogs
          </button>
        </div>
        <article className="rounded-none p-12 shadow-sm relative" style={{ backgroundColor: theme.colors.bg.card, borderColor: theme.border }}>
          <div className="absolute top-6 right-6 flex gap-2">
            <button
              className="w-10 h-10 rounded-none border flex items-center justify-center"
              style={{ borderColor: theme.border, color: theme.text }}
              onClick={() => navigate(`/admin/blog/edit/${slug}`)}
              aria-label="Edit"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              className="w-10 h-10 rounded-none border flex items-center justify-center"
              style={{ borderColor: theme.border, color: "#b91c1c" }}
              onClick={() => setConfirmOpen(true)}
              aria-label="Delete"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        {blog.image_url && (
          <img
            src={blog.image_url}
            alt={blog.title}
            className="w-full h-auto mb-8"
            loading="lazy"
          />
        )}
        <h1 className="text-5xl md:text-6xl font-light leading-tight mb-4" style={{ color: theme.text }}>
          {blog.title}
        </h1>
        <p className="text-sm mb-8" style={{ color: theme.textMuted }}>
          {blog.published ? "Published" : "Draft"}
        </p>
          <div className="prose prose-neutral max-w-none" style={{ color: isDark ? "#ffffff" : theme.textSecondary }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => (
                  <p className="mb-4" style={{ color: isDark ? "#ffffff" : theme.textSecondary }} {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-6 mb-4" style={{ color: isDark ? "#ffffff" : theme.textSecondary }} {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-6 mb-4" style={{ color: isDark ? "#ffffff" : theme.textSecondary }} {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="mb-1" style={{ color: isDark ? "#ffffff" : theme.textSecondary }} {...props} />
                )
              }}
            >
              {blog.content}
            </ReactMarkdown>
          </div>
        </article>
        <ConfirmDialog
          open={confirmOpen}
          title="Delete blog"
          message="Are you sure you want to delete this post?"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          theme={theme}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={async () => {
            if (!token) return;
            await deleteAdminBlog(slug, token);
            navigate("/admin/blog");
          }}
        />
      </div>
    </section>
  );
}
