import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BlogPost({ theme }) {
  const { slug } = useParams();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    fetch(`${import.meta.env.VITE_API_URL}/blog/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load blog post");
        return res.json();
      })
      .then((data) => setBlog(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <p className="text-center py-24 text-gray-400 dark:text-gray-500 italic">Loading…</p>;
  }

  if (error) {
    return (
      <div className="text-center py-24 text-red-600">
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
    <section className={`py-12 px-6 md:px-24 ${theme?.bg || "bg-gray-50"} min-h-screen`}>
      <Helmet>
        <title>{blog.title}</title>
        <meta name="description" content={blog.excerpt ?? "Blog article"} />
        <link rel="canonical" href={`${window.location.origin}/blog/${slug}`} />
      </Helmet>

      <article className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 rounded-lg p-12 shadow-sm">
        <h1 className={`text-5xl md:text-6xl font-light leading-tight mb-4 ${theme?.text || "text-gray-900"} dark:text-gray-100`}>
          {blog.title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{readingTime} min read</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-4xl text-neutral-200 font-bold mb-4" {...props} />,
              p: ({node, ...props}) => <p className="mb-4 text-neutral-700 dark:text-neutral-300" {...props} />
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </div>

      </article>
    </section>
  );
}
