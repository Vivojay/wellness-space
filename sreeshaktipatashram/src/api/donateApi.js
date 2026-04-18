const API_URL = import.meta.env.VITE_API_URL;

async function parseApiError(res, fallback) {
  let detail = fallback;
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") {
      detail = data.detail;
    } else if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
      detail = data.detail[0].msg;
    }
  } catch {
    try {
      const text = await res.text();
      if (text) detail = text;
    } catch {
      // ignore read errors
    }
  }
  return detail;
}

export async function createDonationDeclarationIntent(payload) {
  const res = await fetch(`${API_URL}/payments/upi/declaration-intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await parseApiError(res, "Failed to create donation intent");
    throw new Error(detail);
  }

  return res.json();
}

export async function createDonationDeclarationAudit(payload) {
  const res = await fetch(`${API_URL}/payments/upi/declaration-audit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await parseApiError(res, "Failed to record donation audit");
    throw new Error(detail);
  }

  return res.json();
}
