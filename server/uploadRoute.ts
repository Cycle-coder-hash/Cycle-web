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

  // 2. Upload video to Free CDN (Catbox, up to 200MB, permanent streaming MP4)
  app.post("/api/upload/video", async (req: Request, res: Response) => {
    try {
      const { base64, filename = "video.mp4" } = req.body;
      if (!base64) {
        return res.status(400).json({ error: "No video payload provided" });
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

  // 3. Upload document/PDF to Free CDN (Catbox, up to 200MB, permanent direct download link)
  app.post("/api/upload/file", async (req: Request, res: Response) => {
    try {
      const { base64, filename = "document.pdf", contentType = "application/pdf" } = req.body;
      if (!base64) {
        return res.status(400).json({ error: "No file payload provided" });
      }

      const cleanBase64 = base64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");

      const fd = new FormData();
      fd.append("reqtype", "fileupload");
      fd.append("fileToUpload", new Blob([buffer], { type: contentType }), filename);

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

      throw new Error(`File upload failed: ${catboxUrl}`);
    } catch (err: any) {
      console.error("[Upload File Error]:", err);
      return res.status(500).json({ error: err.message || "Failed to upload file" });
    }
  });
}
