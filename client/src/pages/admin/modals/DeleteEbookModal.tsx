import React from "react";
import { X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteEbookModalProps {
  ebookId: number | null;
  onClose: () => void;
  onConfirmDelete: (id: number) => void;
  isPending?: boolean;
}

export const DeleteEbookModal: React.FC<DeleteEbookModalProps> = ({
  ebookId,
  onClose,
  onConfirmDelete,
  isPending,
}) => {
  if (ebookId === null) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Free eBook?</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Are you sure you want to delete this eBook from the library? Students will no longer be able to download it.
        </p>
        <div className="mt-5 flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-1/2 border-slate-300 dark:border-slate-700 font-bold"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={() => onConfirmDelete(ebookId)}
            className="w-1/2 bg-rose-600 text-white font-bold hover:bg-rose-700"
          >
            {isPending && <RefreshCw size={13} className="animate-spin mr-1.5" />}
            <span>Confirm Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
