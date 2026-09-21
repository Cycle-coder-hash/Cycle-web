import React from "react";
import { Link } from "wouter";
import { ArrowLeft, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onRefreshAll: () => void;
  isRefreshing?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onRefreshAll, isRefreshing }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#070e1b]/95 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="shrink-0">
            <BrandLogo size={40} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-[#0a192f] dark:text-white uppercase">
                Cycle of Chart
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                MASTER ADMIN ACCESS
              </span>
            </div>
            <div className="text-[10px] font-bold text-slate-400">
              Trading Operations, Payment Approvals & Live Database Registry
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onRefreshAll}
            disabled={isRefreshing}
            className="gap-1.5 text-xs font-bold border-slate-300 dark:border-slate-700"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Sync DB</span>
          </Button>

          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Student Dashboard</span>
              <span className="sm:hidden">Portal</span>
            </Button>
          </Link>

          <Link href="/">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400"
            >
              Public Site →
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
