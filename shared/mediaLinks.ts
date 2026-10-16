/**
 * shared/mediaLinks.ts
 * Safe URL parsing and embed link formatting for YouTube and Google Drive links.
 */

/**
 * Extracts YouTube video ID from various standard YouTube URL formats.
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const cleanUrl = url.trim();

  // Pattern 1: youtu.be/<id>
  if (cleanUrl.includes("youtu.be/")) {
    const after = cleanUrl.split("youtu.be/")[1];
    const id = after?.split(/[?#&/]/)[0];
    if (id && id.length >= 6) return id;
  }

  // Pattern 2: youtube.com/watch?v=<id>
  if (cleanUrl.includes("/watch")) {
    try {
      const parsed = new URL(cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`);
      const v = parsed.searchParams.get("v");
      if (v && v.length >= 6) return v;
    } catch {
      const match = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
      if (match && match[1]) return match[1];
    }
  }

  // Pattern 3: youtube.com/embed/<id>
  if (cleanUrl.includes("/embed/")) {
    const after = cleanUrl.split("/embed/")[1];
    const id = after?.split(/[?#&/]/)[0];
    if (id && id.length >= 6) return id;
  }

  // Pattern 4: youtube.com/live/<id>
  if (cleanUrl.includes("/live/")) {
    const after = cleanUrl.split("/live/")[1];
    const id = after?.split(/[?#&/]/)[0];
    if (id && id.length >= 6) return id;
  }

  // Pattern 5: youtube.com/shorts/<id>
  if (cleanUrl.includes("/shorts/")) {
    const after = cleanUrl.split("/shorts/")[1];
    const id = after?.split(/[?#&/]/)[0];
    if (id && id.length >= 6) return id;
  }

  // Pattern 6: Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  return null;
}

/**
 * Returns a privacy-enhanced, responsive YouTube embed iframe URL.
 */
export function getYouTubeEmbedUrl(urlOrId: string): string | null {
  const id = extractYouTubeVideoId(urlOrId);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}

/**
 * Returns the default preview thumbnail for a YouTube video.
 */
export function getYouTubeThumbnailUrl(urlOrId: string): string | null {
  const id = extractYouTubeVideoId(urlOrId);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

/**
 * Extracts Google Drive file ID from sharing, viewing, or open links.
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const cleanUrl = url.trim();

  // Pattern 1: /file/d/<id>/...
  const fileDMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // Pattern 2: id=<id>
  const idParamMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  return null;
}

/**
 * Returns Google Drive preview URL (for iframe embedding or in-browser preview).
 */
export function getGoogleDrivePreviewUrl(urlOrId: string): string | null {
  const fileId = extractGoogleDriveFileId(urlOrId) || (urlOrId.length > 20 && !urlOrId.includes("/") ? urlOrId : null);
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Returns Google Drive direct download URL.
 */
export function getGoogleDriveDownloadUrl(urlOrId: string): string | null {
  const fileId = extractGoogleDriveFileId(urlOrId) || (urlOrId.length > 20 && !urlOrId.includes("/") ? urlOrId : null);
  if (!fileId) return null;
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}
