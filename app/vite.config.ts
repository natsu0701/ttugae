import { createReadStream, existsSync, statSync } from "node:fs";
import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Connect, Plugin } from "vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = path.dirname(fileURLToPath(import.meta.url));
const overlays = path.resolve(root, "../public/overlays");

function sendOverlay(req: Connect.IncomingMessage, res: Connect.ServerResponse, next: Connect.NextFunction) {
  const raw = req.url?.split("?")[0] ?? "";
  if (!raw.startsWith("/overlays/")) return next();
  const rel = decodeURIComponent(raw.slice("/overlays/".length));
  const file = path.resolve(overlays, rel);
  if (!file.startsWith(`${overlays}${path.sep}`) || !existsSync(file) || !statSync(file).isFile()) return next();
  const type = file.endsWith(".webm") ? "video/webm" : file.endsWith(".webp") ? "image/webp" : "application/octet-stream";
  res.setHeader("Content-Type", type);
  createReadStream(file).pipe(res);
}

function overlayAssets(): Plugin {
  return {
    name: "ttugae-overlays",
    configureServer(server) {
      server.middlewares.use(sendOverlay);
    },
    configurePreviewServer(server) {
      server.middlewares.use(sendOverlay);
    },
    async writeBundle(options) {
      if (!options.dir) return;
      const dest = path.join(options.dir, "overlays");
      await mkdir(dest, { recursive: true });
      await cp(overlays, dest, { recursive: true });
    },
  };
}

export default defineConfig({
  plugins: [react(), overlayAssets()],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4174,
    strictPort: true,
  },
});
