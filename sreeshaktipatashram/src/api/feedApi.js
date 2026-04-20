const API_URL = `${import.meta.env.VITE_API_URL}/feed`;
const LIST_CACHE_KEY = "ssa_feed_cache_v3";
const LIST_CACHE_MRU_KEY = "ssa_feed_cache_v3_mru";
const MAX_PAGE_CACHE = 10;
const LIST_CACHE_TTL = 5 * 60 * 1000;

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

const readMRU = () => {
  try {
    const raw = sessionStorage.getItem(LIST_CACHE_MRU_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeMRU = (list) => {
  try {
    sessionStorage.setItem(LIST_CACHE_MRU_KEY, JSON.stringify(list));
  } catch {
    // ignore storage failures
  }
};

const touchPageCache = (page, data, now) => {
  const pageKey = `${LIST_CACHE_KEY}_${page}`;
  writeCache(pageKey, { ts: now, data });
  const next = readMRU().filter((p) => p !== page);
  next.unshift(page);
  if (next.length > MAX_PAGE_CACHE) {
    const removed = next.splice(MAX_PAGE_CACHE);
    removed.forEach((p) => {
      try {
        sessionStorage.removeItem(`${LIST_CACHE_KEY}_${p}`);
      } catch {
        // ignore storage failures
      }
    });
  }
  writeMRU(next);
};

export async function fetchFeed({ force = false, limit = 10, page = 1 } = {}) {
  const pageKey = `${LIST_CACHE_KEY}_${page}`;
  const cached = readCache(pageKey);
  const now = Date.now();
  if (!force && cached?.ts && now - cached.ts < LIST_CACHE_TTL && cached.data) {
    return cached.data;
  }
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (page) params.set("page", String(page));
  const res = await fetch(`${API_URL}?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load feed");
  const data = await res.json();
  if (data?.items) {
    touchPageCache(page, data, now);
    return data;
  }
  touchPageCache(page, data, now);
  return { items: Array.isArray(data) ? data : [], page, total: data?.length ?? 0, total_pages: 1 };
}

export async function fetchFeedMeta({ since } = {}) {
  const params = new URLSearchParams();
  if (since) {
    params.set("since", String(since));
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_URL}/meta${suffix}`);
  if (!res.ok) {
    throw new Error("Failed to load feed metadata");
  }
  const data = await res.json();
  return {
    latest_cursor: data?.latest_cursor || null,
    unread_count: Number(data?.unread_count || 0),
    total_published: Number(data?.total_published || 0),
  };
}
