import express from "express";
import fs from "fs";
import path from "path";
import { askAi } from "./server/ask-ai.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
// Cloud Run terminates TLS at its proxy; trust X-Forwarded-Proto so req.protocol reads https.
app.set("trust proxy", true);

// index.html writes __SITE_URL__ where og:url / og:image need an absolute URL. AI Studio injects
// APP_URL at runtime; anywhere else the request's own origin stands in for it.
function withSiteUrl(html: string, fallbackOrigin: string): string {
  const appUrl = process.env.APP_URL;
  const origin = appUrl && /^https?:\/\//.test(appUrl) ? appUrl.replace(/\/+$/, "") : fallbackOrigin;
  return html.replaceAll("__SITE_URL__", origin);
}

// API Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI Q&A API
app.post("/api/ask-ai", async (req, res) => {
  const { status, body } = await askAi(req.body);
  res.status(status).json(body);
});

// Vite integration
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      plugins: [
        {
          name: "site-url",
          transformIndexHtml: (html) => withSiteUrl(html, `http://localhost:${PORT}`),
        },
      ],
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const indexHtml = fs.readFileSync(path.join(distPath, "index.html"), "utf8");
    // index: false so "/" reaches the handler below instead of the raw, placeholder-bearing file.
    app.use(express.static(distPath, { index: false }));
    app.get("*", (req, res) => {
      res.type("html").send(withSiteUrl(indexHtml, `${req.protocol}://${req.get("host")}`));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
