const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = 3000;
const API_BASE = "https://api-preview.stoxiio.com";

// Enable CORS for all origins
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// Parse JSON bodies
app.use(express.json());

// Serve static files from dist
app.use(express.static(path.join(__dirname, "dist")));

// Proxy all API requests
app.all("/api/*", async (req, res) => {
  const apiPath = req.path.replace("/api", "");
  const url = `${API_BASE}${apiPath}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`;

  console.log(`[Proxy] ${req.method} ${url}`);

  try {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Language": "en",
    };

    // Forward Authorization header if present
    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization;
    }

    // Forward cookies
    if (req.headers.cookie) {
      headers["Cookie"] = req.headers.cookie;
    }

    const fetchOptions = {
      method: req.method,
      headers,
    };

    // Add body for POST/PUT requests
    if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);

    // Forward cookies from response
    const setCookies = response.headers.raw()["set-cookie"];
    if (setCookies) {
      res.set("Set-Cookie", setCookies);
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      res.status(response.status).send(text);
    }
  } catch (error) {
    console.error("[Proxy Error]", error);
    res.status(500).json({ error: "Proxy error", message: error.message });
  }
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Stoxiio Wrapped server running at http://localhost:${PORT}`);
  console.log(`   Proxying API requests to ${API_BASE}`);
});
