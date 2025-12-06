// Cloudflare Worker - Stoxiio Wrapped
// Serves static assets and proxies /api/* requests to Stoxiio backend

const API_BASE = "https://api-preview.stoxiio.com";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle API proxy requests
    if (url.pathname.startsWith("/api")) {
      return handleApiProxy(request, url);
    }

    // For all other requests, serve static assets
    return env.ASSETS.fetch(request);
  },
};

async function handleApiProxy(request: Request, url: URL): Promise<Response> {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(),
    });
  }

  // Extract the path after /api
  const apiPath = url.pathname.replace(/^\/api/, "");
  const targetUrl = `${API_BASE}${apiPath}${url.search}`;

  console.log(`[Proxy] ${request.method} ${targetUrl}`);

  try {
    // Build headers to forward
    const headers = new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Language": "en",
    });

    // Forward Authorization header if present
    const authHeader = request.headers.get("Authorization");
    if (authHeader) {
      headers.set("Authorization", authHeader);
    }

    // Forward cookies
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
      headers.set("Cookie", cookieHeader);
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    // Add body for POST/PUT/PATCH requests
    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    // Make the request to the backend
    const response = await fetch(targetUrl, fetchOptions);

    // Create response headers with CORS
    const responseHeaders = new Headers(response.headers);
    const corsHeaders = getCorsHeaders();
    for (const [key, value] of Object.entries(corsHeaders)) {
      responseHeaders.set(key, value);
    }

    // Return the proxied response
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Proxy Error]", error);
    return new Response(
      JSON.stringify({
        error: "Proxy error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(),
        },
      },
    );
  }
}

function getCorsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Accept-Language",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

interface Env {
  ASSETS: Fetcher;
}
