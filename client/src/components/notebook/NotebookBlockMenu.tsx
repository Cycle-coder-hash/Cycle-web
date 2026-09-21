import React, { useState } from "react";
import {
  Type,
  Heading,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  FileCode,
  Paperclip,
  Link as LinkIcon,
  Plus,
  Sparkles,
} from "lucide-react";
import { ContentBlockType } from "@/types/notebook";

interface BlockTypeOption {
  type: ContentBlockType;
  label: string;
  labelBn: string;
  desc: string;
  descBn: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  meta?: Record<string, any>;
}

const BLOCK_OPTIONS: BlockTypeOption[] = [
  {
    type: "text",
    label: "Plain Text",
    labelBn: "সাধারণ টেক্সট",
    desc: "Start typing regular notes or market observations",
    descBn: "নোট বা পর্যবেক্ষণ লিখুন",
    icon: Type,
    color: "text-slate-600 dark:text-slate-300",
  },
  {
    type: "heading",
    label: "Heading 1 (Large)",
    labelBn: "বড় শিরোনাম (H1)",
    desc: "Main section header or key topic title",
    descBn: "প্রধান সেকশন শিরোনাম",
    icon: Heading,
    color: "text-cyan-500",
    meta: { level: 1 },
  },
  {
    type: "heading",
    label: "Heading 2 (Medium)",
    labelBn: "মাঝারি শিরোনাম (H2)",
    desc: "Sub-section header or strategy concept",
    descBn: "সাব-সেকশন শিরোনাম",
    icon: Heading,
    color: "text-blue-500",
    meta: { level: 2 },
  },
  {
    type: "bullet_list",
    label: "Bullet List",
    labelBn: "বুলেট তালিকা",
    desc: "Unordered list of concepts, rules, or triggers",
    descBn: "পয়েন্টভিত্তিক তালিকা",
    icon: List,
    color: "text-emerald-500",
  },
  {
    type: "numbered_list",
    label: "Numbered List",
    labelBn: "নম্বর তালিকা",
    desc: "Sequential execution steps or priority protocol",
    descBn: "ধাপভিত্তিক ক্রমতালিকা",
    icon: ListOrdered,
    color: "text-amber-500",
  },
  {
    type: "todo",
    label: "Checklist / To-do",
    labelBn: "চেকলিস্ট / টু-ডু",
    desc: "Interactive pre-session & execution checklist",
    descBn: "ইন্টারেক্টিভ চেকলিস্ট",
    icon: CheckSquare,
    color: "text-emerald-400",
  },
  {
    type: "quote",
    label: "Quote / Mindset Callout",
    labelBn: "কোট / গুরুত্বপূর্ণ নীতি",
    desc: "Emphasize psychological axioms or trading rules",
    descBn: "গুরুত্বপূর্ণ ট্রেডিং মূলনীতি",
    icon: Quote,
    color: "text-purple-500",
  },
  {
    type: "divider",
    label: "Divider",
    labelBn: "ডিভাইডার লাইন",
    desc: "Visual separator between ideas or sessions",
    descBn: "বিভাগ বিভাজন লাইন",
    icon: Minus,
    color: "text-slate-400",
  },
  {
    type: "image",
    label: "Image / Screenshot",
    labelBn: "স্ক্রিনশট / ইমেজ",
    desc: "Upload TradingView chart captures or analysis photos",
    descBn: "চার্ট স্ক্রিনশট ও ছবি",
    icon: ImageIcon,
    color: "text-cyan-400",
  },
  {
    type: "video",
    label: "Video (Max 10 Mins)",
    labelBn: "ভিডিও (সর্বোচ্চ ১০ মিনিট)",
    desc: "Session recaps & executions strictly ≤ 10 minutes",
    descBn: "১০ মিনিট পর্যন্ত ট্রেড রেকর্ডিং",
    icon: VideoIcon,
    color: "text-rose-500",
  },
  {
    type: "pdf",
    label: "PDF Document",
    labelBn: "PDF ডকুমেন্ট",
    desc: "Attach trading playbooks, e-books, or research PDFs",
    descBn: "PDF প্লেবুক বা নোটস",
    icon: FileText,
    color: "text-red-500",
  },
  {
    type: "html",
    label: "HTML / Embed",
    labelBn: "HTML / এম্বেড",
    desc: "Embed TradingView widgets, tables, or custom code",
    descBn: "কাস্টম উইজেট ও কোড",
    icon: FileCode,
    color: "text-indigo-400",
  },
  {
    type: "file",
    label: "File / Attachment",
    labelBn: "যেকোনো ফাইল",
    desc: "Attach spreadsheets, CSVs, logs, or zip archives",
    descBn: "এক্সেল, সিএসভি ও অন্যান্য ফাইল",
    icon: Paperclip,
    color: "text-amber-400",
  },
  {
    type: "link",
    label: "Bookmark / Link",
    labelBn: "ওয়েব লিংক / বুকমার্ক",
    desc: "Save news calendar, strategy links, and resources",
    descBn: "ওয়েব রিসোর্স ও সাইট লিংক",
    icon: LinkIcon,
    color: "text-sky-400",
  },
];

interface NotebookBlockMenuProps {
  isBn?: boolean;
  onSelectType: (type: ContentBlockType, meta?: Record<string, any>) => void;
}

export function NotebookBlockMenu({ isBn = false, onSelectType }: NotebookBlockMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = BLOCK_OPTIONS.filter((opt) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      opt.label.toLowerCase().includes(q) ||
      opt.labelBn.toLowerCase().includes(q) ||
      opt.desc.toLowerCase().includes(q) ||
      opt.type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative py-2">
      {!isOpen ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2 rounded-xl border border-dashed border-slate-300/80 px-3.5 py-2 text-xs font-bold text-slate-600 transition-all duration-200 hover:border-cyan-500/80 hover:bg-cyan-500/5 hover:text-cyan-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-cyan-400 dark:hover:text-cyan-400"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            <span>{isBn ? "+ নতুন ব্লক যোগ করুন (১৩ ধরন)" : "+ Add Content Block (13 types)"}</span>
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/50">
          <div className="mb-2 flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
              <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
              <span>{isBn ? "ব্লকের ধরন বাছাই করুন" : "Select Block Type"}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setSearch("");
              }}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBn ? "টাইপ ফিল্টার করুন..." : "Filter blocks (e.g. video, quote, image)..."}
            className="mb-2 w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:bg-slate-900"
            autoFocus
          />

          <div className="max-h-64 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {filteredOptions.map((opt, idx) => {
              const Icon = opt.icon;
              return (
                <button
                  key={`${opt.type}-${idx}`}
                  type="button"
                  onClick={() => {
                    onSelectType(opt.type, opt.meta);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="flex w-full items-start gap-3 rounded-xl p-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/70"
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 ${opt.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {isBn ? opt.labelBn : opt.label}
                    </div>
                    <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {isBn ? opt.descBn : opt.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
