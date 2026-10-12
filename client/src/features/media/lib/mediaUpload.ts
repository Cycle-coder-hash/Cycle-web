/**
 * Media Upload & Embed Utilities
 *
 * Direct cloud image hosting via ImgBB with Free CDN fallback.
 * Video hosting via Free Catbox CDN (up to 200MB, unlimited permanent)
 * plus full Loom, YouTube, and Vimeo link embedding.
 *
 * Ensures Supabase database and storage remain 100% free of heavy base64 data.
 */

// Helper to convert File / Blob to clean base64 data URL
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Retrieve authorization headers from stored user session token and cached user profile
 */
export function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const headers: Record<string, string> = {};
  try {
    let token = localStorage.getItem("cycle_session_token");
    if (!token) {
      const hash = window.location.hash;
      if (hash.includes("access_token=")) {
        const params = new URLSearchParams(hash.replace(/^#/, ""));
        token = params.get("access_token");
        if (token) {
          try {
            localStorage.setItem("cycle_session_token", token);
          } catch {}
        }
      }
    }
    if (!token) {
      const supaSession =
        localStorage.getItem("cycle_supabase_session") ||
        localStorage.getItem("sb-pxrcaqmjmsvldhiyuacx-auth-token");
      if (supaSession) {
        try {
          const parsed = JSON.parse(supaSession);
          token = parsed.access_token || parsed?.currentSession?.access_token;
        } catch {}
      }
    }
    if (!token) {
      const raw = sessionStorage.getItem("manus-cookie");
      if (raw) {
        const prefix = "cycle_of_chart_session=";
        const pair = raw.split(";").find((s) => s.trim().startsWith(prefix));
        const cToken = pair?.trim().slice(prefix.length) || raw;
        if (cToken) {
          token = cToken;
        }
      }
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const cachedUser = localStorage.getItem("manus-runtime-user-info");
    if (cachedUser) {
      try {
        const bytes = new TextEncoder().encode(cachedUser);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        headers["x-cycle-user"] = btoa(binary);
      } catch {}
    }
  } catch {}
  return headers;
}

/**
 * Upload an image to ImgBB (or Free CDN fallback).
 * Returns permanent direct image URL (e.g. https://i.ibb.co/... or https://files.catbox.moe/...).
 */
export async function uploadImage(fileOrBase64: File | Blob | string, customFilename?: string): Promise<string> {
  try {
    let base64String = "";
    let filename = customFilename || "image.png";

    if (typeof fileOrBase64 === "string") {
      base64String = fileOrBase64;
    } else {
      if ("name" in fileOrBase64 && fileOrBase64.name) {
        filename = fileOrBase64.name;
      }
      base64String = await fileToBase64(fileOrBase64);
    }

    const DEFAULT_IMGBB_API_KEY = "83205d3de1723e4976090aad947fc26d";
    const apiKey =
      (typeof window !== "undefined" && localStorage.getItem("cycle_imgbb_api_key")) ||
      import.meta.env.VITE_IMGBB_API_KEY ||
      DEFAULT_IMGBB_API_KEY;

    // 1. If ImgBB API key is available, try direct client-side upload to ImgBB
    if (apiKey) {
      try {
        const cleanBase64 = base64String.includes(";base64,")
          ? base64String.split(";base64,").pop()!
          : base64String.replace(/^data:[^,]+,/, "");
        const fd = new FormData();
        fd.append("key", apiKey);
        fd.append("image", cleanBase64);
        fd.append("name", filename.replace(/\.[^/.]+$/, ""));

        const res = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: fd,
        });

        const data = await res.json();
        if (data?.success && (data?.data?.display_url || data?.data?.url)) {
          return data.data.display_url || data.data.url;
        }
      } catch (clientErr) {
        console.warn("[Client ImgBB upload failed, trying server proxy]:", clientErr);
      }
    }

    // 2. Server proxy upload (proxies to ImgBB or free permanent Catbox CDN)
    const serverRes = await fetch("/api/upload/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({
        base64: base64String,
        filename,
        apiKey: apiKey || undefined,
      }),
    });

    if (!serverRes.ok) {
      const errJson = await serverRes.json().catch(() => ({}));
      throw new Error(errJson.error || `Upload failed with status ${serverRes.status}`);
    }

    const result = await serverRes.json();
    if (result.url) {
      return result.url;
    }

    throw new Error("No URL returned from upload server");
  } catch (err: any) {
    console.error("[MediaUpload] Image upload error:", err);
    throw err;
  }
}

/**
 * Upload a video to Free CDN (Catbox, up to 200MB, permanent streaming MP4).
 * Sends raw binary first to avoid 33% Base64 payload inflation, with JSON fallback.
 */
