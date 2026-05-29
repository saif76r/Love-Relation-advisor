/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import router from "../src/server-routes";

const app = express();
app.use(express.json({ limit: "10mb" }));

// Mount the core API router.
// On Vercel, we rewrite `/api/*` to `/api/index`, and the express app handles `/api/*` routes.
app.use("/api", router);

export default app;
