export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.searchParams.get("host") || "";

    const allowed = (env.ALLOWED_HOSTS || "").split(",").map((h) => h.trim()).filter(Boolean);
    if (!host || (allowed.length && !allowed.includes(host))) {
      return new Response("Invalid host", { status: 400 });
    }

    const hostKey = `visits:${host}`;
    const totalKey = "visits:total";

    const current = Number((await env.VISITS.get(hostKey)) || "0") + 1;
    const total = Number((await env.VISITS.get(totalKey)) || "0") + 1;

    await env.VISITS.put(hostKey, String(current));
    await env.VISITS.put(totalKey, String(total));

    const body = JSON.stringify({
      host,
      count: current,
      total
    });

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      }
    });
  }
};
