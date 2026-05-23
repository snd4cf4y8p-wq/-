import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 3000);
const siteOrigin = (process.env.PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

function getMime(pathname) {
  return {
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
  }[extname(pathname)] || "application/octet-stream";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

async function serveFile(relativePath, res) {
  try {
    const filePath = normalize(join(__dirname, relativePath));
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }

    const file = await readFile(filePath, extname(filePath) === ".html" ? "utf8" : undefined);
    if (typeof file === "string") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(file.replaceAll("__SITE_ORIGIN__", escapeHtml(siteOrigin)));
      return;
    }

    res.writeHead(200, { "Content-Type": getMime(relativePath) });
    res.end(file);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

function buildSitemapXml() {
  const urls = [`${siteOrigin}/`, `${siteOrigin}/de/`, `${siteOrigin}/fr/`];
  const body = urls.map((url) => `<url><loc>${escapeHtml(url)}</loc></url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  if (pathname === "/sitemap.xml") {
    res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
    res.end(buildSitemapXml());
    return;
  }

  if (pathname === "/robots.txt") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`);
    return;
  }

  if (pathname === "/" || pathname === "") {
    await serveFile("index.html", res);
    return;
  }

  if (pathname === "/de" || pathname === "/de/") {
    await serveFile("de/index.html", res);
    return;
  }

  if (pathname === "/fr" || pathname === "/fr/") {
    await serveFile("fr/index.html", res);
    return;
  }

  if (pathname === "/styles.css" || pathname === "/app.js") {
    await serveFile(pathname.replace(/^\/+/, ""), res);
    return;
  }

  if (pathname.startsWith("/assets/")) {
    await serveFile(pathname.replace(/^\/+/, ""), res);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Page not found");
});

server.listen(port, () => {
  console.log(`mo.co fan site running at http://localhost:${port}`);
});
