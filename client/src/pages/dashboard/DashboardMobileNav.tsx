import { Link } from "wouter";
import {
  BookMarked,
  BookOpen,
  Calculator,
  ClipboardCheck,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  NotebookPen,
  Receipt,
  Send,
  Settings as SettingsIcon,
  Sparkles,
  Sun,
  Trophy,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSelector } from "@/components/LanguageSelector";

export type DashboardTab =
  | "overview"
  | "roadmap"
  | "library"
  | "journal"
  | "notebook"
  | "discipline"
  | "calculator"
  | "orders"
  | "support";

export interface DashboardMobileNavProps {
  tab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  isBn: boolean;
  isMobileMoreOpen: boolean;
  onToggleDrawer: () => void;
  onCloseDrawer: () => void;
  hasJournalActivity: boolean;
  completedStagesCount: number;
  entitlementsCount: number;
  ordersCount: number;
  unreadSupportCount: number;
  hasApprovedPurchase: boolean;
  theme: string;
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenTelegramModal?: () => void;
}

export function DashboardMobileNav({
  tab,
  onSelectTab,
  isBn,
  isMobileMoreOpen,
  onToggleDrawer,
  onCloseDrawer,
  hasJournalActivity,
  completedStagesCount,
  entitlementsCount,
  ordersCount,
  unreadSupportCount,
  hasApprovedPurchase,
  theme,
  onToggleTheme,
  onLogout,
  onOpenTelegramModal,
}: DashboardMobileNavProps) {
  const handleOpenTelegram = () => {
    onCloseDrawer();
    if (onOpenTelegramModal) {
      onOpenTelegramModal();
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-telegram-modal"));
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* MOBILE FIXED BOTTOM NAVIGATION BAR */}
      {/* ========================================================================= */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#070e1b]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl safe-bottom"
      >
        <div className="flex items-center justify-around px-1.5 py-1.5">
          {/* 1. Overview */}
          <button
            type="button"
            onClick={() => {
              onSelectTab("overview");
              onCloseDrawer();
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
              tab === "overview" && !isMobileMoreOpen
                ? "text-sky-400 font-extrabold"
                : "text-slate-400 hover:text-slate-200 font-medium"
            }`}
          >
            <LayoutDashboard
              size={19}
              className={tab === "overview" && !isMobileMoreOpen ? "text-sky-400 scale-105" : "text-slate-400"}
            />
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
              {isBn ? "ওভারভিউ" : "Overview"}
            </span>
          </button>

          {/* 2. Trade Journal */}
          <button
            type="button"
            onClick={() => {
              onSelectTab("journal");
              onCloseDrawer();
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] relative ${
              tab === "journal" && !isMobileMoreOpen
                ? "text-sky-400 font-extrabold"
                : "text-slate-400 hover:text-slate-200 font-medium"
            }`}
          >
            <NotebookPen
              size={19}
              className={tab === "journal" && !isMobileMoreOpen ? "text-sky-400 scale-105" : "text-slate-400"}
            />
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
              {isBn ? "জার্নাল" : "Journal"}
            </span>
            {hasJournalActivity && (
              <span className="absolute top-1 right-2.5 size-2 rounded-full bg-sky-500 ring-2 ring-[#070e1b]" />
            )}
          </button>

          {/* 3. Daily Routine */}
          <button
            type="button"
            onClick={() => {
              onSelectTab("discipline");
              onCloseDrawer();
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
              tab === "discipline" && !isMobileMoreOpen
                ? "text-sky-400 font-extrabold"
                : "text-slate-400 hover:text-slate-200 font-medium"
            }`}
          >
            <ClipboardCheck
              size={19}
              className={tab === "discipline" && !isMobileMoreOpen ? "text-sky-400 scale-105" : "text-slate-400"}
            />
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
              {isBn ? "রুটিন" : "Routine"}
            </span>
          </button>

          {/* 4. Global Leaderboard */}
          <Link
            href="/leaderboard"
            onClick={onCloseDrawer}
            className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] text-amber-400/90 hover:text-amber-300 font-medium"
          >
            <Trophy size={19} className="text-amber-400" />
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
              {isBn ? "র‍্যাঙ্ক" : "Rank"}
            </span>
          </Link>

          {/* 5. More Sections Drawer Trigger */}
          <button
            type="button"
            onClick={onToggleDrawer}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
              isMobileMoreOpen || !["overview", "journal", "discipline"].includes(tab)
                ? "text-sky-400 font-extrabold"
                : "text-slate-400 hover:text-slate-200 font-medium"
            }`}
          >
            <Menu
              size={19}
              className={
                isMobileMoreOpen ? "text-sky-400 rotate-90 transition-transform" : "text-slate-400 transition-transform"
              }
            />
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
              {isBn ? "মেনু" : "More"}
            </span>
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* MOBILE "MORE" BOTTOM DRAWER */}
      {/* ========================================================================= */}
      {isMobileMoreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={onCloseDrawer}
            className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Bottom Sheet */}
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-slate-800 bg-[#0b162a] p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto pb-8 safe-bottom">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BrandLogo size={24} />
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  {isBn ? "সকল সেকশন ও টুলস" : "All Sections & Tools"}
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseDrawer}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* 12-Stage Roadmap */}
              <button
                type="button"
                onClick={() => {
                  onSelectTab("roadmap");
                  onCloseDrawer();
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                  tab === "roadmap"
                    ? "border-sky-500/50 bg-sky-500/15 text-sky-400"
                    : "border-slate-800/80 bg-slate-900/70 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="size-9 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0 text-sky-400">
                  <Layers size={18} />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-extrabold">{isBn ? "১২-স্টেজ রোডম্যাপ" : "Roadmap"}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{completedStagesCount}/12 completed</div>
                </div>
              </button>

              {/* My Library */}
              <button
                type="button"
                onClick={() => {
                  onSelectTab("library");
                  onCloseDrawer();
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                  tab === "library"
                    ? "border-sky-500/50 bg-sky-500/15 text-sky-400"
                    : "border-slate-800/80 bg-slate-900/70 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="size-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 text-purple-400">
                  <BookOpen size={18} />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-extrabold">{isBn ? "আমার লাইব্রেরি" : "My Library"}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{entitlementsCount} active</div>
                </div>
              </button>

              {/* Private Trader Notebook */}
              <button
                type="button"
                onClick={() => {
                  onSelectTab("notebook");
                  onCloseDrawer();
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                  tab === "notebook"
                    ? "border-sky-500/50 bg-sky-500/15 text-sky-400"
                    : "border-slate-800/80 bg-slate-900/70 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="size-9 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0 text-cyan-400">
                  <BookMarked size={18} />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-extrabold">{isBn ? "প্রাইভেট ট্রেডার নোটবুক" : "Private Trader Notebook"}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{isBn ? "নোট ও প্লেবুক ভল্ট" : "Strategy Vault"}</div>
                </div>
              </button>

              {/* Position Calculator */}
              <button
                type="button"
                onClick={() => {
                  onSelectTab("calculator");
                  onCloseDrawer();
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                  tab === "calculator"
                    ? "border-sky-500/50 bg-sky-500/15 text-sky-400"
                    : "border-slate-800/80 bg-slate-900/70 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="size-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-400">
                  <Calculator size={18} />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-extrabold">{isBn ? "ক্যালকুলেটর" : "Calculator"}</div>
                  <div className="text-[10px] text-slate-400 font-normal">Risk & Sizing</div>
                </div>
              </button>

              {/* Payment History / Orders */}
              <button
                type="button"
                onClick={() => {
                  onSelectTab("orders");
                  onCloseDrawer();
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                  tab === "orders"
                    ? "border-sky-500/50 bg-sky-500/15 text-sky-400"
                    : "border-slate-800/80 bg-slate-900/70 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="size-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-400">
                  <Receipt size={18} />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-extrabold">{isBn ? "পেমেন্ট হিস্ট্রি" : "Orders"}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{ordersCount} orders</div>
                </div>
              </button>

              {/* Support Chat */}
              <button
                type="button"
                onClick={() => {
                  onSelectTab("support");
                  onCloseDrawer();
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                  tab === "support"
                    ? "border-sky-500/50 bg-sky-500/15 text-sky-400"
                    : "border-slate-800/80 bg-slate-900/70 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="size-9 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0 text-sky-400">
                  <MessageSquare size={18} />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-extrabold">{isBn ? "সাপোর্ট চ্যাট" : "Support"}</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {unreadSupportCount > 0 ? `${unreadSupportCount} unread` : "Helpdesk"}
                  </div>
                </div>
              </button>

              {/* VIP Telegram */}
              {hasApprovedPurchase && (
                <button
                  type="button"
                  onClick={handleOpenTelegram}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-sky-500/30 bg-sky-500/10 text-left text-xs font-bold text-sky-400 hover:bg-sky-500/20 transition-all cursor-pointer"
                >
                  <div className="size-9 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0 text-sky-300">
                    <Send size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-extrabold">{isBn ? "টেলিগ্রাম ভিআইপি" : "Telegram VIP"}</div>
                    <div className="text-[10px] text-sky-400/70 font-normal">Community</div>
                  </div>
                </button>
              )}

              {/* Store Browse */}
              <Link
                href="/#store"
                onClick={onCloseDrawer}
                className="flex items-center gap-3 p-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 text-left text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all"
              >
                <div className="size-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-400">
                  <Sparkles size={18} />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-extrabold">{isBn ? "ব্রাউজ স্টোর" : "Browse Store"}</div>
                  <div className="text-[10px] text-slate-400 font-normal">Books & Packages</div>
                </div>
              </Link>

              {/* Settings */}
              <Link
                href="/settings"
                onClick={onCloseDrawer}
                className="flex items-center gap-3 p-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 text-left text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all"
              >
                <div className="size-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-slate-300">
                  <SettingsIcon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-extrabold">{isBn ? "অ্যাকাউন্ট সেটিংস" : "Settings"}</div>
                  <div className="text-[10px] text-slate-400 font-normal">Security & Pass</div>
                </div>
              </Link>
            </div>

            {/* Quick Actions Footer inside Drawer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="flex size-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-yellow-400 cursor-pointer"
                  title="Toggle theme"
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <LanguageSelector />
              </div>

              <button
                type="button"
                onClick={() => {
                  onCloseDrawer();
                  onLogout();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-900/40 bg-rose-950/20 text-xs font-bold text-rose-400 hover:bg-rose-950/40 cursor-pointer"
              >
                <LogOut size={14} />
                <span>{isBn ? "লগআউট" : "Sign Out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
