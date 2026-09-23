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

  app.use(
    express.static(distPath, {
      maxAge: "1d",
      setHeaders(res, filePath) {
        if (filePath.includes(path.sep + "assets" + path.sep) || filePath.includes("/assets/")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        }
      },
    })
  );

  // Fall through to index.html for non-asset client routes
  app.use("*", (req, res) => {
    // If a request for a static chunk under /assets/ does not exist on disk, return 404
    // rather than index.html so the browser module loader can detect chunk failure cleanly
    if (req.path.startsWith("/assets/")) {
      return res.status(404).send("Asset not found");
    }
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
