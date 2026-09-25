import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Lock,
  Crown,
  BookOpen,
  Video,
  Dumbbell,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";

export type UpgradeFeatureType =
  | "journal_books"
  | "trade_limit"
  | "journal_videos"
  | "notebook_videos"
  | "notebook_pages"
  | "workout"
  | "discipline_limit"
  | "community"
  | "mentor_support"
  | "owner_chat"
  | "generic";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: UpgradeFeatureType;
  customTitle?: string;
  customDescription?: string;
  currentPlan?: "free_trial" | "free_after_trial" | "pro" | "premium";
}

const FEATURE_INFO: Record<
  UpgradeFeatureType,
  {
    title: string;
    description: string;
    icon: any;
    recommendedPlan: "pro" | "premium";
    accentColor: string;
    proBenefits: string[];
    premiumBenefits: string[];
  }
> = {
  journal_books: {
    title: "Additional Journal Books",
    description:
      "Separate your strategies, instruments, or accounts with dedicated Journal Books.",
    icon: BookOpen,
    recommendedPlan: "pro",
    accentColor: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
    proBenefits: ["Up to 5 Journal Books", "Unlimited Trades", "30 Saved Videos / mo"],
    premiumBenefits: ["Unlimited Journal Books", "Unlimited Trades", "Unlimited Videos"],
  },
  trade_limit: {
    title: "Monthly Trade Limit Reached (5/5)",
    description:
      "You have logged 5 trades in your current 30-day cycle. Upgrade to log unlimited trades without interruption.",
    icon: Zap,
    recommendedPlan: "pro",
    accentColor: "from-blue-500/20 to-cyan-500/10 border-cyan-500/30",
    proBenefits: ["Unlimited Trade Logging", "Advanced Journal Analytics", "5 Journal Books"],
    premiumBenefits: ["Unlimited Trade Logging", "Institutional Metrics", "Unlimited Books"],
  },
  journal_videos: {
    title: "Trade Video Upload & Playback",
    description:
      "Save video recordings of your trade setups and market executions directly in your journal.",
    icon: Video,
    recommendedPlan: "pro",
    accentColor: "from-purple-500/20 to-pink-500/10 border-purple-500/30",
    proBenefits: ["30 Trade Videos / mo (deleting restores quota)", "High Definition Playback"],
    premiumBenefits: ["Unlimited Trade Videos", "Highest Quality Encoding"],
  },
  notebook_videos: {
    title: "Notebook Video Attachments",
    description:
      "Attach video lessons, chart screen recordings, and analysis to your private trader notebook.",
    icon: Video,
    recommendedPlan: "pro",
    accentColor: "from-indigo-500/20 to-cyan-500/10 border-indigo-500/30",
    proBenefits: ["5 Notebook Videos / mo (deleting restores quota)", "10 Notebook Pages / mo"],
    premiumBenefits: ["Unlimited Notebook Videos", "Unlimited Notebook Pages"],
  },
  notebook_pages: {
    title: "Notebook Monthly Page Limit (10/10)",
    description:
      "You have reached your 10-page monthly limit for Trader Notebook. Upgrade to Premium for limitless note taking.",
    icon: BookOpen,
    recommendedPlan: "premium",
    accentColor: "from-yellow-500/20 to-amber-500/10 border-amber-500/30",
    proBenefits: ["10 Pages / mo included"],
    premiumBenefits: ["Unlimited Notebook Pages", "Unlimited Videos & Attachments"],
  },
  workout: {
    title: "Daily Workout Routine & Completion",
    description:
      "Elite traders maintain peak physical discipline. Unlock structured workout routines, custom exercises, and daily tracking.",
    icon: Dumbbell,
    recommendedPlan: "pro",
    accentColor: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
    proBenefits: ["Full Workout Routine Access", "Custom Exercise Builder", "Daily Streak Tracking"],
    premiumBenefits: ["Full Workout Routine Access", "Advanced Discipline Analytics"],
  },
  discipline_limit: {
    title: "Monthly Discipline Limit Reached (5/5 Days)",
    description:
      "You have logged 5 daily discipline days in your current 30-day cycle. Upgrade to continue daily habit tracking.",
    icon: Calendar,
    recommendedPlan: "pro",
    accentColor: "from-rose-500/20 to-orange-500/10 border-rose-500/30",
    proBenefits: ["Unlimited Daily Discipline Days", "Custom Tasks & Rest Timers", "Discipline Analytics"],
    premiumBenefits: ["Unlimited Daily Discipline Days", "Full Routine Suite"],
  },
  community: {
    title: "Community Chat Access",
    description:
      "Join the Cycle of Chart community of disciplined traders, share trade breakdowns, and connect in real time.",
    icon: MessageSquare,
    recommendedPlan: "pro",
    accentColor: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
    proBenefits: ["Full Community Chat Access", "Share Live Charts & Trade Setups"],
    premiumBenefits: ["Community Chat + 1-on-1 Mentor Support"],
  },
  mentor_support: {
    title: "1-on-1 Mentor Support",
    description:
      "Get private trade reviews, psychology guidance, and technical feedback directly from senior Cycle of Chart mentors.",
    icon: ShieldCheck,
    recommendedPlan: "premium",
    accentColor: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
    proBenefits: ["Standard Platform Support"],
    premiumBenefits: ["Direct 1-on-1 Mentor Support", "Priority Review", "Owner Personal Chat Access"],
  },
  owner_chat: {
    title: "Direct Owner Personal Chat",
    description:
      "Direct, private 1-on-1 communication channel with the founder of Cycle of Chart for institutional guidance.",
    icon: Crown,
    recommendedPlan: "premium",
    accentColor: "from-amber-500/25 to-orange-500/15 border-amber-500/40",
    proBenefits: ["Standard Support Only"],
    premiumBenefits: ["Exclusive 1-on-1 Owner Chat", "Direct Strategic Feedback", "All Premium Perks"],
  },
  generic: {
    title: "Upgrade Your Trader Access",
    description: "Unlock full capabilities across Trading Journal, Discipline, Workout, and Support.",
    icon: Sparkles,
    recommendedPlan: "pro",
    accentColor: "from-primary/20 to-cyan-500/10 border-primary/30",
    proBenefits: ["Unlimited Trades", "5 Journal Books", "Workout & Community"],
    premiumBenefits: ["Unlimited Everything", "Mentor Support", "Owner Personal Chat"],
  },
};

