import React, { useState } from "react";
import { Send, X, ExternalLink, GraduationCap, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CourseTelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: {
    enabled: boolean;
    telegramUrl: string;
    titleEn: string;
    titleBn: string;
    messageEn: string;
    messageBn: string;
    joinButtonTextEn: string;
    joinButtonTextBn: string;
    dismissButtonTextEn: string;
    dismissButtonTextBn: string;
    displayMode: "once" | "until_joined";
  };
  lang: "en" | "bn";
  onJoin: () => Promise<void> | void;
  onDismiss: () => Promise<void> | void;
}

export const CourseTelegramModal: React.FC<CourseTelegramModalProps> = ({
  isOpen,
  onClose,
  config,
  lang,
  onJoin,
  onDismiss,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const isBn = lang === "bn";

  if (!isOpen || !config.enabled) return null;

  const title = isBn ? config.titleBn || config.titleEn : config.titleEn;
  const message = isBn ? config.messageBn || config.messageEn : config.messageEn;
  const joinText = isBn ? config.joinButtonTextBn || config.joinButtonTextEn : config.joinButtonTextEn;
  const dismissText = isBn ? config.dismissButtonTextBn || config.dismissButtonTextEn : config.dismissButtonTextEn;

  const handleJoinClick = async () => {
    setIsProcessing(true);
    try {
      if (config.telegramUrl) {
        window.open(config.telegramUrl, "_blank", "noopener,noreferrer");
      }
      await onJoin();
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  const handleDismissClick = async () => {
    setIsProcessing(true);
    try {
      await onDismiss();
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-telegram-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-[#070e1b] dark:shadow-sky-500/5 sm:my-8 animate-in zoom-in-95 duration-200">
        
        {/* Subtle Top Accent Light */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={handleDismissClick}
          disabled={isProcessing}
          aria-label={isBn ? "বন্ধ করুন" : "Close"}
          className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X size={17} />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header Badge & Icon */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="flex size-12 sm:size-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 shadow-inner shrink-0">
              <GraduationCap className="size-6 sm:size-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-sky-600 dark:text-sky-400 border border-sky-500/20">
                <Sparkles size={11} />
                <span>{isBn ? "কোর্স অ্যাক্সেস ভেরিফায়েড" : "Course Access Verified"}</span>
              </div>
              <h3
                id="course-telegram-modal-title"
                className="mt-1 text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white"
              >
                {title}
              </h3>
            </div>
          </div>

          {/* Body Content */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5 dark:border-slate-800/60 dark:bg-slate-900/60 mb-6">
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium whitespace-pre-line">
              {message}
            </p>
            
            <div className="mt-3.5 pt-3.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
              <span>{isBn ? "শুধুমাত্র অনুমোদিত শিক্ষার্থীদের জন্য প্রাইভেট কমিউনিটি" : "Private Community exclusively for enrolled students"}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleDismissClick}
              disabled={isProcessing}
              className="w-full sm:w-auto flex-1 h-11 text-xs font-bold text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              {dismissText}
            </Button>

            <Button
              type="button"
              onClick={handleJoinClick}
              disabled={isProcessing || !config.telegramUrl}
              className="w-full sm:w-auto flex-1 h-11 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={15} />
              <span>{joinText}</span>
              <ExternalLink size={13} className="opacity-70" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
