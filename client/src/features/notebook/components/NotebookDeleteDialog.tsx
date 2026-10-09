import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface NotebookDeleteDialogProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  itemType: "template" | "page" | "subpage";
  isBn?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function NotebookDeleteDialog({
  isOpen,
  title,
  itemName,
  itemType,
  isBn = false,
  onConfirm,
  onCancel,
}: NotebookDeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-red-500/20 bg-white p-6 shadow-2xl dark:border-red-500/20 dark:bg-slate-950 dark:shadow-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isBn ? (
                <>
                  আপনি কি নিশ্চিত যে <span className="font-bold text-slate-800 dark:text-slate-200">"{itemName}"</span> মুছে ফেলতে চান?
                  {itemType === "template" && " এই টেমপ্লেটের সকল পৃষ্ঠা, সাব-পেজ ও সংযুক্ত মিডিয়া ফাইল স্থায়ীভাবে মুছে যাবে।"}
                  {itemType === "page" && " এই পৃষ্ঠার সকল সাব-পেজ ও কন্টেন্ট ব্লক মুছে যাবে।"}
                </>
              ) : (
                <>
                  Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-slate-200">"{itemName}"</span>?
                  {itemType === "template" && " All pages, sub-pages, notes, and media attachments inside this notebook will be permanently deleted."}
                  {itemType === "page" && " All blocks and child sub-pages under this topic will be deleted."}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            {isBn ? "বাতিল" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 shadow-md shadow-red-500/25 transition-all"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isBn ? "মুছে ফেলুন" : "Confirm Delete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
