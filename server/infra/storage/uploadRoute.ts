import express, { type Express, type Request, type Response } from "express";
import dns from "node:dns";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Ensure Node.js undici/fetch resolves external media CDNs (catbox.moe, imgbb.com) via IPv4 c-ares
// even when Windows/ISP getaddrinfo returns broken NAT64 IPv6 addresses or times out
try {
  dns.setDefaultResultOrder("ipv4first");
  const currentServers = dns.getServers();
  const publicDns = ["1.1.1.1", "8.8.8.8", "8.8.4.4"];
  const merged = Array.from(new Set([...publicDns, ...currentServers]));
  dns.setServers(merged);

  if (!(dns as any).__cycleIpv4LookupPatched) {
    (dns as any).__cycleIpv4LookupPatched = true;
    const origLookup = dns.lookup.bind(dns);
    (dns as any).lookup = (hostname: string, options: any, cb?: any) => {
      const callback = typeof options === "function" ? options : cb;
      const opts =
        typeof options === "number"
          ? { family: options }
          : typeof options === "object" && options !== null
          ? options
          : {};
      if (
        !hostname ||
        hostname === "localhost" ||
        hostname.startsWith("127.") ||
        hostname === "::1" ||
        /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
      ) {
        return origLookup(hostname, options, cb);
      }
      if (opts.family === 6) {
        const err: any = new Error(`queryAaaa ENOTFOUND ${hostname}`);
        err.code = "ENOTFOUND";
        return process.nextTick(() => (opts.all ? callback(err, []) : callback(err)));
      }
      dns.resolve4(hostname, (err, addresses) => {
        if (err || !addresses || addresses.length === 0) {
          const notFound: any = new Error(`queryA ENOTFOUND ${hostname}`);
          notFound.code = "ENOTFOUND";
          return opts.all ? callback(notFound, []) : callback(notFound);
        }
        if (opts.all) {
          return callback(
            null,
            addresses.map((address) => ({ address, family: 4 }))
          );
        }
        return callback(null, addresses[0], 4);
      });
    };
  }
} catch {
  // Ignore DNS configuration errors in restricted runtimes
}

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

function getVideoMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".webm") return "video/webm";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".ogg" || ext === ".ogv") return "video/ogg";
  if (ext === ".mkv") return "video/x-matroska";
  return "video/mp4";
}

function stripDataUrlPrefix(base64: string): string {
  const trimmed = base64.trim();
  const base64Marker = ";base64,";
  const markerIdx = trimmed.indexOf(base64Marker);
  if (markerIdx !== -1 && markerIdx < 128) {
    return trimmed.slice(markerIdx + base64Marker.length);
  }
  return trimmed.replace(/^data:[^,]+,/, "");
}

function getCacheDirs(): string[] {
  const dirs: string[] = [];
  try {
    const tmpDir = path.join(os.tmpdir(), "cycle_uploads");
    fs.mkdirSync(tmpDir, { recursive: true });
    dirs.push(tmpDir);
  } catch {}
  if (!process.env.VERCEL) {
    try {
      const localDir = path.resolve(process.cwd(), "uploads", "videos");
      fs.mkdirSync(localDir, { recursive: true });
      dirs.push(localDir);
    } catch {}
  }
  return dirs;
}

function saveVideoToCache(filename: string, buffer: Buffer): void {
  const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
  if (!safeName) return;
  for (const dir of getCacheDirs()) {
    try {
      fs.writeFileSync(path.join(dir, safeName), buffer);
    } catch {}
  }
}

