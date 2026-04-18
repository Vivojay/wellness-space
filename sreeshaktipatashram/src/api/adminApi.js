const API_URL = import.meta.env.VITE_API_URL;

async function authFetch(path, { token, method = "GET", body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  if (res.status === 204) return null;
  return res.json();
}

function buildQuery(params = {}) {
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const text = String(value).trim();
    if (!text) return;
    qp.set(key, text);
  });
  return qp.toString();
}

export async function fetchAdminBlogs(token, { limit = 20, page = 1 } = {}) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (page) params.set("page", String(page));
  return authFetch(`/blog/admin/list?${params.toString()}`, { token });
}

export async function fetchAdminBlog(slug, token) {
  return authFetch(`/blog/admin/${slug}`, { token });
}

export async function createAdminBlog(payload, token) {
  return authFetch("/blog", { method: "POST", body: payload, token });
}

export async function updateAdminBlog(slug, payload, token) {
  return authFetch(`/blog/${slug}`, { method: "PUT", body: payload, token });
}

export async function deleteAdminBlog(slug, token) {
  return authFetch(`/blog/${slug}`, { method: "DELETE", token });
}

export async function fetchAdminFeed(token, { limit = 50, page = 1 } = {}) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (page) params.set("page", String(page));
  return authFetch(`/feed/admin/list?${params.toString()}`, { token });
}

export async function createAdminFeed(payload, token) {
  return authFetch("/feed", { method: "POST", body: payload, token });
}

export async function updateAdminFeed(id, payload, token) {
  return authFetch(`/feed/${id}`, { method: "PUT", body: payload, token });
}

export async function deleteAdminFeed(id, token) {
  return authFetch(`/feed/${id}`, { method: "DELETE", token });
}

export async function fetchAdminDonations(token, filters = {}) {
  const query = buildQuery(filters);
  const suffix = query ? `?${query}` : "";
  return authFetch(`/payments/admin/declarations${suffix}`, { token });
}

export async function exportAdminDonationsCsv(token, filters = {}) {
  const query = buildQuery(filters);
  const suffix = query ? `?${query}` : "";
  const res = await fetch(`${API_URL}/payments/admin/declarations/export${suffix}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to export declarations");
  }

  return res.text();
}
