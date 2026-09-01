import React from "react";
import { ShieldCheck, ArrowUpRight, Bell, Sparkles } from "lucide-react";

interface AdminHeaderProps {
  currentTabTitle: string;
  adminName?: string;
  pendingCount?: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentTabTitle,
  adminName = "Admin",
  pendingCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-[#070e1b]/90 px-6 backdrop-blur-md">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-black text-white">{currentTabTitle}</h1>
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-400 border border-amber-500/30 animate-pulse">
              {pendingCount} PENDING REVIEWS
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="http://localhost:3000/dashboard"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition"
        >
          <span>Student App</span>
          <ArrowUpRight size={13} />
        </a>

        <div className="flex items-center gap-2.5 border-l border-slate-800 pl-4">
          <div className="flex size-8 items-center justify-center rounded-xl bg-sky-500 font-mono text-xs font-bold text-slate-950">
            {adminName[0].toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-extrabold text-white">{adminName}</div>
            <div className="text-[10px] text-sky-400 font-bold uppercase">SUPERADMIN</div>
          </div>
        </div>
      </div>
    </header>
  );
};