export function UpgradeModal({
  isOpen,
  onClose,
  feature = "generic",
  customTitle,
  customDescription,
  currentPlan,
}: UpgradeModalProps) {
  const info = FEATURE_INFO[feature] || FEATURE_INFO.generic;
  const Icon = info.icon;
  const isPremiumExclusive =
    feature === "mentor_support" ||
    feature === "owner_chat" ||
    (currentPlan === "pro" && (feature === "journal_books" || feature === "journal_videos" || feature === "notebook_pages"));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-[#0d131f] border border-cyan-500/25 text-white shadow-2xl">
        {/* Top Header Glow */}
        <div className={`p-6 bg-gradient-to-br ${info.accentColor} border-b border-white/10 relative`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
              <Icon className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-2">
                <Lock className="w-3 h-3" />
                <span>Plan Upgrade Required</span>
              </div>
              <DialogTitle className="text-xl font-bold text-white tracking-tight">
                {customTitle || info.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-300 mt-1.5 leading-relaxed">
                {customDescription || info.description}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Plan Cards Comparison */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pro Plan Card */}
            {!isPremiumExclusive && (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-cyan-500/20 hover:border-cyan-500/40 transition-all flex flex-col justify-between relative group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Pro Plan</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      Most Popular
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    ৳599<span className="text-xs text-gray-400 font-normal"> / month</span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs text-gray-300">
                    {info.proBenefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs h-9 shadow-lg shadow-cyan-500/20"
                  onClick={() => {
                    onClose();
                    window.location.href = "/checkout?plan=pro";
                  }}
                >
                  Get Pro — ৳599/mo
                </Button>
              </div>
            )}

            {/* Premium Plan Card */}
            <div
              className={`p-4 rounded-xl bg-gradient-to-b from-amber-500/[0.08] to-transparent border border-amber-500/30 hover:border-amber-500/50 transition-all flex flex-col justify-between relative ${
                isPremiumExclusive ? "sm:col-span-2" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    Premium Plan
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Unlimited Institutional
                  </span>
                </div>
                <div className="text-2xl font-black text-white">
                  ৳999<span className="text-xs text-gray-400 font-normal"> / month</span>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-gray-300">
                  {info.premiumBenefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                className="w-full mt-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-bold text-xs h-9 shadow-lg shadow-amber-500/20"
                onClick={() => {
                  onClose();
                  window.location.href = "/checkout?plan=premium";
                }}
              >
                Get Premium — ৳999/mo
              </Button>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-white/5">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Purchasing during trial adds <strong>5 Bonus Days</strong> (35 days total)
            </span>
            <button
              onClick={() => {
                onClose();
                window.location.href = "/#plans";
              }}
              className="text-cyan-400 hover:underline hover:text-cyan-300 transition-colors"
            >
              Compare All Plans →
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
