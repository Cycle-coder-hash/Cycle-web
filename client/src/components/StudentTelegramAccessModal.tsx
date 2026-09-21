import React, { useState, useEffect, useMemo } from "react";
import { Send, CheckCircle2, ShieldCheck, X, ExternalLink, Sparkles, BookOpen, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export function StudentTelegramAccessModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // User storage key
  const userKey = useMemo(() => {
    if (!user) return "";
    return user.openId || user.email || (user.id ? String(user.id) : "");
  }, [user]);

  const storageKey = userKey ? `cycle_telegram_vip_modal_seen_${userKey}` : "";

  // Query student orders & entitlements to determine approved purchase status
  const { data: orders } = trpc.customer.orders.useQuery(undefined, {
    enabled: !!user,
    staleTime: 1000 * 30, // 30s cache
  });

  const { data: entitlements } = trpc.customer.entitlements.useQuery(undefined, {
    enabled: !!user,
    staleTime: 1000 * 30,
  });

  // Query owner profile for official telegram URL
  const { data: ownerProfile } = trpc.public.ownerProfile.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  const telegramUrl = useMemo(() => {
    const raw = ownerProfile?.telegram?.trim();
    if (raw && (raw.startsWith("http://") || raw.startsWith("https://"))) {
      return raw;
    }
    return "https://t.me/cycleofchart";
  }, [ownerProfile]);

  // Determine if student has at least one approved order or granted entitlement
  const approvedOrder = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return null;
    return orders.find(
      (o: any) => o.paymentStatus === "approved" || o.orderStatus === "approved"
    );
  }, [orders]);

  const hasApprovedAccess = useMemo(() => {
    if (approvedOrder) return true;
    if (entitlements && Array.isArray(entitlements) && entitlements.length > 0) return true;
    return false;
  }, [approvedOrder, entitlements]);

  // Auto-trigger popup for verified students who haven't dismissed it yet
  useEffect(() => {
    if (!user || !hasApprovedAccess || !storageKey) return;

    try {
      const alreadySeen = localStorage.getItem(storageKey);
      if (!alreadySeen && !hasInteracted) {
        // Small delay for smooth entry after page hydration
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [user, hasApprovedAccess, storageKey, hasInteracted]);

  // Listen to custom event so any button across the app can open this modal
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-telegram-modal", handleOpen);
    return () => window.removeEventListener("open-telegram-modal", handleOpen);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setHasInteracted(true);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, "true");
      } catch {}
    }
  };

  const handleJoinTelegram = () => {
    window.open(telegramUrl, "_blank", "noopener,noreferrer");
    setHasInteracted(true);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, "true");
      } catch {}
    }
  };

  if (!isOpen || !user || !hasApprovedAccess) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#091322] border border-sky-500/40 p-6 sm:p-8 shadow-2xl text-white overflow-hidden shadow-sky-500/10 animate-in zoom-in-95 duration-300"
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-sky-500/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 right-0 w-60 h-60 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 flex size-9 items-center justify-center rounded-full bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700/60"
        >
          <X size={18} />
        </button>

        {/* Top Verified Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Enrollment Verified • অ্যাক্সেস ভেরিফাইড</span>
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
            <ShieldCheck size={13} />
            <span>VIP Student</span>
          </div>
        </div>

        {/* Telegram Graphic Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            <div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] text-white shadow-lg shadow-sky-500/30 ring-4 ring-sky-500/20">
              <Send size={28} className="translate-x-0.5 -translate-y-0.5" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] ring-2 ring-[#091322]">
              ✓
            </span>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-black leading-tight text-white tracking-tight">
              কোর্সের ক্লাসে যুক্ত হতে আমাদের অফিশিয়াল টেলিগ্রামে জয়েন করুন
            </h2>
            <p className="mt-1 text-xs sm:text-sm font-medium text-slate-300">
              Join Official VIP Telegram For Live Classes & Course Mentorship
            </p>
          </div>
        </div>

        {/* Verification Summary Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 mb-5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Student ID / একাউন্ট:</span>
            <span className="font-mono font-bold text-sky-300">
              #{user.id ? `COC-${user.id}` : user.email?.split("@")[0]}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Payment Status / স্ট্যাটাস:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> Approved by Admin (ভেরিফাইড)
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Class & Support Channel:</span>
            <span className="font-bold text-sky-400 font-mono">@cycleofchart</span>
          </div>
        </div>

        {/* Guidelines / Steps */}
        <div className="space-y-2.5 mb-6 text-xs text-slate-300">
          <div className="flex items-start gap-2.5">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 font-bold text-[11px] mt-0.5">
              ১
            </span>
            <p className="leading-relaxed">
              নিচে দেওয়া <strong className="text-white">"Join Official Telegram"</strong> বাটনে ক্লিক করে আমাদের প্রাইভেট স্টুডেন্ট টেলিগ্রাম চ্যানেলে যুক্ত হোন।
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 font-bold text-[11px] mt-0.5">
              ২
            </span>
            <p className="leading-relaxed">
              চ্যানেলের <strong className="text-white">পিনড মেসেজ (Pinned Message)</strong> থেকে সমস্ত লাইভ ক্লাসের লিংক, গুগল ড্রাইভ ও রুটিন পেয়ে যাবেন।
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 font-bold text-[11px] mt-0.5">
              ৩
            </span>
            <p className="leading-relaxed">
              যেকোনো প্রশ্ন, ট্রেড অ্যানালাইসিস রিভিউ বা মেন্টরশিপের জন্য গ্রুপে অথবা এডমিনকে সরাসরি মেসেজ দিতে পারবেন।
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleJoinTelegram}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-400 to-blue-500 hover:from-sky-400 hover:to-blue-600 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-sky-500/25 transition-all duration-300 gap-2 flex items-center justify-center active:scale-[0.98]"
          >
            <Send size={18} className="translate-x-0.5 -translate-y-0.5" />
            <span>Join Official Telegram • টেলিগ্রামে জয়েন করুন</span>
            <ExternalLink size={14} className="opacity-70" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="w-full h-10 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            আমি টেলিগ্রামে যুক্ত হয়েছি · Continue to Dashboard
          </Button>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <Sparkles size={12} className="text-sky-400" />
          <span>Official Institutional Playbook & Community Access · Cycle of Chart</span>
        </div>
      </div>
    </div>
  );
}
