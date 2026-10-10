import React from "react";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  CheckSquare,
  Square,
  Quote as QuoteIcon,
} from "lucide-react";
import { ContentBlock } from "@/types/notebook";
import { deleteSavedVideo } from "@/lib/mediaUpload";
import { NotebookMediaBlock } from "./NotebookMediaBlock";

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

        {/* 8-13. MEDIA, EMBED, FILE & LINK BLOCKS */}
        <NotebookMediaBlock
          block={block}
          isBn={isBn}
          onUpdate={onUpdate}
          onUpdateContent={updateContent}
          onUpdateMeta={updateMeta}
          onOpenLightbox={onOpenLightbox}
        />
      </div>
    </div>
  );
}
