import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPublicPath = path.resolve(import.meta.dirname, "../..", "dist", "public");
  const distPath = fs.existsSync(distPublicPath)
    ? distPublicPath
    : path.resolve(import.meta.dirname, "../..", "dist");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