export async function uploadVideo(
  fileOrBase64: File | Blob | string,
  customFilename?: string,
  source: "journal" | "notebook" = "journal"
): Promise<string> {
  try {
    let filename = customFilename || "video.mp4";
    const authHeaders = getAuthHeaders();

    if (typeof fileOrBase64 !== "string") {
      if ("name" in fileOrBase64 && fileOrBase64.name) {
        filename = fileOrBase64.name;
      }
      const rawMime =
        fileOrBase64.type && fileOrBase64.type.startsWith("video/")
          ? fileOrBase64.type.split(";")[0]
          : "application/octet-stream";

      const binaryRes = await fetch("/api/upload/video", {
        method: "POST",
        headers: {
          "Content-Type": rawMime,
          "x-file-name": encodeURIComponent(filename),
          "x-upload-source": source,
          ...authHeaders,
        },
        credentials: "include",
        body: fileOrBase64,
      });

      if (binaryRes.ok) {
        const result = await binaryRes.json();
        if (result.url) {
          return result.url;
        }
      } else if (binaryRes.status === 401 || binaryRes.status === 403) {
        const errJson = await binaryRes.json().catch(() => ({}));
        throw new Error(errJson.error || `Video upload failed with status ${binaryRes.status}`);
      }
    }

    // Fallback or string input: send JSON base64 payload
    const base64String =
      typeof fileOrBase64 === "string" ? fileOrBase64 : await fileToBase64(fileOrBase64);

    const serverRes = await fetch("/api/upload/video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      credentials: "include",
      body: JSON.stringify({
        base64: base64String,
        filename,
        source,
      }),
    });

    if (!serverRes.ok) {
      const errJson = await serverRes.json().catch(() => ({}));
      throw new Error(errJson.error || `Video upload failed with status ${serverRes.status}`);
    }

    const result = await serverRes.json();
    if (result.url) {
      return result.url;
    }

    throw new Error("No URL returned from video upload server");
  } catch (err: any) {
    console.error("[MediaUpload] Video upload error:", err);
    throw err;
  }
}

/**
 * Delete a saved video record and restore quota immediately
 */
export async function deleteSavedVideo(videoUrl: string): Promise<boolean> {
  try {
    const res = await fetch("/api/upload/video/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({ videoUrl }),
    });
    return res.ok;
  } catch (err) {
    console.error("[MediaUpload] Video delete error:", err);
    return false;
  }
}

/**
 * Upload a document (PDF / generic file) to Free Cloud CDN (Catbox).
 * Returns the permanent direct download URL.
 */
export async function uploadFile(fileOrBase64: File | Blob | string, customFilename?: string): Promise<string> {
  try {
    let base64String: string;
    let filename = customFilename || "document.pdf";
    let contentType = "application/pdf";

    if (typeof fileOrBase64 === "string") {
      base64String = fileOrBase64;
    } else {
      if ("name" in fileOrBase64 && fileOrBase64.name) {
        filename = fileOrBase64.name;
      }
      if ("type" in fileOrBase64 && fileOrBase64.type) {
        contentType = fileOrBase64.type;
      }
      base64String = await fileToBase64(fileOrBase64);
    }

    const serverRes = await fetch("/api/upload/file", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({
        base64: base64String,
        filename,
        contentType,
      }),
    });

    if (!serverRes.ok) {
      const errJson = await serverRes.json().catch(() => ({}));
      throw new Error(errJson.error || `File upload failed with status ${serverRes.status}`);
    }

    const result = await serverRes.json();
    if (result.url) {
      return result.url;
    }

    throw new Error("No URL returned from file upload server");
  } catch (err: any) {
    console.error("[MediaUpload] File upload error:", err);
    throw err;
  }
}

export type VideoEmbedInfo = {
  type: "direct" | "youtube" | "loom" | "vimeo";
  isIframe: boolean;
  embedUrl: string;
  rawUrl: string;
};

/**
 * Parse any video URL (direct MP4/WebM, Loom, YouTube, or Vimeo)
 * and return embeddable URL + type.
 */
export function parseVideoUrl(rawUrl: string): VideoEmbedInfo {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { type: "direct", isIframe: false, embedUrl: "", rawUrl: "" };
  }

  const url = rawUrl.trim();

  // 1. Loom: e.g. https://www.loom.com/share/abc12345
  if (url.includes("loom.com/share/")) {
    const videoId = url.split("loom.com/share/")[1]?.split(/[?#]/)[0];
    if (videoId) {
      return {
        type: "loom",
        isIframe: true,
        embedUrl: `https://www.loom.com/embed/${videoId}`,
        rawUrl: url,
      };
    }
  }

  // 2. YouTube: e.g. https://youtu.be/abc12345 or https://www.youtube.com/watch?v=abc12345
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
    if (videoId) {
      return {
        type: "youtube",
        isIframe: true,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        rawUrl: url,
      };
    }
  }
  if (url.includes("youtube.com/watch")) {
    try {
      const parsed = new URL(url);
      const v = parsed.searchParams.get("v");
      if (v) {
        return {
          type: "youtube",
          isIframe: true,
          embedUrl: `https://www.youtube-nocookie.com/embed/${v}`,
          rawUrl: url,
        };
      }
    } catch {}
  }

  // 3. Vimeo: e.g. https://vimeo.com/123456789
  if (url.includes("vimeo.com/")) {
    const videoId = url.split("vimeo.com/")[1]?.split(/[?#]/)[0];
    if (videoId && !isNaN(Number(videoId))) {
      return {
        type: "vimeo",
        isIframe: true,
        embedUrl: `https://player.vimeo.com/video/${videoId}`,
        rawUrl: url,
      };
    }
  }

  // 4. Default: Direct streaming video (MP4, WebM, Catbox, etc.)
  const isCatboxCdn = url.includes("catbox.moe/");
  return {
    type: "direct",
    isIframe: false,
    embedUrl: isCatboxCdn ? `/api/upload/stream?url=${encodeURIComponent(url)}` : url,
    rawUrl: url,
  };
}

