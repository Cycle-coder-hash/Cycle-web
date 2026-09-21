import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  NotebookTemplate,
  NotebookPage,
  ContentBlock,
} from "@/types/notebook";
import { Search, FileText, Folder, Paperclip, ChevronRight, X, Sparkles } from "lucide-react";

interface SearchResult {
  id: string;
  templateId: string;
  templateName: string;
  pageId: string;
  pageTitle: string;
  pageIcon?: string;
  matchType: "title" | "content" | "file" | "template";
  snippet: string;
}

interface NotebookSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: NotebookTemplate[];
  pages: NotebookPage[];
  isBn?: boolean;
  onSelectResult: (templateId: string, pageId: string) => void;
}

export function NotebookSearchModal({
  isOpen,
  onClose,
  templates,
  pages,
  isBn = false,
  onSelectResult,
}: NotebookSearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Keyboard shortcut listener for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const templateMap = useMemo(() => {
    const map = new Map<string, NotebookTemplate>();
    templates.forEach((t) => map.set(t.id, t));
    return map;
  }, [templates]);

  // Compute Search Results
  const results: SearchResult[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const list: SearchResult[] = [];

    // 1. Search Pages & Blocks
    pages.forEach((p) => {
      const tmpl = templateMap.get(p.notebookId);
      const templateName = tmpl?.name || "Notebook";

      // Match Page Title
      if (p.title.toLowerCase().includes(q)) {
        list.push({
          id: `title_${p.id}`,
          templateId: p.notebookId,
          templateName,
          pageId: p.id,
          pageTitle: p.title,
          pageIcon: p.icon,
          matchType: "title",
          snippet: p.title,
        });
      }

      // Match Blocks
      p.blocks?.forEach((block, bIdx) => {
        const textContent = (block.content || "").toLowerCase();
        const fileName = (block.meta?.fileName || "").toLowerCase();
        const caption = (block.meta?.caption || "").toLowerCase();
        const linkTitle = (block.meta?.linkTitle || "").toLowerCase();

        if (textContent.includes(q)) {
          // Extract snippet
          const matchIdx = textContent.indexOf(q);
          const start = Math.max(0, matchIdx - 30);
          const end = Math.min(block.content.length, matchIdx + q.length + 50);
          const snippet = (start > 0 ? "..." : "") + block.content.slice(start, end) + (end < block.content.length ? "..." : "");

          list.push({
            id: `blk_${block.id}_${bIdx}`,
            templateId: p.notebookId,
            templateName,
            pageId: p.id,
            pageTitle: p.title,
            pageIcon: p.icon,
            matchType: "content",
            snippet,
          });
        } else if (fileName.includes(q)) {
          list.push({
            id: `file_${block.id}`,
            templateId: p.notebookId,
            templateName,
            pageId: p.id,
            pageTitle: p.title,
            pageIcon: p.icon,
            matchType: "file",
            snippet: `Attached File: ${block.meta?.fileName}`,
          });
        } else if (caption.includes(q)) {
          list.push({
            id: `caption_${block.id}`,
            templateId: p.notebookId,
            templateName,
            pageId: p.id,
            pageTitle: p.title,
            pageIcon: p.icon,
            matchType: "file",
            snippet: `Caption: ${block.meta?.caption}`,
          });
        } else if (linkTitle.includes(q)) {
          list.push({
            id: `link_${block.id}`,
            templateId: p.notebookId,
            templateName,
            pageId: p.id,
            pageTitle: p.title,
            pageIcon: p.icon,
            matchType: "content",
            snippet: `Bookmark: ${block.meta?.linkTitle}`,
          });
        }
      });
    });

    return list.slice(0, 20); // Top 20 results
  }, [query, pages, templateMap]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 md:pt-24 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:shadow-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="relative flex items-center border-b border-slate-200/80 pb-3 dark:border-slate-800/80">
          <Search className="absolute left-3 h-5 w-5 text-cyan-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isBn
                ? "ট্রেডার নোটবুক জুড়ে যে কোনো শব্দ, ধারণা বা ফাইলের নাম খুঁজুন..."
                : "Search anything across private notebooks, setups, rules, files..."
            }
            className="w-full rounded-2xl bg-slate-50 py-3 pl-11 pr-10 text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-900"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="mt-3 max-h-96 overflow-y-auto space-y-1.5 scrollbar-thin">
          {!query.trim() ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Sparkles className="mx-auto h-8 w-8 text-cyan-500/40 mb-2" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">
                {isBn ? "গ্লোবাল নোটবুক সার্চ" : "Instant Global Notebook Search"}
              </p>
              <p className="mt-1 text-[11px]">
                {isBn
                  ? "টেমপ্লেট, পৃষ্ঠার শিরোনাম, টু-ডু, কোট বা ফাইলের নাম লিখে সার্চ করুন"
                  : "Search through playbooks, market structure notes, checklists, and attachments"}
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              {isBn ? `"${query}" এর সাথে কোনো ফলাফল পাওয়া যায়নি` : `No notebook content matches "${query}"`}
            </div>
          ) : (
            results.map((res) => (
              <button
                key={res.id}
                type="button"
                onClick={() => {
                  onSelectResult(res.templateId, res.pageId);
                  onClose();
                }}
                className="flex w-full items-start justify-between gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-800/80"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                    {res.matchType === "file" ? (
                      <Paperclip className="h-4 w-4" />
                    ) : res.matchType === "title" ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                      <span>{res.templateName}</span>
                      <ChevronRight className="h-3 w-3" />
                      <span className="text-cyan-600 dark:text-cyan-400">
                        {res.pageIcon || "📄"} {res.pageTitle}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                      {res.snippet}
                    </div>
                  </div>
                </div>

                <span className="shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase">
                  {res.matchType}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400 dark:border-slate-800">
          <span>{isBn ? "ক্লিক করে সরাসরি পৃষ্ঠায় যান" : "Click result to navigate directly"}</span>
          <div className="flex items-center gap-2">
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono dark:bg-slate-800">ESC</kbd>
            <span>{isBn ? "বন্ধ করুন" : "to close"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
