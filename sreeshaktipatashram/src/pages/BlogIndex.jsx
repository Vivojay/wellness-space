import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function BlogIndex({ theme }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/blog`)
      .then(res => res.json())
      .then(data => {
        setBlogs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className={`py-12 px-6 md:px-24 ${theme?.bg || "bg-gray-50"} min-h-screen`}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-6xl md:text-7xl font-light tracking-wider leading-tight mb-6 ${theme?.text || "text-gray-900"} font-petitformal`}>
            Blogs & Updates
          </h1>
          <p className={`text-sm md:text-base ${theme?.textMuted || "text-gray-600"}`}>
            Writings, reflections, and insights
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <p className={`text-center text-neutral-400 dark:text-neutral-500 italic py-24`}>
            Loading posts…
          </p>
        )}

        {/* Empty state */}
        {!loading && blogs.length === 0 && (
          <div className={`border-l-2 border-gray-300 dark:border-gray-700 pl-6 text-gray-500 dark:text-gray-400 italic py-12`}>
            No blogs published yet.
          </div>
        )}

        {/* Blog list */}
        {!loading && blogs.length > 0 && (
          <div className="space-y-6">
            {blogs.map((b) => (
              <Link key={b.slug} to={`/blog/${b.slug}`} className="block group">
                <div className={`border rounded-lg p-6 transition-shadow duration-300 hover:shadow-lg bg-white dark:bg-neutral-900`}>
                  <h2 className={`text-3xl md:text-4xl font-light text-gray-900 dark:text-gray-100 leading-snug group-hover:text-teal-400 transition-hover duration-300`}>
                    {b.title}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-3xl text-base">
                    {b.excerpt}
                  </p>
                  {b.created_at && (
                    <span className="text-sm text-gray-400 dark:text-gray-500 mt-4 block">
                      {new Date(b.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
