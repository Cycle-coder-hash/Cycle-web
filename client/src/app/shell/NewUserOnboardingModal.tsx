import React, { useState } from "react";
import { Sparkles, CheckCircle2, ArrowRight, Loader2, Compass, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface NewUserOnboardingModalProps {
  isOpen: boolean;
  userKey: string;
  onSuccess?: () => void;
}

const EXPERIENCE_OPTIONS = [
  { id: "Complete Beginner", label: "Complete Beginner", sublabel: "Just starting my trading journey" },
  { id: "6 Month+ Experience", label: "6 Month+ Experience", sublabel: "Learning charts & basic setups" },
  { id: "1 Year+ Experience", label: "1 Year+ Experience", sublabel: "Active trader with system experience" },
] as const;

const JOURNAL_OPTIONS = [
  { id: "Yes", label: "Yes", sublabel: "I actively log my trades" },
  { id: "No", label: "No", sublabel: "I haven't started journaling yet" },
] as const;

export const NewUserOnboardingModal: React.FC<NewUserOnboardingModalProps> = ({
  isOpen,
  userKey,
  onSuccess,
}) => {
  const { t, isRTL } = useLanguage();
  const [discoverySource, setDiscoverySource] = useState("");
  const [tradingExperience, setTradingExperience] = useState<string>("");
  const [keepsJournal, setKeepsJournal] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const utils = trpc.useUtils();
  const submitMutation = trpc.customer.submitOnboarding.useMutation();

  if (!isOpen) return null;

  const isFormValid =
    discoverySource.trim().length > 0 &&
    Boolean(tradingExperience) &&
    Boolean(keepsJournal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      await submitMutation.mutateAsync({
        discoverySource: discoverySource.trim(),
        tradingExperience: tradingExperience as any,
        keepsJournal: keepsJournal as any,
      });

      // Cache locally to instantly prevent any flash on navigation
      if (typeof window !== "undefined" && userKey) {
        try {
          localStorage.setItem(`cycle_onboarding_completed_${userKey}`, "true");
        } catch {}
      }

      await utils.customer.onboardingStatus.invalidate();

      toast.success("Profile saved! Redirecting to Store...");

      if (onSuccess) {
        onSuccess();
      }

      // Smooth automatic redirection to Store page
      setTimeout(() => {
        window.location.href = "/#store";
      }, 700);
    } catch (err: any) {
      console.error("[Onboarding submission failed]:", err);
      setErrorMsg(err.message || "Failed to save answers. Please try again.");
      toast.error(err.message || "Failed to save answers. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-[#020611]/85 backdrop-blur-md animate-in fade-in duration-300"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-xl my-auto rounded-2xl bg-gradient-to-b from-[#0a1529]/95 via-[#070e1e]/98 to-[#040814]/98 border border-cyan-500/25 p-5 sm:p-7 shadow-[0_20px_60px_-15px_rgba(2,6,23,0.95),0_0_35px_-5px_rgba(6,182,212,0.18)] transition-all">
        {/* Subtle Ambient Corner Glows */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-10 -mb-10" />
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="relative text-center mb-6">
          <div className="inline-flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-sky-500/10 border border-cyan-400/30 text-cyan-400 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <Compass className="size-6 text-cyan-400" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[11px] font-semibold text-cyan-300 mb-2">
            <Sparkles className="size-3 text-cyan-400" />
            <span>Welcome Trader • Quick Setup</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {t("onboarding.title")}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {t("onboarding.subtitle")}
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="relative space-y-5" dir={isRTL ? "rtl" : "ltr"}>
          {/* Question 1: Discovery Source */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200">
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center size-5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[11px] font-bold text-cyan-400">
                  1
                </span>
                {t("onboarding.q1")}
              </span>
              <span className="text-[11px] text-cyan-400/80 font-normal">Required</span>
            </label>
            <input
              type="text"
              value={discoverySource}
              onChange={(e) => setDiscoverySource(e.target.value)}
              placeholder={t("onboarding.q1Placeholder")}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712]/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Question 2: Trading Experience */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200">
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center size-5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[11px] font-bold text-cyan-400">
                  2
                </span>
                {t("onboarding.q2")}
              </span>
              <span className="text-[11px] text-cyan-400/80 font-normal">Select One</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {EXPERIENCE_OPTIONS.map((opt) => {
                const isSelected = tradingExperience === opt.id;
                const translatedLabel =
                  opt.id === "Complete Beginner"
                    ? t("onboarding.q2Opt1")
                    : opt.id === "6 Month+ Experience"
                    ? t("onboarding.q2Opt2")
                    : t("onboarding.q2Opt3");
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTradingExperience(opt.id)}
                    disabled={isSubmitting}
                    className={`relative p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-gradient-to-br from-cyan-950/40 via-[#07172e] to-[#040e1f] border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50"
                        : "bg-[#030712]/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-[#071224]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs sm:text-sm font-bold leading-tight">
                        {translatedLabel}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="size-4 text-cyan-400 shrink-0" />
                      ) : (
                        <div className="size-4 rounded-full border border-slate-700 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">
                      {opt.sublabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 3: Keeps Journal */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200">
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center size-5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[11px] font-bold text-cyan-400">
                  3
                </span>
                {t("onboarding.q3")}
              </span>
              <span className="text-[11px] text-cyan-400/80 font-normal">Select One</span>
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              {JOURNAL_OPTIONS.map((opt) => {
                const isSelected = keepsJournal === opt.id;
                const translatedLabel = opt.id === "Yes" ? t("onboarding.yes") : t("onboarding.no");
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setKeepsJournal(opt.id)}
                    disabled={isSubmitting}
                    className={`relative p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-gradient-to-br from-cyan-950/40 via-[#07172e] to-[#040e1f] border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50"
                        : "bg-[#030712]/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-[#071224]"
                    }`}
                  >
                    <div>
                      <span className="text-xs sm:text-sm font-bold block">
                        {translatedLabel}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-slate-400">
                        {opt.sublabel}
                      </span>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="size-4 text-cyan-400 shrink-0 ml-2" />
                    ) : (
                      <div className="size-4 rounded-full border border-slate-700 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 text-center">
              {errorMsg}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                isFormValid && !isSubmitting
                  ? "bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 text-slate-950 hover:brightness-110 shadow-[0_0_25px_rgba(6,182,212,0.35)] cursor-pointer"
                  : "bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{t("onboarding.saving")}</span>
                </>
              ) : (
                <>
                  <span>{t("onboarding.submit")}</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="size-3.5 text-cyan-500/70" />
              <span>Answers are permanently stored in your account. You will be redirected to Store.</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default NewUserOnboardingModal;
