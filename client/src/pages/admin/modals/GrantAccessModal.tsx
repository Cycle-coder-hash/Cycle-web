import React from "react";
import { X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GrantAccessModalProps {
  user: any | null;
  onClose: () => void;
  onGrantAccess: (userId: number, scope: string, bundleId: number) => void;
  isPending?: boolean;
  selectedBundleId: number;
  setSelectedBundleId: (id: number) => void;
  grantScope: string;
  setGrantScope: (scope: string) => void;
}

export const GrantAccessModal: React.FC<GrantAccessModalProps> = ({
  user,
  onClose,
  onGrantAccess,
  isPending,
  selectedBundleId,
  setSelectedBundleId,
  grantScope,
  setGrantScope,
}) => {
  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h3 className="text-base font-extrabold">Grant Access to {user.name || user.email}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <p className="text-slate-500">
            Select the package or digital product to unlock for this student:
          </p>

          <select
            value={selectedBundleId}
            onChange={(e) => {
              const id = parseInt(e.target.value);
              setSelectedBundleId(id);
              setGrantScope(
                id === 3
                  ? "bundle:3 (Master Full Bundle)"
                  : id === 2
                  ? "bundle:2 (Course + eBook)"
                  : "bundle:1 (15-PDF Package)"
              );
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
          >
            <option value={3}>Master Full Bundle (All 15 PDFs + Course + eBook)</option>
            <option value={2}>Course + Free Institutional eBook</option>
            <option value={1}>15-PDF Institutional Library Package</option>
          </select>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-1/2 border-slate-300 dark:border-slate-700 font-bold"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={() => {
                onGrantAccess(user.id, grantScope, selectedBundleId);
              }}
              className="w-1/2 bg-emerald-600 text-white font-bold hover:bg-emerald-700"
            >
              {isPending && <RefreshCw size={13} className="animate-spin mr-1.5" />}
              <span>Grant Access</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
