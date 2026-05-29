/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./src/server-routes";

dotenv.config();

const app = express();

// Middleware
app.use(cors());

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// API Routes
app.use("/api", router);

// Root Route
app.get("/", (_req, res) => {
  res.status(200).send("❤️ Amour Adviser Backend Running Successfully");
});

// Health Check Route
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is healthy",
    gemini: !!process.env.GEMINI_API_KEY,
  });
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Global Error Handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("SERVER ERROR:", err);

    res.status(500).json({
      error: "Internal server error",
      details: err?.message || "Unknown error",
    });
  }
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Amour Adviser Backend Running on PORT ${PORT}`);
  console.log(
    `🔑 Gemini API Key Loaded: ${!!process.env.GEMINI_API_KEY}`
  );
});