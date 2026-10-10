import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  Image,
  Video,
  Eye,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CustomProperty } from "@/types/journal";
import { uploadImage, uploadVideo, parseVideoUrl } from "@/lib/mediaUpload";

export interface TradeMediaAndPropertiesSectionProps {
  screenshots: string[];
  setScreenshots: React.Dispatch<React.SetStateAction<string[]>>;
  videoUrl: string | undefined;
  setVideoUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
  videoDurationSeconds: number | undefined;
  setVideoDurationSeconds: React.Dispatch<React.SetStateAction<number | undefined>>;
  videoError: string | null;
  setVideoError: React.Dispatch<React.SetStateAction<string | null>>;
  customProperties: CustomProperty[];
  setCustomProperties: React.Dispatch<React.SetStateAction<CustomProperty[]>>;
  isBn?: boolean;
}

export function TradeMediaAndPropertiesSection({
  screenshots,
  setScreenshots,
  videoUrl,
  setVideoUrl,
  videoDurationSeconds,
  setVideoDurationSeconds,
  videoError,
  setVideoError,
  customProperties,
  setCustomProperties,
  isBn = false,
}: TradeMediaAndPropertiesSectionProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState("");

  // Multiple screenshot images cloud upload handler (ImgBB / Free CDN)
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validImageFiles = fileList.filter((f) => f.type.startsWith("image/"));

    if (validImageFiles.length === 0) {
      alert("Please select valid image files (PNG, JPG, WEBP, etc.).");
      return;
    }

    setIsUploadingImages(true);
    const toastId = toast.loading(isBn ? "ক্লাউডে ছবি আপলোড হচ্ছে..." : "Uploading screenshots to cloud CDN...");
    try {
      const uploadPromises = validImageFiles.map((file) => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      setScreenshots((prev) => [...prev, ...uploadedUrls]);
      toast.success(isBn ? "স্ক্রিনশট সফলভাবে ক্লাউডে সেভ হয়েছে!" : "Screenshots uploaded to cloud CDN!", { id: toastId });
    } catch (err: any) {
      console.error("[Screenshot upload error]:", err);
      toast.error(isBn ? "স্ক্রিনশট আপলোড করতে সমস্যা হয়েছে।" : "Failed to upload screenshots.", { id: toastId });
    } finally {
      setIsUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  // Video duration validation and Free Cloud CDN upload handler (MAX 1 MINUTE STRICTLY ENFORCED)
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please upload a valid video file (MP4, WEBM, MOV).");
      return;
    }

    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = async () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      if (duration > 60) {
        setVideoError(
          `Video rejected: Duration is ${Math.round(duration)} seconds. Maximum allowed video length is 1 minute (60 seconds).`
        );
        setVideoUrl(undefined);
        setVideoDurationSeconds(undefined);
        return;
      }

      setIsUploadingVideo(true);
      const toastId = toast.loading(isBn ? "ফ্রি ক্লাউডে ভিডিও আপলোড হচ্ছে..." : "Uploading video to free cloud CDN...");
      try {
        const cloudUrl = await uploadVideo(file);
        setVideoUrl(cloudUrl);
        setVideoDurationSeconds(Math.round(duration));
        toast.success(isBn ? "ভিডিও সফলভাবে ক্লাউডে সেভ হয়েছে!" : "Video uploaded to cloud CDN!", { id: toastId });
      } catch (err: any) {
        console.error("[Video upload error]:", err);
        setVideoError(err.message || "Failed to upload video");
        toast.error(isBn ? "ভিডিও আপলোড ব্যর্থ হয়েছে।" : "Failed to upload video.", { id: toastId });
      } finally {
        setIsUploadingVideo(false);
      }
    };
    video.src = URL.createObjectURL(file);
    e.target.value = "";
  };

  const handleAddVideoUrl = () => {
    const trimmed = videoUrlInput.trim();
    if (!trimmed) return;
    setVideoError(null);
    const parsed = parseVideoUrl(trimmed);
    if (!parsed.embedUrl) {
      setVideoError("Invalid video URL. Please enter a valid Loom, YouTube, Vimeo, or MP4 link.");
      return;
    }
    setVideoUrl(trimmed);
    setVideoDurationSeconds(undefined);
    setVideoUrlInput("");
    toast.success(isBn ? "ভিডিও লিঙ্ক যুক্ত করা হয়েছে!" : "Video link attached successfully!");
  };

  const handleRemoveVideo = () => {
    setVideoUrl(undefined);
    setVideoDurationSeconds(undefined);
    setVideoError(null);
  };

  const handleAddProperty = () => {
    setCustomProperties((prev) => [
      ...prev,
      { id: `prop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: "", value: "" },
    ]);
  };

  const handleUpdateProperty = (id: string, field: "name" | "value", val: string) => {
    setCustomProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const handleRemoveProperty = (id: string) => {
    setCustomProperties((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <>
      {/* SECTION 6: MULTIPLE SCREENSHOTS & VIDEO (STRICT MAX 1 MINUTE VIDEO VALIDATION) */}
      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3 dark:border-slate-800">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Image size={15} className="text-cyan-500" />
              <span>Field 19: Trade Screenshots & Media</span>
              <span className="ml-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-black text-cyan-500">
                {screenshots.length} {screenshots.length === 1 ? "Screenshot" : "Screenshots"}
              </span>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Attach multiple chart screenshots (HTF narrative, 1H POI, 5m/1m entry, runner, exit). No screenshot limit.
            </p>
          </div>

          <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 self-start sm:self-center">
            * Video Limit: Max 1 Minute (60s)
          </span>
        </div>

        {videoError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} />
            <span>{videoError}</span>
          </div>
        )}

        {/* SCREENSHOTS GALLERY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <span>Attached Screenshots</span>
              <span className="text-[10px] text-slate-400">({screenshots.length} saved with this trade)</span>
            </span>

            <label className={`inline-flex items-center gap-1.5 rounded-xl border border-dashed border-cyan-500/50 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 cursor-pointer transition-all shadow-xs ${isUploadingImages ? "opacity-50 pointer-events-none" : ""}`}>
              {isUploadingImages ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              <span>{isUploadingImages ? "Uploading..." : screenshots.length > 0 ? "Add More Screenshots" : "Upload Screenshots"}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                disabled={isUploadingImages}
                onChange={handleMultipleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {screenshots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {screenshots.map((src, index) => (
                <div
                  key={index}
                  className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-sm"
                >
                  <img
                    src={src}
                    alt={`Screenshot ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  {/* Screenshot Number Tag */}
                  <div className="absolute top-1.5 left-1.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-black text-cyan-400 backdrop-blur-xs border border-white/10">
                    #{index + 1}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(src)}
                      className="rounded-lg bg-white/20 p-1.5 text-white hover:bg-white/30 backdrop-blur-xs transition"
                      title="View Full Resolution"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveScreenshot(index)}
                      className="rounded-lg bg-rose-600 p-1.5 text-white hover:bg-rose-700 transition shadow-md"
                      title="Delete this screenshot"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add more tile */}
              <label className={`flex flex-col items-center justify-center aspect-video rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 hover:border-cyan-500 hover:bg-cyan-500/5 cursor-pointer transition text-center p-2 ${isUploadingImages ? "opacity-50 pointer-events-none" : ""}`}>
                {isUploadingImages ? <Loader2 size={18} className="animate-spin text-cyan-500 mb-1" /> : <Plus size={18} className="text-cyan-500 mb-1" />}
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{isUploadingImages ? "Uploading..." : "Add Image"}</span>
                <span className="text-[9px] text-slate-400">Multiple allowed</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={isUploadingImages}
                  onChange={handleMultipleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center cursor-pointer py-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/50 hover:border-cyan-500 hover:bg-cyan-500/5 transition ${isUploadingImages ? "opacity-50 pointer-events-none" : ""}`}>
              {isUploadingImages ? <Loader2 size={24} className="animate-spin text-cyan-500 mb-2" /> : <Upload size={24} className="text-cyan-500 mb-2" />}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {isUploadingImages ? "Uploading screenshots to cloud CDN..." : "Click to select multiple screenshots (or drag & drop files)"}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Images stored via ImgBB / Free CDN • Supports PNG, JPG, WEBP • Unlimited
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                disabled={isUploadingImages}
                onChange={handleMultipleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* VIDEO ATTACHMENT SECTION (MAX 60 SECONDS OR LOOM / YOUTUBE LINK) */}
        <div className="border-t border-slate-200/60 pt-3 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Video size={13} className="text-purple-400" />
              <span>Execution Video Clip (Optional • Free Cloud or Loom/YouTube Link)</span>
            </span>
            {videoDurationSeconds && (
              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400">
                {videoDurationSeconds}s verified
              </span>
            )}
          </div>

          {videoUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black aspect-video max-h-72 flex items-center justify-center">
              {(() => {
                const parsed = parseVideoUrl(videoUrl);
                if (parsed.isIframe && parsed.embedUrl) {
                  return (
                    <iframe
                      src={parsed.embedUrl}
                      title="Trade Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  );
                }
                return (
                  <video
                    src={videoUrl}
                    controls
                    className="max-h-72 w-full object-contain"
                  />
                );
              })()}
              <button
                type="button"
                onClick={handleRemoveVideo}
                className="absolute top-2 right-2 rounded-full bg-rose-600 p-1.5 text-white hover:bg-rose-700 shadow-md transition z-10"
                title="Remove video clip"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Option A: Direct Video Upload to Free CDN */}
              <label className={`flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 hover:border-purple-400 cursor-pointer transition ${isUploadingVideo ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="flex items-center gap-2.5">
                  {isUploadingVideo ? (
                    <Loader2 size={16} className="animate-spin text-purple-400" />
                  ) : (
                    <Video size={16} className="text-purple-400" />
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {isUploadingVideo ? "Uploading video clip to free cloud CDN..." : "Upload Video Clip (MP4, WEBM)"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Free Permanent Cloud Storage • Strict limit: max 60 seconds
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-500 bg-purple-500/10 px-2.5 py-1 rounded-lg">
                  {isUploadingVideo ? "Uploading..." : "Browse Video"}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  disabled={isUploadingVideo}
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>

              {/* Option B: Or paste Loom / YouTube / MP4 Link */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddVideoUrl();
                      }
                    }}
                    placeholder="Or paste Loom, YouTube, Vimeo, or MP4 link..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-hidden transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddVideoUrl}
                  disabled={!videoUrlInput.trim()}
                  className="rounded-xl text-xs font-bold border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                >
                  Attach Link
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 7: CUSTOM PROPERTIES (Field 21: Add Property) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Field 21: Custom Properties
            </label>
            <p className="text-[10px] text-slate-400">
              Add flexible custom fields (e.g. Session: London, Model: CRT Range, News: Clean)
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddProperty}
            className="text-xs font-bold gap-1 rounded-xl h-8"
          >
            <Plus size={14} /> Add Property
          </Button>
        </div>

        {customProperties.length > 0 ? (
          <div className="space-y-2">
            {customProperties.map((prop) => (
              <div key={prop.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Property Name (e.g. Session)"
                  value={prop.name}
                  onChange={(e) => handleUpdateProperty(prop.id, "name", e.target.value)}
                  className="w-1/3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. London Open)"
                  value={prop.value}
                  onChange={(e) => handleUpdateProperty(prop.id, "value", e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveProperty(prop.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-center rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
            No custom properties added. Click "+ Add Property" to create flexible custom fields.
          </div>
        )}
      </div>

      {/* Lightbox Modal for Previewing Screenshot */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              title="Close Preview"
            >
              <X size={20} />
            </button>
            <img
              src={previewImage}
              alt="Screenshot Preview"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </>
  );
}
