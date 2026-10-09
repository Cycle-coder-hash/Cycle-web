import React, { useState, useRef } from "react";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  FileCode,
  Link as LinkIcon,
  Paperclip,
  Maximize2,
  ExternalLink,
  Download,
  AlertCircle,
  Eye,
  Code2,
  CheckSquare,
  Square,
  Quote as QuoteIcon,
  List,
  ListOrdered,
  Heading as HeadingIcon,
  Sparkles,
  Loader2,
} from "lucide-react";
import { ContentBlock, ContentBlockType } from "@/types/notebook";
import { validateVideoDuration } from "@/lib/notebookStorage";
import { uploadImage, uploadVideo, uploadFile, parseVideoUrl, deleteSavedVideo } from "@/lib/mediaUpload";
import { toast } from "sonner";

interface NotebookBlockItemProps {
  block: ContentBlock;
  index: number;
  totalBlocks: number;
  isBn?: boolean;
  onUpdate: (updatedBlock: ContentBlock) => void;
  onDelete: (blockId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onOpenLightbox?: (imgUrl: string) => void;
}

export function NotebookBlockItem({
  block,
  index,
  totalBlocks,
  isBn = false,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onOpenLightbox,
}: NotebookBlockItemProps) {
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isValidatingVideo, setIsValidatingVideo] = useState(false);
  const [htmlPreviewMode, setHtmlPreviewMode] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const genericFileInputRef = useRef<HTMLInputElement | null>(null);