function findCachedVideoPath(filename: string): string | null {
  const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
  if (!safeName) return null;
  for (const dir of getCacheDirs()) {
    const candidate = path.join(dir, safeName);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function streamVideoFileWithRange(req: Request, res: Response, filePath: string, filename?: string) {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const contentType = getVideoMimeType(filename || filePath);
  const range = req.headers.range;

  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    if (Number.isNaN(start) || start >= fileSize || end >= fileSize || start > end) {
      res.status(416).setHeader("Content-Range", `bytes */${fileSize}`);
      return res.end();
    }
    const chunkSize = end - start + 1;
    res.status(206);
    res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
    res.setHeader("Content-Length", String(chunkSize));
    const stream = fs.createReadStream(filePath, { start, end });
    stream.on("error", () => res.end());
    return stream.pipe(res);
  }

  res.status(200);
  res.setHeader("Content-Length", String(fileSize));
  const stream = fs.createReadStream(filePath);
  stream.on("error", () => res.end());
  return stream.pipe(res);
}

async function uploadBufferToCatbox(buffer: Buffer, filename: string, mimeType: string, timeoutMs = 25000): Promise<string | null> {
  try {
    const fd = new FormData();
    fd.append("reqtype", "fileupload");
    fd.append("fileToUpload", new Blob([new Uint8Array(buffer)], { type: mimeType }), filename);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const catboxRes = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        headers: {
          "User-Agent": BROWSER_USER_AGENT,
        },
        body: fd,
        signal: controller.signal,
      });
      const text = (await catboxRes.text()).trim();
      if (catboxRes.ok && text.startsWith("http")) {
        return text;
      }
      console.warn("[UploadRoute] Catbox non-URL response:", catboxRes.status, text);
    } finally {
      clearTimeout(timer);
    }
  } catch (err: any) {
    console.warn("[UploadRoute] Catbox upload error:", err?.message || err);
  }
  return null;
}

async function uploadBufferToLitterbox(buffer: Buffer, filename: string, mimeType: string, timeoutMs = 20000): Promise<string | null> {
  try {
    const fd = new FormData();
    fd.append("reqtype", "fileupload");
    fd.append("time", "72h");
    fd.append("fileToUpload", new Blob([new Uint8Array(buffer)], { type: mimeType }), filename);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch("https://litterbox.catbox.moe/resources/internals/api.php", {
        method: "POST",
        headers: {
          "User-Agent": BROWSER_USER_AGENT,
        },
        body: fd,
        signal: controller.signal,
      });
      const text = (await res.text()).trim();
      if (res.ok && text.startsWith("http")) {
        return text;
      }
    } finally {
      clearTimeout(timer);
    }
  } catch (err: any) {
    console.warn("[UploadRoute] Litterbox fallback error:", err?.message || err);
  }
  return null;
}

