const API_URL = `${import.meta.env.VITE_API_URL}/blog`;
const LIST_CACHE_KEY = "ssa_blogs_cache_v1";
const LIST_CACHE_TTL = 5 * 60 * 1000;
const BLOG_CACHE_TTL = 10 * 60 * 1000;

const readCache = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeCache = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures
  }
};

export async function fetchBlogs({ force = false } = {}) {
  const cached = readCache(LIST_CACHE_KEY);
  const now = Date.now();
  if (!force && cached?.ts && now - cached.ts < LIST_CACHE_TTL && Array.isArray(cached.data)) {
    return cached.data;
  }
  const res = await fetch(API_URL);
  const data = await res.json();
  writeCache(LIST_CACHE_KEY, { ts: now, data });
  return data;
}

export async function fetchBlog(slug) {
  const key = `ssa_blog_${slug}`;
  const cached = readCache(key);
  const now = Date.now();
  if (cached?.ts && now - cached.ts < BLOG_CACHE_TTL && cached.data) {
    return cached.data;
  }
  const res = await fetch(`${API_URL}/${slug}`);
  if (!res.ok) throw new Error("Not found");
  const data = await res.json();
  writeCache(key, { ts: now, data });
  return data;
}
