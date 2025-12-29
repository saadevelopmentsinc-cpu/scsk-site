// src/index.js

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Preflight (CORS)
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    }

    // Only allow /count
    if (url.pathname !== "/count") {
      return new Response("Not found", { status: 404 });
    }

    const allowed = String(env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const origin = request.headers.get("Origin") || "";
    const allowOrigin = allowed.includes(origin) ? origin : (allowed[0] || "https://sc-sk.com");

    // Count once per day per visitor (IP-based)
    const ip =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For") ||
      "0.0.0.0";

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const visitorKey = `v:${today}:${ip}`;

    const startAt = Number(env.START_AT || "9000");
    const counterKey = "total";

    // Ensure counter exists
    let total = await env.COUNTER_KV.get(counterKey);
    if (total === null) {
      total = String(startAt);
      await env.COUNTER_KV.put(counterKey, total);
    }

    // If visitor not seen today, increment
    const seen = await env.COUNTER_KV.get(visitorKey);
    if (seen === null) {
      const current = Number(total);
      const next = (Number.isFinite(current) ? current : startAt) + 1;

      await env.COUNTER_KV.put(counterKey, String(next));
      await env.COUNTER_KV.put(visitorKey, "1", { expirationTtl: 60 * 60 * 27 }); // 27h

      total = String(next);
    }

    return new Response(JSON.stringify({ total: Number(total) }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        ...corsHeaders(env, request, allowOrigin),
      },
    });
  },
};

function corsHeaders(env, request, allowOriginOverride) {
  const allowed = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const origin =
    allowOriginOverride ||
    request.headers.get("Origin") ||
    allowed[0] ||
    "https://sc-sk.com";

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