export function registerUploadRoutes(app: Express) {
  // 1. Upload image to ImgBB (with Free Catbox CDN fallback)
  app.post("/api/upload/image", async (req: Request, res: Response) => {
    try {
      const { base64, filename = "image.png", apiKey } = req.body || {};
      if (!base64) {
        return res.status(400).json({ error: "No image payload provided" });
      }

      const cleanBase64 = stripDataUrlPrefix(base64);
      const DEFAULT_IMGBB_API_KEY = "83205d3de1723e4976090aad947fc26d";
      const imgbbKey = apiKey || process.env.IMGBB_API_KEY || process.env.VITE_IMGBB_API_KEY || DEFAULT_IMGBB_API_KEY;

      // 1. Try ImgBB if key is available
      if (imgbbKey) {
        try {
          const fd = new FormData();
          fd.append("key", imgbbKey);
          fd.append("image", cleanBase64);
          fd.append("name", filename.replace(/\.[^/.]+$/, ""));

          const imgbbRes = await fetch("https://api.imgbb.com/1/upload", {
            method: "POST",
            body: fd,
          });

          const data: any = await imgbbRes.json();
          if (data?.data?.url || data?.data?.display_url) {
            return res.json({
              success: true,
              url: data.data.display_url || data.data.url,
              thumb: data.data.thumb?.url || data.data.url,
              provider: "imgbb",
            });
          }
          console.warn("[ImgBB upload notice, falling back]:", data?.error?.message || data);
        } catch (imgbbErr) {
          console.warn("[ImgBB upload error, falling back]:", imgbbErr);
        }
      }

      // 2. Free Permanent Fallback (Catbox.moe CDN - 100% free forever)
      const buffer = Buffer.from(cleanBase64, "base64");
      const catboxUrl = await uploadBufferToCatbox(buffer, filename, "image/png");
      if (catboxUrl) {
        return res.json({
          success: true,
          url: catboxUrl,
          provider: "catbox",
        });
      }

      throw new Error("Image upload failed across all providers");
    } catch (err: any) {
      console.error("[Upload Image Error]:", err);
      return res.status(500).json({ error: err.message || "Failed to upload image" });
    }
  });

  // 2. Upload video to Free CDN (Catbox, up to 200MB, permanent streaming MP4) with local/proxy fallback
  const rawVideoMiddleware = express.raw({
    type: ["video/*", "application/octet-stream"],
    limit: "200mb",
  });

  app.post("/api/upload/video", rawVideoMiddleware, async (req: Request, res: Response) => {
    try {
      let buffer: Buffer | null = null;
      let filename = "video.mp4";
      let source = "journal";

      if (Buffer.isBuffer(req.body) && req.body.length > 0) {
        buffer = req.body;
        const headerName = req.headers["x-file-name"];
        if (typeof headerName === "string" && headerName.trim()) {
          try {
            filename = decodeURIComponent(headerName.trim());
          } catch {
            filename = headerName.trim();
          }
        }
        const headerSource = req.headers["x-upload-source"];
        if (typeof headerSource === "string" && headerSource.trim()) {
          source = headerSource.trim();
        }
      } else if (req.body && typeof req.body === "object" && typeof req.body.base64 === "string") {
        const { base64, filename: bodyFilename = "video.mp4", source: bodySource = "journal" } = req.body;
        if (!base64.trim()) {
          return res.status(400).json({ error: "No video payload provided" });
        }
        filename = bodyFilename || "video.mp4";
        source = bodySource || "journal";
        const cleanBase64 = stripDataUrlPrefix(base64);
        buffer = Buffer.from(cleanBase64, "base64");
      }

      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ error: "No video payload provided" });
      }

      if (buffer.length > 200 * 1024 * 1024) {
        return res.status(400).json({ error: "Video exceeds maximum 200MB size limit." });
      }

      // 1. Authenticate user
      const { sdk } = await import("../../_core/sdk");
      let user = null;
      try {
        user = await sdk.authenticateRequest(req);
      } catch (authErr) {
        console.warn("[Upload Video] Auth check notice:", authErr);
      }
      if (!user) {
        return res.status(401).json({ error: "Please sign in to upload and save videos." });
      }

      // 2. Check account status & Pro quota (Step 1: allow authenticated active users to upload/save videos)
      const { getUserSubscription, canSaveVideo, recordSavedVideo } = await import("../../subscription");
      const videoSource: "journal" | "notebook" = source === "notebook" ? "notebook" : "journal";
      try {
        const sub = await getUserSubscription(user.id);
        if (sub.accountStatus !== "active") {
          return res.status(403).json({
            error: "Your account is currently inactive. Please contact support.",
          });
        }
        if (sub.plan === "pro") {
          const check = await canSaveVideo(user.id, videoSource);
          if (!check.allowed) {
            return res.status(403).json({
              error: check.reason || "Video quota reached on your Pro plan.",
            });
          }
        }
      } catch (quotaErr) {
        console.warn("[Upload Video] Subscription check fallback:", quotaErr);
      }

      const safeFilename = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_") || "video.mp4";
      const hasExt = /\.[a-zA-Z0-9]{2,5}$/.test(safeFilename);
      const normalizedFilename = hasExt ? safeFilename : `${safeFilename}.mp4`;
      const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${normalizedFilename}`;
      const mimeType = getVideoMimeType(normalizedFilename);

      // Save local/temp cache copy first so playback always works
      saveVideoToCache(uniqueName, buffer);

      // 3. Try primary CDN (Catbox)
      const catboxUrl = await uploadBufferToCatbox(buffer, normalizedFilename, mimeType);
      if (catboxUrl) {
        try {
          const catboxBasename = path.basename(new URL(catboxUrl).pathname);
          if (catboxBasename) {
            saveVideoToCache(catboxBasename, buffer);
          }
        } catch {}

        try {
          await recordSavedVideo(user.id, catboxUrl, videoSource);
        } catch (recErr) {
          console.warn("[Upload Video] recordSavedVideo warning:", recErr);
        }

        return res.json({
          success: true,
          url: catboxUrl,
          streamUrl: `/api/upload/stream?url=${encodeURIComponent(catboxUrl)}`,
          provider: "catbox",
        });
      }

      // 4. Try secondary CDN (Litterbox)
      const litterboxUrl = await uploadBufferToLitterbox(buffer, normalizedFilename, mimeType);
      if (litterboxUrl) {
        try {
          const lbBasename = path.basename(new URL(litterboxUrl).pathname);
          if (lbBasename) {
            saveVideoToCache(lbBasename, buffer);
          }
        } catch {}

        try {
          await recordSavedVideo(user.id, litterboxUrl, videoSource);
        } catch (recErr) {
          console.warn("[Upload Video] recordSavedVideo warning:", recErr);
        }

        return res.json({
          success: true,
          url: litterboxUrl,
          streamUrl: `/api/upload/stream?url=${encodeURIComponent(litterboxUrl)}`,
          provider: "litterbox",
        });
      }

      // 5. Fallback to direct server media endpoint if external CDNs are unreachable
      const localUrl = `/api/upload/media/${encodeURIComponent(uniqueName)}`;
      try {
        await recordSavedVideo(user.id, localUrl, videoSource);
      } catch (recErr) {
        console.warn("[Upload Video] recordSavedVideo warning:", recErr);
      }

      return res.json({
        success: true,
        url: localUrl,
        streamUrl: localUrl,
        provider: "local",
      });
    } catch (err: any) {
      console.error("[Upload Video Error]:", err);
      return res.status(500).json({ error: err.message || "Failed to upload video" });
    }
  });

  // 2b. Delete saved video record -> Restores quota availability immediately
  app.post("/api/upload/video/delete", async (req: Request, res: Response) => {
    try {
      const { videoUrl } = req.body || {};
      if (!videoUrl) {
        return res.status(400).json({ error: "No videoUrl provided" });
      }

      const { sdk } = await import("../../_core/sdk");
      let user = null;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {}
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { removeSavedVideo } = await import("../../subscription");
      await removeSavedVideo(user.id, videoUrl);
      return res.json({ success: true, restored: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to remove video" });
    }
  });

  // 2c. Serve locally cached video files with HTTP Range support
  app.get("/api/upload/media/:filename", (req: Request, res: Response) => {
    try {
      const rawName = req.params.filename || "";
      const cachedPath = findCachedVideoPath(rawName);
      if (!cachedPath) {
        return res.status(404).json({ error: "Media file not found" });
      }
      return streamVideoFileWithRange(req, res, cachedPath, rawName);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to stream media" });
    }
  });

  // 2d. Stream proxy for external CDN videos (bypasses ISP DNS blocks on files.catbox.moe in user browsers)
  app.get("/api/upload/stream", async (req: Request, res: Response) => {
    try {
      const targetUrl = typeof req.query.url === "string" ? req.query.url.trim() : "";
      if (!targetUrl) {
        return res.status(400).json({ error: "Missing url query parameter" });
      }

      if (targetUrl.startsWith("/api/upload/media/")) {
        const filePart = decodeURIComponent(targetUrl.replace("/api/upload/media/", "").split("?")[0]);
        const cached = findCachedVideoPath(filePart);
        if (cached) {
          return streamVideoFileWithRange(req, res, cached, filePart);
        }
        return res.status(404).json({ error: "Media file not found" });
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(targetUrl);
      } catch {
        return res.status(400).json({ error: "Invalid url parameter" });
      }

      const allowedHosts = ["files.catbox.moe", "litter.catbox.moe", "catbox.moe"];
      const isAllowed = allowedHosts.some(
        (h) => parsedUrl.hostname === h || parsedUrl.hostname.endsWith(`.${h}`)
      );
      if (!isAllowed) {
        return res.redirect(targetUrl);
      }

      // Serve from local disk cache immediately if available
      const basename = path.basename(parsedUrl.pathname);
      const cachedPath = findCachedVideoPath(basename);
      if (cachedPath) {
        return streamVideoFileWithRange(req, res, cachedPath, basename);
      }

      // Otherwise fetch from remote CDN using server's public DNS resolver and cache it
      const upstreamRes = await fetch(targetUrl, {
        headers: {
          "User-Agent": BROWSER_USER_AGENT,
        },
      });
      if (!upstreamRes.ok) {
        return res.status(upstreamRes.status).json({ error: "Upstream media unavailable" });
      }

      const arrayBuf = await upstreamRes.arrayBuffer();
      const buf = Buffer.from(arrayBuf);
      if (basename && buf.length > 0) {
        saveVideoToCache(basename, buf);
        const newlyCached = findCachedVideoPath(basename);
        if (newlyCached) {
          return streamVideoFileWithRange(req, res, newlyCached, basename);
        }
      }

      res.setHeader("Content-Type", getVideoMimeType(basename));
      res.setHeader("Content-Length", String(buf.length));
      res.setHeader("Accept-Ranges", "bytes");
      return res.status(200).send(buf);
    } catch (err: any) {
      console.error("[Upload Stream Error]:", err);
      return res.status(500).json({ error: err.message || "Failed to stream video" });
    }
  });

  // 3. Upload document/PDF to Free Object Storage (Supabase Storage 'ebooks' or Free Catbox CDN fallback)
  app.post("/api/upload/file", async (req: Request, res: Response) => {
    try {
      const { base64, filename = "document.pdf", contentType = "application/pdf" } = req.body || {};
      if (!base64) {
        return res.status(400).json({ error: "No file payload provided" });
      }

      const cleanBase64 = stripDataUrlPrefix(base64);
      const buffer = Buffer.from(cleanBase64, "base64");
      const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const uniqueName = `${Date.now()}_${safeFilename}`;

      // 1. Try Supabase Storage 'ebooks' bucket first (100% free cloud object storage)
      try {
        const { supabaseServer } = await import("../db/supabase");
        const { data: supaData, error: supaErr } = await supabaseServer.storage
          .from("ebooks")
          .upload(uniqueName, buffer, {
            contentType,
            upsert: true,
          });

        if (!supaErr && supaData?.path) {
          const { data: pubData } = supabaseServer.storage
            .from("ebooks")
            .getPublicUrl(uniqueName);
          if (pubData?.publicUrl) {
            return res.json({
              success: true,
              url: pubData.publicUrl,
              provider: "supabase",
            });
          }
        }
      } catch (supaEx) {
        console.warn("[Supabase Storage upload notice, falling back to Free Cloud CDN]:", supaEx);
      }

      // 2. Free Cloud CDN Fallback (Catbox, up to 200MB, permanent direct download link)
      const catboxUrl = await uploadBufferToCatbox(buffer, safeFilename, contentType);
      if (catboxUrl) {
        return res.json({
          success: true,
          url: catboxUrl,
          provider: "catbox",
        });
      }

      throw new Error("File upload failed across all providers");
    } catch (err: any) {
      console.error("[Upload File Error]:", err);
      return res.status(500).json({ error: err.message || "Failed to upload file" });
    }
  });
}

