import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const possiblePaths = [
    path.resolve(import.meta.dirname, "public"),
    path.resolve(import.meta.dirname, "../dist/public"),
    path.resolve(import.meta.dirname, "../../dist/public"),
    path.resolve(process.cwd(), "dist/public"),
    path.resolve(process.cwd(), "dist"),
  ];

  const distPath =
    possiblePaths.find((p) => fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))) ||
    possiblePaths.find((p) => fs.existsSync(p)) ||
    possiblePaths[0];

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
