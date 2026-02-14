import { useParams, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchBlog } from "@/api/blogApi";

export default function BlogPost() {
  const { isDark, theme } = useOutletContext();
  const { slug } = useParams();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    fetchBlog(slug)
      .then((data) => setBlog(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <p 
        className="text-center py-24 italic"
        style={{ 
          backgroundColor: theme.colors.bg.primary,
          color: theme.textMuted 
        }}
      >
        Loading…
      </p>
    );
  }

  if (error) {
    return (
      <div 
        className="text-center py-24"
        style={{ 
          backgroundColor: theme.colors.bg.primary,
          color: '#ef4444'
        }}
      >
        {error.includes("Unexpected token")
          ? "Could not load blog. Is the backend running?"
          : error
        }
      </div>
    );
  }

  if (!blog) return null;

  const readingTime = Math.ceil(blog.content.split(" ").length / 200);

  return (
    <section 
      className="py-12 px-6 md:px-24 min-h-screen"
      style={{ backgroundColor: theme.colors.bg.primary }}
    >
      <Helmet>
        <title>{blog.title}</title>
        <meta name="description" content={blog.excerpt ?? "Blog article"} />
        <link rel="canonical" href={`${window.location.origin}/blog/${slug}`} />
      </Helmet>

      <article 
        className="max-w-4xl mx-auto rounded-none p-12 shadow-sm"
        style={{ 
          backgroundColor: theme.colors.bg.card,
          borderColor: theme.border
        }}
      >
        <h1 
          className="text-5xl md:text-6xl font-light leading-tight mb-4"
          style={{ color: theme.text }}
        >
          {blog.title}
        </h1>
        <p 
          className="text-sm mb-8"
          style={{ color: theme.textMuted }}
        >
          {readingTime} min read
        </p>

        <div className="prose prose-neutral max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => (
                <h1 
                  className="text-4xl font-bold mb-4" 
                  style={{ color: theme.text }}
                  {...props} 
                />
              ),
              h2: ({node, ...props}) => (
                <h2 
                  className="text-3xl font-semibold mb-3 mt-6" 
                  style={{ color: theme.text }}
                  {...props} 
                />
              ),
              h3: ({node, ...props}) => (
                <h3 
                  className="text-2xl font-semibold mb-2 mt-5" 
                  style={{ color: theme.text }}
                  {...props} 
                />
              ),
              p: ({node, ...props}) => (
                <p 
                  className="mb-4" 
                  style={{ color: theme.textSecondary }}
                  {...props} 
                />
              ),
              a: ({node, ...props}) => (
                <a 
                  className="underline" 
                  style={{ color: theme.accent }}
                  {...props} 
                />
              ),
              ul: ({node, ...props}) => (
                <ul 
                  className="list-disc pl-6 mb-4" 
                  style={{ color: theme.textSecondary }}
                  {...props} 
                />
              ),
              ol: ({node, ...props}) => (
                <ol 
                  className="list-decimal pl-6 mb-4" 
                  style={{ color: theme.textSecondary }}
                  {...props} 
                />
              ),
              blockquote: ({node, ...props}) => (
                <blockquote 
                  className="border-l-4 pl-4 italic my-4" 
                  style={{ 
                    borderColor: theme.accent,
                    color: theme.textMuted 
                  }}
                  {...props} 
                />
              ),
              code: ({node, inline, ...props}) => 
                inline ? (
                  <code 
                    className="px-1 py-0.5 rounded-none text-sm"
                    style={{ 
                      backgroundColor: theme.colors.bg.secondary,
                      color: theme.accent
                    }}
                    {...props} 
                  />
                ) : (
                  <code 
                    className="block p-4 rounded-none my-4 overflow-x-auto text-sm"
                    style={{ 
                      backgroundColor: theme.colors.bg.secondary,
                      color: theme.text
                    }}
                    {...props} 
                  />
                )
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </div>

      </article>
    </section>
  );
}
