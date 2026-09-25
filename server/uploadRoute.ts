import type { Express, Request, Response } from "express";

export function registerUploadRoutes(app: Express) {
  // 1. Upload image to ImgBB (with Free Catbox CDN fallback)
  app.post("/api/upload/image", async (req: Request, res: Response) => {
    try {
      const { base64, filename = "image.png", apiKey } = req.body;
      if (!base64) {
        return res.status(400).json({ error: "No image payload provided" });
      }

      // Strip data URL header if present
      const cleanBase64 = base64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
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
      const fd = new FormData();
      fd.append("reqtype", "fileupload");
      fd.append("fileToUpload", new Blob([buffer], { type: "image/png" }), filename);

      const catboxRes = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: fd,
      });

      const catboxUrl = (await catboxRes.text()).trim();
      if (catboxUrl.startsWith("http")) {
        return res.json({
          success: true,
          url: catboxUrl,
          provider: "catbox",
        });
      }

      throw new Error(`Image upload failed: ${catboxUrl}`);
    } catch (err: any) {
      console.error("[Upload Image Error]:", err);
      return res.status(500).json({ error: err.message || "Failed to upload image" });
    }
  });

  // 2. Upload video to Free CDN (Catbox, up to 200MB, permanent streaming MP4) with Server-Side Subscription Quota Enforcement
  app.post("/api/upload/video", async (req: Request, res: Response) => {
    try {
      const { base64, filename = "video.mp4", source = "journal" } = req.body;
      if (!base64) {
        return res.status(400).json({ error: "No video payload provided" });
      }

      // 1. Authenticate user to enforce subscription quota
      const { sdk } = await import("./_core/sdk");
      const user = await sdk.authenticateRequest(req);
      if (!user) {
        return res.status(401).json({ error: "Please sign in to upload and save videos." });
      }

      // 2. Server-side quota check
      const { canSaveVideo, recordSavedVideo } = await import("./subscription");
      const videoSource = source === "notebook" ? "notebook" : "journal";
      const check = await canSaveVideo(user.id, videoSource);
      if (!check.allowed) {
        return res.status(403).json({ error: check.reason || "Video saving is restricted on your plan." });
      }

      const cleanBase64 = base64.replace(/^data:video\/[a-zA-Z0-9+.-]+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");

      const fd = new FormData();
      fd.append("reqtype", "fileupload");
      fd.append("fileToUpload", new Blob([buffer], { type: "video/mp4" }), filename);

      const catboxRes = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: fd,
      });

      const catboxUrl = (await catboxRes.text()).trim();
      if (catboxUrl.startsWith("http")) {
        // Record saved video only upon success so failed uploads do NOT consume quota
        await recordSavedVideo(user.id, catboxUrl, videoSource);
        return res.json({
          success: true,
          url: catboxUrl,
          provider: "catbox",
        });
      }

      throw new Error(`Video upload failed: ${catboxUrl}`);
    } catch (err: any) {
      console.error("[Upload Video Error]:", err);
      return res.status(500).json({ error: err.message || "Failed to upload video" });
    }
  });

  // 2b. Delete saved video record -> Restores quota availability immediately
  app.post("/api/upload/video/delete", async (req: Request, res: Response) => {
    try {
      const { videoUrl } = req.body;
      if (!videoUrl) {
        return res.status(400).json({ error: "No videoUrl provided" });
      }

      const { sdk } = await import("./_core/sdk");
      const user = await sdk.authenticateRequest(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { removeSavedVideo } = await import("./subscription");
      await removeSavedVideo(user.id, videoUrl);
      return res.json({ success: true, restored: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to remove video" });
    }
  });

  // 3. Upload document/PDF to Free Object Storage (Supabase Storage 'ebooks' or Free Catbox CDN fallback)
  app.post("/api/upload/file", async (req: Request, res: Response) => {
    try {
      const { base64, filename = "document.pdf", contentType = "application/pdf" } = req.body;
      if (!base64) {
        return res.status(400).json({ error: "No file payload provided" });
      }

      const cleanBase64 = base64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");
      const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const uniqueName = `${Date.now()}_${safeFilename}`;

      // 1. Try Supabase Storage 'ebooks' bucket first (100% free cloud object storage)
      try {
        const { supabaseServer } = await import("./supabase");
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
      const fd = new FormData();
      fd.append("reqtype", "fileupload");
      fd.append("fileToUpload", new Blob([buffer], { type: contentType }), safeFilename);

      const catboxRes = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CycleOfChart/1.0",
        },
        body: fd,
      });

      const catboxUrl = (await catboxRes.text()).trim();
      if (catboxUrl.startsWith("http")) {
        return res.json({
          success: true,
          url: catboxUrl,
          provider: "catbox",
        });
      }

      throw new Error(`File upload failed: ${catboxUrl}`);
    } catch (err: any) {
      console.error("[Upload File Error]:", err);
      return res.status(500).json({ error: err.message || "Failed to upload file" });
    }
  });
}
