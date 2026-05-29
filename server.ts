/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import router from "./src/server-routes";

const app = express();
app.use(express.json({ limit: "10mb" }));
const PORT = 3000;

// Mount the core API router (Advisory Chat, Insights, Bond Images)
app.use("/api", router);

// Vite Dev Server Integration & Static Production Handler
async function serveApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Love Adviser Backend] Server active and routing securely on PORT: ${PORT}`);
  });
}

serveApp();
