import React, { useState } from "react";
import {
  NotebookPage,
  NotebookTemplate,
  ContentBlock,
  ContentBlockType,
} from "@/types/notebook";
import { NotebookBlockItem } from "./NotebookBlockItem";
import { NotebookBlockMenu } from "./NotebookBlockMenu";
import {
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  FilePlus,
  CornerDownRight,
  Maximize2,
  X,
  Sparkles,
} from "lucide-react";

interface NotebookPageEditorProps {
  page: NotebookPage;
  template: NotebookTemplate;
  parentPage?: NotebookPage | null;
  subPages?: NotebookPage[];
  isBn?: boolean;
  isSaving?: boolean;
  onUpdatePage: (updated: NotebookPage) => void;
  onDeletePage: (pageId: string) => void;
  onCreateSubPage: (parentPageId: string) => void;
  onSelectPage: (pageId: string) => void;
}

const COMMON_EMOJIS = ["📝", "🎯", "🧠", "📊", "⚡", "💧", "🏛️", "📈", "📉", "✨", "🧘", "🛡️", "🔥", "💎", "🚀", "💡"];

export function NotebookPageEditor({
  page,
  template,
  parentPage,
  subPages = [],
  isBn = false,
  isSaving = false,
  onUpdatePage,
  onDeletePage,
  onCreateSubPage,
  onSelectPage,
}: NotebookPageEditorProps) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Update Page Title
  const handleTitleChange = (title: string) => {
    onUpdatePage({
      ...page,
      title,
      updatedAt: new Date().toISOString(),
    });
  };

  // Update Page Icon
  const handleSelectIcon = (icon: string) => {
    onUpdatePage({
      ...page,
      icon,
      updatedAt: new Date().toISOString(),
    });
    setShowEmojiPicker(false);
  };

  // Add a new block
  const handleAddBlock = (type: ContentBlockType, meta?: Record<string, any>) => {
    const newBlock: ContentBlock = {
      id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      content: "",
      meta: meta || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onUpdatePage({
      ...page,
      blocks: [...page.blocks, newBlock],
      updatedAt: new Date().toISOString(),
    });
  };

  // Update a single block
  const handleUpdateBlock = (updatedBlock: ContentBlock) => {
    const nextBlocks = page.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b));
    onUpdatePage({
      ...page,
      blocks: nextBlocks,
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete a block
  const handleDeleteBlock = (blockId: string) => {
    const nextBlocks = page.blocks.filter((b) => b.id !== blockId);
    onUpdatePage({
      ...page,
      blocks: nextBlocks,
      updatedAt: new Date().toISOString(),
    });
  };

  // Move block up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const nextBlocks = [...page.blocks];
    const temp = nextBlocks[index - 1];
    nextBlocks[index - 1] = nextBlocks[index];
    nextBlocks[index] = temp;
    onUpdatePage({
      ...page,
      blocks: nextBlocks,
      updatedAt: new Date().toISOString(),
    });
  };

  // Move block down
  const handleMoveDown = (index: number) => {
    if (index >= page.blocks.length - 1) return;
    const nextBlocks = [...page.blocks];
    const temp = nextBlocks[index + 1];
    nextBlocks[index + 1] = nextBlocks[index];
    nextBlocks[index] = temp;
    onUpdatePage({
      ...page,
      blocks: nextBlocks,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white/40 dark:bg-slate-900/20 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs">
      {/* Top Header Bar: Breadcrumb & Save Status */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/70 px-6 py-3.5 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-950/60">
        <div className="flex items-center gap-2 overflow-x-auto text-xs text-slate-500 scrollbar-none dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <span>{template.icon || "📓"}</span>
            <span>{template.name}</span>
          </span>

          {parentPage && (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <button
                type="button"
                onClick={() => onSelectPage(parentPage.id)}
                className="flex items-center gap-1 hover:text-cyan-500 transition-colors"
              >
                <span>{parentPage.icon || "📄"}</span>
                <span>{parentPage.title}</span>
              </button>
            </>
          )}

          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="font-semibold text-cyan-600 dark:text-cyan-400 truncate max-w-[200px]">
            {page.title || (isBn ? "শিরোনামহীন পৃষ্ঠা" : "Untitled Page")}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Auto-Save Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            {isSaving ? (
              <>
                <span className="h-2 w-2 animate-ping rounded-full bg-cyan-400" />
                <span>{isBn ? "সংরক্ষণ হচ্ছে..." : "Saving..."}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500/90">{isBn ? "সংরক্ষিত" : "Saved"}</span>
              </>
            )}
          </div>

          {/* Add Subpage Button */}
          {!parentPage && (
            <button
              type="button"
              onClick={() => onCreateSubPage(page.id)}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-cyan-500 hover:text-cyan-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-400"
            >
              <FilePlus className="h-3.5 w-3.5" />
              <span>{isBn ? "+ সাব-পেজ" : "+ Sub-page"}</span>
            </button>
          )}

          {/* Delete Page Button */}
          <button
            type="button"
            onClick={() => onDeletePage(page.id)}
            title={isBn ? "পৃষ্ঠাটি মুছুন" : "Delete Page"}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editor Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 scrollbar-thin">
        {/* Title & Icon Header */}
        <div className="space-y-4">
          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl shadow-xs transition-transform hover:scale-105 dark:border-slate-800 dark:bg-slate-900"
              title={isBn ? "আইকন পরিবর্তন করুন" : "Change Icon"}
            >
              {page.icon || "📄"}
            </button>

            {showEmojiPicker && (
              <div className="absolute left-0 top-14 z-50 flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 w-64">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelectIcon(emoji)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            value={page.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={isBn ? "পৃষ্ঠার শিরোনাম লিখুন..." : "Untitled Page"}
            className="w-full bg-transparent text-3xl md:text-4xl font-black tracking-tight text-slate-900 placeholder-slate-300 focus:outline-none dark:text-white dark:placeholder-slate-700"
          />
        </div>

        {/* Sub-Pages Quick Navigation Bar (if any subpages exist) */}
        {subPages.length > 0 && (
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-900/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              <CornerDownRight className="h-3.5 w-3.5 text-cyan-500" />
              <span>{isBn ? "সাব-পেজসমূহ" : "Sub-Pages Under This Topic"}</span>
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.2 text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                {subPages.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {subPages.map((sp) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => onSelectPage(sp.id)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-cyan-500 hover:text-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 transition-all"
                >
                  <span>{sp.icon || "📄"}</span>
                  <span>{sp.title || (isBn ? "শিরোনামহীন" : "Untitled")}</span>
                  <span className="text-[10px] text-slate-400">({sp.blocks?.length || 0} blocks)</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Blocks Container */}
        <div className="space-y-2 pt-2">
          {page.blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200/80 py-12 text-center dark:border-slate-800/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {isBn ? "পৃষ্ঠাটি এখনো খালি" : "This page is empty"}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                {isBn
                  ? "নিচের মেনু থেকে টেক্সট, চার্ট ইমেজ, ভিডিও, চেকলিস্ট বা কোড ব্লক যুক্ত করুন।"
                  : "Add text, chart screenshots, video clips, checklists, quotes, or PDF attachments below."}
              </p>
              <NotebookBlockMenu isBn={isBn} onSelectType={handleAddBlock} />
            </div>
          ) : (
            <>
              {page.blocks.map((block, idx) => (
                <NotebookBlockItem
                  key={block.id}
                  block={block}
                  index={idx}
                  totalBlocks={page.blocks.length}
                  isBn={isBn}
                  onUpdate={handleUpdateBlock}
                  onDelete={handleDeleteBlock}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onOpenLightbox={(url) => setLightboxImg(url)}
                />
              ))}

              {/* Bottom Add Block Trigger */}
              <div className="pt-4">
                <NotebookBlockMenu isBn={isBn} onSelectType={handleAddBlock} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal for Screenshots */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-h-[90vh] max-w-[95vw]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLightboxImg(null)}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={lightboxImg}
              alt="Expanded preview"
              className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
