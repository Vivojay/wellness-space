import { useMemo, useState, useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { ArrowLeft, Upload } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/auth/AuthContext";
import { createAdminBlog, fetchAdminBlog, updateAdminBlog } from "@/api/adminApi";
import { storage } from "@/auth/firebase";
import AdminHeader from "@/components/AdminHeader";
import ConfirmDialog from "@/components/ConfirmDialog";

function generateRandomSlug() {
  const rand = Math.random().toString(36).slice(2, 10);
  return `post-${Date.now().toString(36)}-${rand}`;
}

export default function BlogEditor() {
  const navigate = useNavigate();
  const { slug: editSlug } = useParams();
  const { isDark, theme } = useOutletContext();
  const { token } = useAuth();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingBlog, setLoadingBlog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const uploadsEnabled = false;
  const [slugValue, setSlugValue] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (editSlug) {
      setSlugValue(editSlug);
      return;
    }
    if (!slugValue) {
      setSlugValue(generateRandomSlug());
    }
  }, [editSlug, slugValue]);

  // Auto-generate excerpt from content (first 150 characters)
  const excerpt = useMemo(() => {
    if (!content.trim()) return "";
    // Remove markdown formatting for excerpt
    const plainText = content
      .replace(/[#*`_~\[\]()]/g, '') // Remove markdown symbols
      .replace(/\n+/g, ' ')          // Replace newlines with spaces
      .trim();
    return plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
  }, [content]);

  const canPublish = useMemo(() => {
    return title.trim() && content.trim();
  }, [title, content]);

  useEffect(() => {
    if (!editSlug || !token) return;
    let isMounted = true;
    setLoadingBlog(true);
    fetchAdminBlog(editSlug, token)
      .then((data) => {
        if (!isMounted) return;
        setTitle(data?.title || "");
        setContent(data?.content || "");
        setPublished(!!data?.published);
        setImageUrl(data?.image_url || "");
      })
      .finally(() => isMounted && setLoadingBlog(false));

    return () => {
      isMounted = false;
    };
  }, [editSlug, token]);

  const publish = async () => {
    if (!canPublish) return;
    
    setIsSubmitting(true);
    const payload = { 
      title: title.trim(), 
      excerpt, 
      slug: slugValue,
      content: content.trim(), 
      image_url: imageUrl || null,
      published
    };
    
    try {
      if (editSlug) {
        await updateAdminBlog(editSlug, payload, token);
      } else {
        await createAdminBlog(payload, token);
      }
      sessionStorage.setItem("ssa_blogs_force_refresh", Date.now().toString());
      alert("Blog saved successfully!");
      navigate("/admin/blog");
    } catch (error) {
      alert("Failed to save blog. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      className="min-h-screen px-6 md:px-24 py-12"
      style={{ backgroundColor: theme.colors.bg.primary }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <AdminHeader theme={theme} />
        {/* Header with cancel and publish buttons */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/blog")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-none text-sm tracking-wide border transition-colors"
              style={{
                borderColor: theme.border,
                color: theme.text,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.bg.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowLeft size={16} />
              Cancel
            </button>
            
              <h1 
                className="text-4xl md:text-5xl font-light"
                style={{ color: theme.text }}
              >
                {editSlug ? "Edit Blog Post" : "New Blog Post"}
              </h1>
            </div>

          <button
            onClick={() => {
              if (published) {
                setConfirmOpen(true);
              } else {
                publish();
              }
            }}
            disabled={!canPublish || isSubmitting}
            className="px-8 py-3 rounded-none text-sm tracking-wide border transition-all"
            style={{
              backgroundColor: canPublish && !isSubmitting ? theme.accent : theme.colors.bg.secondary,
              borderColor: canPublish && !isSubmitting ? theme.accent : theme.border,
              color: canPublish && !isSubmitting ? '#ffffff' : theme.textMuted,
              cursor: canPublish && !isSubmitting ? 'pointer' : 'not-allowed',
              opacity: canPublish && !isSubmitting ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              if (canPublish && !isSubmitting) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (canPublish && !isSubmitting) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            {isSubmitting ? 'Saving...' : published ? 'Publish' : 'Save as draft'}
          </button>
        </div>

        {loadingBlog && (
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Loading blog…
          </p>
        )}

        <ConfirmDialog
          open={confirmOpen}
          title="Publish blog"
          message="Are you sure you want to publish this post now?"
          confirmLabel="Publish"
          cancelLabel="Cancel"
          theme={theme}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            publish();
          }}
        />

        {/* Title input */}
        <div>
          <label 
            className="block text-sm mb-2"
            style={{ color: theme.textMuted }}
          >
            Title *
          </label>
          <input 
            className="w-full border p-4 text-lg rounded-none outline-none transition-colors"
            placeholder="Enter blog title..." 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            style={{
              backgroundColor: theme.colors.bg.card,
              borderColor: theme.border,
              color: theme.text
            }}
          />
        </div>

        {/* Auto-generated slug preview */}
        {!editSlug && slugValue && (
          <div 
            className="px-4 py-3 rounded-none border"
            style={{
              backgroundColor: theme.colors.bg.secondary,
              borderColor: theme.border
            }}
          >
            <p 
              className="text-xs mb-1"
              style={{ color: theme.textMuted }}
            >
              URL Slug (auto-generated):
            </p>
            <p 
              className="text-sm font-mono"
              style={{ color: theme.text }}
            >
              /blog/{slugValue}
            </p>
          </div>
        )}

        <div>
          <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
            Status
          </p>
          <div className="inline-flex border rounded-none overflow-hidden" style={{ borderColor: theme.border }}>
            <button
              type="button"
              onClick={() => setPublished(false)}
              className="px-4 py-2 text-xs tracking-wide"
              style={{
                backgroundColor: !published ? theme.colors.bg.secondary : "transparent",
                color: !published ? theme.text : theme.textMuted,
              }}
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => setPublished(true)}
              className="px-4 py-2 text-xs tracking-wide"
              style={{
                backgroundColor: published ? theme.accent : "transparent",
                color: published ? "#ffffff" : theme.textMuted,
              }}
            >
              Publish Live
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
            Drafts are private. Publish Live makes the post visible on /blog.
          </p>
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: theme.textMuted }}>
            Featured image URL
          </label>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              className="w-full border p-3 text-sm rounded-none outline-none"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{
                backgroundColor: theme.colors.bg.card,
                borderColor: theme.border,
                color: theme.text,
              }}
            />
            <label
              className={`inline-flex items-center gap-2 px-4 py-2 border rounded-none ${
                uploadsEnabled ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              style={{
                borderColor: theme.border,
                color: uploadsEnabled ? theme.text : theme.textMuted,
                opacity: uploadsEnabled ? 1 : 0.7
              }}
              title={uploadsEnabled ? "Upload image" : "Image uploads coming soon"}
            >
              <Upload size={16} />
              {uploadsEnabled ? (uploading ? "Uploading..." : "Upload") : "Upload (soon)"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={!uploadsEnabled || uploading}
                onChange={async (e) => {
                  if (!uploadsEnabled) return;
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    const key = `blog/${Date.now()}-${file.name}`;
                    const fileRef = ref(storage, key);
                    await uploadBytes(fileRef, file);
                    const url = await getDownloadURL(fileRef);
                    setImageUrl(url);
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            </label>
          </div>
          {imageUrl && (
            <img src={imageUrl} alt="Blog" className="mt-4 w-full h-auto" loading="lazy" />
          )}
        </div>

        {/* Auto-generated excerpt preview */}
        {excerpt && (
          <div 
            className="px-4 py-3 rounded-none border"
            style={{
              backgroundColor: theme.colors.bg.secondary,
              borderColor: theme.border
            }}
          >
            <p 
              className="text-xs mb-1"
              style={{ color: theme.textMuted }}
            >
              Excerpt (auto-generated from content):
            </p>
            <p 
              className="text-sm"
              style={{ color: theme.text }}
            >
              {excerpt}
            </p>
          </div>
        )}

        {/* Markdown editor */}
        <div>
          <label 
            className="block text-sm mb-2"
            style={{ color: theme.textMuted }}
          >
            Content * (Markdown supported)
          </label>
          <div data-color-mode={isDark ? "dark" : "light"}>
            <MDEditor 
              value={content} 
              onChange={setContent} 
              height={520} 
              preview="live"
            />
          </div>
        </div>

        {/* Help text */}
        <div 
          className="text-xs space-y-1"
          style={{ color: theme.textMuted }}
        >
          <p>• The URL slug and excerpt will be automatically generated from your title and content.</p>
          <p>• Use markdown formatting for rich text (headings, lists, bold, italic, etc.).</p>
          <p>• Make sure to fill in both title and content before publishing.</p>
        </div>
      </div>
    </section>
  );
}