  // Update helper
  const updateContent = (content: string) => {
    onUpdate({
      ...block,
      content,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateMeta = (partialMeta: Partial<NonNullable<ContentBlock["meta"]>>) => {
    onUpdate({
      ...block,
      meta: {
        ...(block.meta || {}),
        ...partialMeta,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoLinkInput, setVideoLinkInput] = useState("");

  // Image upload to cloud CDN (ImgBB / Free CDN)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const toastId = toast.loading(isBn ? "ক্লাউডে ছবি আপলোড হচ্ছে..." : "Uploading image to cloud CDN...");
    try {
      const cdnUrl = await uploadImage(file);
      onUpdate({
        ...block,
        content: cdnUrl,
        meta: {
          ...(block.meta || {}),
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        },
        updatedAt: new Date().toISOString(),
      });
      toast.success(isBn ? "ছবি সফলভাবে ক্লাউডে আপলোড হয়েছে!" : "Image uploaded to cloud CDN!", { id: toastId });
    } catch (err: any) {
      console.error("[Notebook image upload error]:", err);
      toast.error(isBn ? "ছবি আপলোড ব্যর্থ হয়েছে।" : "Failed to upload image.", { id: toastId });
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  // Video upload with strict 10-minute check to free cloud CDN
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoError(null);
    setIsValidatingVideo(true);

    try {
      const durationSeconds = await validateVideoDuration(file);
      setIsValidatingVideo(false);
      setIsUploadingVideo(true);
      const toastId = toast.loading(isBn ? "ফ্রি ক্লাউডে ভিডিও আপলোড হচ্ছে..." : "Uploading video to free cloud CDN...");
      try {
        const cdnUrl = await uploadVideo(file, file.name, "notebook");
        onUpdate({
          ...block,
          content: cdnUrl,
          meta: {
            ...(block.meta || {}),
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            videoDuration: durationSeconds,
          },
          updatedAt: new Date().toISOString(),
        });
        toast.success(isBn ? "ভিডিও সফলভাবে ক্লাউডে সেভ হয়েছে!" : "Video uploaded to cloud CDN!", { id: toastId });
      } catch (uploadErr: any) {
        toast.error(uploadErr.message || (isBn ? "ভিডিও আপলোড ব্যর্থ হয়েছে।" : "Failed to upload video."), { id: toastId });
      } finally {
        setIsUploadingVideo(false);
      }
    } catch (err: any) {
      setIsValidatingVideo(false);
      setVideoError(err.message || "Video duration exceeds strict 10-minute limit.");
    }
    e.target.value = "";
  };

  const handleAttachVideoLink = () => {
    const trimmed = videoLinkInput.trim();
    if (!trimmed) return;
    const parsed = parseVideoUrl(trimmed);
    if (!parsed.embedUrl) {
      setVideoError("Invalid video URL. Please enter a valid Loom, YouTube, Vimeo, or MP4 link.");
      return;
    }
    onUpdate({
      ...block,
      content: trimmed,
      meta: {
        ...(block.meta || {}),
        fileName: "Embedded Video",
        fileType: "video/embed",
      },
      updatedAt: new Date().toISOString(),
    });
    setVideoLinkInput("");
    setVideoError(null);
    toast.success(isBn ? "ভিডিও লিঙ্ক যুক্ত করা হয়েছে!" : "Video link attached successfully!");
  };

  // PDF upload to cloud CDN
  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading(isBn ? "ক্লাউডে PDF আপলোড হচ্ছে..." : "Uploading PDF to cloud CDN...");
    try {
      const cdnUrl = await uploadFile(file);
      onUpdate({
        ...block,
        content: cdnUrl,
        meta: {
          ...(block.meta || {}),
          fileName: file.name,
          fileSize: file.size,
          fileType: "application/pdf",
        },
        updatedAt: new Date().toISOString(),
      });
      toast.success(isBn ? "PDF সফলভাবে আপলোড হয়েছে!" : "PDF uploaded to cloud CDN!", { id: toastId });
    } catch (err: any) {
      console.error("[PDF upload error]:", err);
      toast.error(isBn ? "PDF আপলোড ব্যর্থ হয়েছে।" : "Failed to upload PDF.", { id: toastId });
    } finally {
      e.target.value = "";
    }
  };

  // Generic File upload to cloud CDN
  const handleGenericFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading(isBn ? "ক্লাউডে ফাইল আপলোড হচ্ছে..." : "Uploading file to cloud CDN...");
    try {
      const cdnUrl = await uploadFile(file);
      onUpdate({
        ...block,
        content: cdnUrl,
        meta: {
          ...(block.meta || {}),
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || "application/octet-stream",
        },
        updatedAt: new Date().toISOString(),
      });
      toast.success(isBn ? "ফাইল সফলভাবে আপলোড হয়েছে!" : "File uploaded to cloud CDN!", { id: toastId });
    } catch (err: any) {
      console.error("[File upload error]:", err);
      toast.error(isBn ? "ফাইল আপলোড ব্যর্থ হয়েছে।" : "Failed to upload file.", { id: toastId });
    } finally {
      e.target.value = "";
    }
  };

  // Format file size
  const formatBytes = (bytes?: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format video duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="group relative flex items-start gap-2 rounded-xl border border-transparent p-1.5 transition-all duration-200 hover:border-slate-200/80 hover:bg-slate-50/50 dark:hover:border-slate-800/80 dark:hover:bg-slate-900/30">
      {/* Block Hover Control Handle */}
      <div className="flex shrink-0 items-center gap-0.5 pt-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMoveUp(index)}
          title={isBn ? "উপরে নিন" : "Move Up"}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-20 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={index === totalBlocks - 1}
          onClick={() => onMoveDown(index)}
          title={isBn ? "নিচে নিন" : "Move Down"}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-20 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (block.type === "video" && block.content && block.content.startsWith("http")) {
              deleteSavedVideo(block.content);
            }
            onDelete(block.id);
          }}
          title={isBn ? "ব্লক ডিলিট করুন" : "Delete Block"}
          className="flex h-6 w-6 items-center justify-center rounded text-red-400 hover:bg-red-500/10 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Main Content Area by Type */}
      <div className="min-w-0 flex-1">
        {/* 1. TEXT */}
        {block.type === "text" && (
          <textarea
            value={block.content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder={isBn ? "এখানে লিখুন... (অটো-সেভ সক্রিয়)" : "Write note content... (auto-saved)"}
            rows={Math.max(1, block.content.split("\n").length)}
            className="w-full resize-none bg-transparent px-2 py-1 text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder-slate-600"
          />
        )}

        {/* 2. HEADING */}
        {block.type === "heading" && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {([1, 2, 3] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => updateMeta({ level: lvl })}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    (block.meta?.level || 1) === lvl
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-slate-200/60 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  H{lvl}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder={isBn ? `হেডিং ${block.meta?.level || 1}...` : `Heading ${block.meta?.level || 1}...`}
              className={`w-full bg-transparent px-2 py-0.5 text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white dark:placeholder-slate-600 ${
                (block.meta?.level || 1) === 1
                  ? "text-2xl font-black tracking-tight border-b border-slate-200/60 dark:border-slate-800/60 pb-1"
                  : (block.meta?.level || 1) === 2
                  ? "text-xl font-bold tracking-tight"
                  : "text-lg font-bold text-cyan-600 dark:text-cyan-400"
              }`}
            />
          </div>
        )}

        {/* 3. BULLET LIST */}
        {block.type === "bullet_list" && (
          <div className="flex items-start gap-2.5 px-2 py-1">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
            <textarea
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder={isBn ? "বুলেট পয়েন্ট..." : "Bullet item..."}
              rows={Math.max(1, block.content.split("\n").length)}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder-slate-600"
            />
          </div>
        )}

        {/* 4. NUMBERED LIST */}
        {block.type === "numbered_list" && (
          <div className="flex items-start gap-2 px-2 py-1">
            <span className="shrink-0 font-mono text-xs font-bold text-cyan-500">
              {index + 1}.
            </span>
            <textarea
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder={isBn ? "নম্বর তালিকা..." : "Numbered item..."}
              rows={Math.max(1, block.content.split("\n").length)}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder-slate-600"
            />
          </div>
        )}

        {/* 5. CHECKLIST / TO-DO */}
        {block.type === "todo" && (
          <div className="flex items-start gap-2.5 px-2 py-1">
            <button
              type="button"
              onClick={() => updateMeta({ checked: !block.meta?.checked })}
              className="mt-0.5 shrink-0 text-cyan-500 hover:text-cyan-400 transition-colors"
            >
              {block.meta?.checked ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4 text-slate-400" />
              )}
            </button>
            <textarea
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder={isBn ? "টু-ডু কাজ বা চেকপয়েন্ট..." : "Actionable to-do item..."}
              rows={Math.max(1, block.content.split("\n").length)}
              className={`w-full resize-none bg-transparent text-sm leading-relaxed focus:outline-none ${
                block.meta?.checked
                  ? "line-through text-slate-400 dark:text-slate-500"
                  : "text-slate-800 dark:text-slate-200"
              }`}
            />
          </div>
        )}

        {/* 6. QUOTE */}
        {block.type === "quote" && (
          <div className="relative my-1 border-l-4 border-cyan-500 bg-cyan-500/5 px-4 py-2.5 rounded-r-xl dark:bg-cyan-500/[0.03]">
            <QuoteIcon className="absolute right-3 top-3 h-5 w-5 text-cyan-500/20" />
            <textarea
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder={isBn ? "গুরুত্বপূর্ণ কোট বা মূলনীতি..." : "Inspirational quote or core trading axiom..."}
              rows={Math.max(1, block.content.split("\n").length)}
              className="w-full resize-none bg-transparent text-sm italic leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder-slate-600"
            />
          </div>
        )}

        {/* 7. DIVIDER */}
        {block.type === "divider" && (
          <div className="py-3">
            <hr className="border-t border-slate-200/80 dark:border-slate-800/80" />
          </div>
        )}

        {/* 8. IMAGE */}
        {block.type === "image" && (
          <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800/80 dark:bg-slate-900/40">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />
            {isUploadingImage && (
              <div className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-cyan-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isBn ? "ক্লাউডে ছবি আপলোড হচ্ছে..." : "Uploading image to cloud CDN..."}</span>
              </div>
            )}

            {block.content ? (
              <div className="space-y-2">
                <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-slate-950 dark:border-slate-800">
                  <img
                    src={block.content}
                    alt={block.meta?.fileName || "Notebook image"}
                    className="max-h-[500px] w-full object-contain cursor-pointer transition-transform duration-200 group-hover:scale-[1.01]"
                    onClick={() => onOpenLightbox?.(block.content)}
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onOpenLightbox?.(block.content)}
                      className="rounded-lg bg-slate-900/80 p-1.5 text-white hover:bg-slate-900 backdrop-blur-xs"
                      title={isBn ? "বড় করে দেখুন" : "Open Fullscreen"}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg bg-slate-900/80 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-900 backdrop-blur-xs"
                    >
                      {isBn ? "পরিবর্তন" : "Replace"}
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={block.meta?.caption || ""}
                  onChange={(e) => updateMeta({ caption: e.target.value })}
                  placeholder={isBn ? "ছবির ক্যাপশন লিখুন..." : "Add image caption or chart context..."}
                  className="w-full rounded-lg bg-white/60 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 border border-slate-200/60 focus:border-cyan-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                />
              </div>
            ) : (
              <div
                onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300/80 p-6 text-center cursor-pointer transition-colors hover:border-cyan-500/80 hover:bg-cyan-500/[0.02] dark:border-slate-800 ${
                  isUploadingImage ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                  {isUploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isUploadingImage ? (isBn ? "ক্লাউডে আপলোড হচ্ছে..." : "Uploading to cloud CDN...") : (isBn ? "স্ক্রিনশট বা ইমেজ আপলোড করুন" : "Upload Screenshot or Image")}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Free Cloud Hosting • PNG, JPG, WebP, GIF
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 9. VIDEO (Strict <= 10 Minutes Check or Embed Link) */}
        {block.type === "video" && (
          <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800/80 dark:bg-slate-900/40">
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              className="hidden"
              onChange={handleVideoFileChange}
            />
            {videoError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{videoError}</span>
              </div>
            )}

            {isValidatingVideo && (
              <div className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-cyan-500">
                <Sparkles className="h-4 w-4 animate-spin" />
                <span>{isBn ? "ভিডিওর দৈর্ঘ্য যাচাই করা হচ্ছে (সর্বোচ্চ ১০ মিনিট)..." : "Validating duration (max 10 minutes allowed)..."}</span>
              </div>
            )}

            {isUploadingVideo && (
              <div className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-cyan-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isBn ? "ফ্রি ক্লাউডে ভিডিও আপলোড হচ্ছে..." : "Uploading video to free cloud CDN..."}</span>
              </div>
            )}

            {block.content ? (
              <div className="space-y-2">
                <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-black dark:border-slate-800">
                  {(() => {
                    const parsed = parseVideoUrl(block.content);
                    if (parsed.isIframe && parsed.embedUrl) {
                      return (
                        <div className="aspect-video w-full">
                          <iframe
                            src={parsed.embedUrl}
                            title="Notebook Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        </div>
                      );
                    }
                    return (
                      <video
                        src={block.content}
                        controls
                        className="max-h-[420px] w-full object-contain"
                      />
                    );
                  })()}
                  {block.meta?.videoDuration && (
                    <div className="absolute top-2 left-2 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-400 backdrop-blur-xs">
                      {formatDuration(block.meta.videoDuration)} / Max 10m
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={block.meta?.caption || ""}
                    onChange={(e) => updateMeta({ caption: e.target.value })}
                    placeholder={isBn ? "ভিডিও বিবরণ বা রেকর্ড নোট..." : "Add video note or analysis context..."}
                    className="flex-1 rounded-lg bg-white/60 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 border border-slate-200/60 focus:border-cyan-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {isBn ? "পরিবর্তন" : "Replace"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  onClick={() => !isUploadingVideo && videoInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300/80 p-6 text-center cursor-pointer transition-colors hover:border-cyan-500/80 hover:bg-cyan-500/[0.02] dark:border-slate-800 ${
                    isUploadingVideo ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                    {isUploadingVideo ? <Loader2 className="h-5 w-5 animate-spin" /> : <VideoIcon className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isUploadingVideo
                        ? (isBn ? "ক্লাউডে ভিডিও আপলোড হচ্ছে..." : "Uploading video to free cloud CDN...")
                        : (isBn ? "ভিডিও আপলোড করুন (ফ্রি পার্মানেন্ট ক্লাউড)" : "Upload Video Clip (Free Permanent Cloud)")}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isBn ? "ট্রেডিং সেশন বা সেটআপ রেকর্ড (MP4, WEBM • সর্বোচ্চ ১০ মিনিট)" : "Screen recordings & breakdown clips (MP4, WEBM • Max 10m)"}
                    </div>
                  </div>
                </div>

                {/* Or paste video link */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="url"
                      value={videoLinkInput}
                      onChange={(e) => setVideoLinkInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAttachVideoLink();
                        }
                      }}
                      placeholder="Or paste Loom, YouTube, Vimeo, or direct MP4 link..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAttachVideoLink}
                    disabled={!videoLinkInput.trim()}
                    className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-600 hover:bg-cyan-500/20 disabled:opacity-40 dark:text-cyan-400 cursor-pointer"
                  >
                    Attach Link
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 10. PDF */}
        {block.type === "pdf" && (
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800/80 dark:bg-slate-900/40">
            <input
              type="file"
              ref={pdfInputRef}
              accept="application/pdf"
              className="hidden"
              onChange={handlePdfFileChange}
            />
            {block.content ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {block.meta?.fileName || "Document.pdf"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      PDF Document • {formatBytes(block.meta?.fileSize)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={block.content}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-600 hover:bg-cyan-500/20 dark:text-cyan-400"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {isBn ? "দেখুন" : "View"}
                  </a>
                  <a
                    href={block.content}
                    download={block.meta?.fileName || "document.pdf"}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {isBn ? "ডাউনলোড" : "Download"}
                  </a>
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {isBn ? "বদল" : "Replace"}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => pdfInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300/80 p-6 text-center cursor-pointer transition-colors hover:border-cyan-500/80 hover:bg-cyan-500/[0.02] dark:border-slate-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isBn ? "PDF ফাইল আপলোড করুন" : "Upload PDF Document"}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    PDF playbook, research report, or guide
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 11. HTML EMBED / SNIPPET */}
        {block.type === "html" && (
          <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800/80 dark:bg-slate-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                <FileCode className="h-4 w-4" />
                <span>HTML / Custom Embed</span>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => setHtmlPreviewMode(false)}
                  className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold ${
                    !htmlPreviewMode
                      ? "bg-cyan-500 text-slate-950"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  <Code2 className="h-3 w-3" />
                  Code
                </button>
                <button
                  type="button"
                  onClick={() => setHtmlPreviewMode(true)}
                  className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold ${
                    htmlPreviewMode
                      ? "bg-cyan-500 text-slate-950"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </button>
              </div>
            </div>

            {!htmlPreviewMode ? (
              <textarea
                value={block.content}
                onChange={(e) => updateContent(e.target.value)}
                placeholder="<div>Paste HTML, widget embeds, or custom markup here...</div>"
                rows={5}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none"
              />
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                {block.content ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: block.content }}
                    className="prose prose-sm dark:prose-invert max-w-none"
                  />
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">
                    {isBn ? "প্রিভিউ দেখার জন্য কোড ট্যাবে HTML যোগ করুন।" : "Switch to 'Code' to enter HTML markup."}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 12. GENERIC FILE / DOCUMENT */}
        {block.type === "file" && (
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800/80 dark:bg-slate-900/40">
            <input
              type="file"
              ref={genericFileInputRef}
              className="hidden"
              onChange={handleGenericFileChange}
            />
            {block.content ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                    <Paperclip className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {block.meta?.fileName || "File_Attachment"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatBytes(block.meta?.fileSize)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={block.content}
                    download={block.meta?.fileName || "attachment"}
                    className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {isBn ? "ডাউনলোড" : "Download"}
                  </a>
                  <button
                    type="button"
                    onClick={() => genericFileInputRef.current?.click()}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {isBn ? "বদল" : "Replace"}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => genericFileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300/80 p-6 text-center cursor-pointer transition-colors hover:border-cyan-500/80 hover:bg-cyan-500/[0.02] dark:border-slate-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                  <Paperclip className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isBn ? "যেকোনো ফাইল আপলোড করুন" : "Upload Any File / Document"}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    CSV, Excel, TXT, ZIP, Code snippets
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 13. BOOKMARK / LINK */}
        {block.type === "link" && (
          <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800/80 dark:bg-slate-900/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={block.meta?.linkTitle || ""}
                onChange={(e) => updateMeta({ linkTitle: e.target.value })}
                placeholder={isBn ? "লিংকের নাম / শিরোনাম..." : "Bookmark Title (e.g., ForexFactory Economic Calendar)..."}
                className="rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              />
              <input
                type="url"
                value={block.content}
                onChange={(e) => updateContent(e.target.value)}
                placeholder="https://..."
                className="rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>
            {block.content && (
              <div className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 dark:bg-cyan-500/[0.03]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {block.meta?.linkTitle || block.content}
                    </div>
                    <div className="truncate text-[10px] text-cyan-600 dark:text-cyan-400">
                      {block.content}
                    </div>
                  </div>
                </div>
                <a
                  href={block.content}
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-cyan-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                >
                  <span>{isBn ? "ওপেন করুন" : "Open"}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
