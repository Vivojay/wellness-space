import { useMemo, useState } from "react";
import MDEditor from "@uiw/react-md-editor";

export default function BlogEditor() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);

  const canPublish = useMemo(() => {
    return title.trim() && excerpt.trim() && slug.trim() && content.trim();
  }, [title, excerpt, slug, content]);

  const publish = async () => {
    const payload = { title, excerpt, slug, content, published: true };
    const res = await fetch(`${import.meta.env.VITE_API_URL}/blog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("Failed to publish");
      return;
    }
    alert("Saved!");
  };

  return (
    <section className="min-h-screen px-6 md:px-24 py-12 bg-neutral-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-6">
          <h1 className="text-4xl md:text-5xl font-light">New Blog</h1>

          <button
            onClick={publish}
            disabled={!canPublish}
            className={`px-6 py-3 rounded-lg text-sm tracking-wide border transition
              ${canPublish ? "bg-black text-white border-black" : "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed"}
            `}
          >
            Publish
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <input className="border p-3 bg-white" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <input className="border p-3 bg-white" placeholder="Slug (unique id)" value={slug} onChange={e => setSlug(e.target.value)} />
          <input className="border p-3 bg-white md:col-span-2" placeholder="Excerpt" value={excerpt} onChange={e => setExcerpt(e.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
            Published
          </label>
        </div>

        <div data-color-mode="light">
          <MDEditor value={content} onChange={setContent} height={520} preview="live" />
        </div>
      </div>
    </section>
  );
}
