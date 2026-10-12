import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Loader2, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface ClaimFreePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess?: () => void | Promise<void>;
  source?: "journal" | "notebook" | "store" | "dashboard";
}

export function ClaimFreePlanModal({
  isOpen,
  onClose,
  onClaimSuccess,
}: ClaimFreePlanModalProps) {
  const utils = trpc.useUtils();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const claimMutation = trpc.subscription.claimFreePlan.useMutation({
    onSuccess: async (result) => {
      setErrorMsg(null);
      await Promise.all([
        utils.subscription.getMySubscription.invalidate(),
        utils.subscription.getMyUsage.invalidate(),
      ]);
      if (result.alreadyClaimed) {
        toast.success("Your 20-day Free Trial is already active.");
      } else {
        toast.success("20-day Free Plan claimed! Your trial is now active.");
      }
      onClose();
      if (onClaimSuccess) {
        await onClaimSuccess();
      }
    },
    onError: (err) => {
      const message = err?.message || "Failed to claim Free Plan. Please try again.";
      setErrorMsg(message);
      toast.error(message);
    },
  });

  const handleConfirmClaim = () => {
    if (claimMutation.isPending) return;
    setErrorMsg(null);
    claimMutation.mutate();
  };

  const handleCancel = () => {
    if (claimMutation.isPending) return;
    setErrorMsg(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-[#0b162a] border border-cyan-500/30 text-white shadow-2xl">
        {/* Top Header Glow */}
        <div className="p-6 bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-transparent border-b border-slate-800/80 relative">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 mb-2">
                <Clock className="w-3 h-3" />
                <span>20-Day Free Trial</span>
              </div>
              <DialogHeader className="text-left space-y-1.5">
                <DialogTitle className="text-xl font-black text-white tracking-tight">
                  Claim Your Free Plan
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Activate your 20-day Free Trial to start using the available Journal and Private Trader Notebook features. Your trial begins only after you confirm your claim.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800/90 p-4 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Included in Your 20-Day Free Trial
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong className="text-white">Unlimited Trade Entries</strong> & 1 Dedicated Journal Book
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong className="text-white">Private Trader Notebook</strong> Templates, Notes & Pages
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong className="text-white">Full 20-Day Countdown</strong> starts at the exact moment you claim
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong className="text-white">+5 Bonus Days</strong> if you upgrade to Pro or Premium during trial
                </span>
              </li>
            </ul>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={claimMutation.isPending}
              className="w-full sm:w-auto border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-bold h-10 px-5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmClaim}
              disabled={claimMutation.isPending}
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs h-10 px-6 shadow-lg shadow-cyan-500/25"
            >
              {claimMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Claim Free Plan
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
