import { Link, useLocation } from "wouter";
import { Ticket } from "lucide-react";

export function FloatingSupportButton() {
  const [location] = useLocation();

  // Hide on /support page itself to avoid redundant button
  if (location === "/support") {
    return null;
  }

  return (
    <aside aria-label="Support Center Quick Access">
      <Link
        href="/support"
        aria-label="Open Support Center"
        title="Open Support Center"
        className="group fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center justify-center gap-2 rounded-full bg-[#081833] text-white shadow-lg shadow-sky-950/30 hover:shadow-xl hover:shadow-sky-500/20 hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 dark:shadow-sky-500/25 hover:scale-105 active:scale-95 transition-all duration-300 p-3 sm:px-4 sm:py-2.5 backdrop-blur-sm border border-sky-400/30 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
      >
        <div className="relative flex items-center justify-center">
          <Ticket className="size-6 sm:size-5 shrink-0 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          <span className="absolute -top-1 -right-1 size-2 rounded-full bg-emerald-400 ring-2 ring-[#081833] dark:ring-sky-500 animate-pulse" />
        </div>
        <span className="hidden sm:inline font-bold text-xs sm:text-sm tracking-wide drop-shadow-sm select-none">
          Support Center
        </span>
      </Link>
    </aside>
  );
}
