const API_URL = "http://localhost:8000/api/blog";

export async function fetchBlogs() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function fetchBlog(slug) {
  const res = await fetch(`${API_URL}/${slug}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}
