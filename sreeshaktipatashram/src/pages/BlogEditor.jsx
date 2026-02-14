import { useMemo, useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { ArrowLeft } from "lucide-react";

// Function to generate URL-friendly slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .substring(0, 100);        // Limit length
}

export default function BlogEditor() {
  const navigate = useNavigate();
  const { isDark, theme } = useOutletContext();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug from title
  const slug = useMemo(() => {
    if (!title.trim()) return "";
    return generateSlug(title);
  }, [title]);

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

  const publish = async () => {
    if (!canPublish) return;
    
    setIsSubmitting(true);
    const payload = { 
      title: title.trim(), 
      excerpt, 
      slug, 
      content: content.trim(), 
      published: true 
    };
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/blog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        throw new Error("Failed to publish");
      }
      
      alert("Blog published successfully!");
      navigate("/blog");
    } catch (error) {
      alert("Failed to publish blog. Please try again.");
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
        {/* Header with cancel and publish buttons */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/blog")}
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
              New Blog Post
            </h1>
          </div>

          <button
            onClick={publish}
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
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </button>
        </div>

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
        {slug && (
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
              /blog/{slug}
            </p>
          </div>
        )}

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
