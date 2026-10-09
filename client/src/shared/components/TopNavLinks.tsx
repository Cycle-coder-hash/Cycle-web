import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

interface TopNavLinksProps {
  isBn?: boolean;
  copy?: {
    navRoadmap?: string;
    navStore?: string;
    navLeaderboard?: string;
    navSupport?: string;
  };
  mobile?: boolean;
  onItemClick?: () => void;
  className?: string;
}

export function TopNavLinks({
  isBn = false,
  copy,
  mobile = false,
  onItemClick,
  className = "",
}: TopNavLinksProps) {
  const [location] = useLocation();
  const [activeSection, setActiveSection] = useState<string>("");

  const labels = {
    roadmap: copy?.navRoadmap || (isBn ? "রোডম্যাপ" : "Roadmap"),
    store: copy?.navStore || (isBn ? "স্টোর" : "Store"),
    leaderboard: copy?.navLeaderboard || (isBn ? "লিডারবোর্ড" : "Leaderboard"),
    support: copy?.navSupport || (isBn ? "সাপোর্ট" : "Support"),
  };

  useEffect(() => {
    if (location !== "/") {
      setActiveSection("");
      return;
    }

    const updateActiveSection = () => {
      const hash = window.location.hash;
      if (hash === "#roadmap" || hash === "#store") {
        setActiveSection(hash.slice(1));
        return;
      }

      const roadmapEl = document.getElementById("roadmap");
      const storeEl = document.getElementById("store");
      const scrollY = window.scrollY;

      if (
        storeEl &&
        scrollY >= storeEl.offsetTop - 260 &&
        scrollY < storeEl.offsetTop + storeEl.offsetHeight - 120
      ) {
        setActiveSection("store");
      } else if (
        roadmapEl &&
        scrollY >= roadmapEl.offsetTop - 260 &&
        scrollY < roadmapEl.offsetTop + roadmapEl.offsetHeight - 120
      ) {
        setActiveSection("roadmap");
      } else {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("hashchange", updateActiveSection);
    updateActiveSection();

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("hashchange", updateActiveSection);
    };
  }, [location]);

  // Determine active states
  const isRoadmapActive = location === "/" && activeSection === "roadmap";
  const isStoreActive = location === "/" && activeSection === "store";
  const isLeaderboardActive = location === "/leaderboard";
  const isSupportActive = location === "/support";

  // Shared pill styling classes
  const desktopPillBase =
    "relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[14px] font-semibold tracking-[-0.01em] rounded-full transition-all duration-200 ease-out select-none border";
  const mobilePillBase =
    "relative flex items-center gap-2.5 px-4 py-2.5 text-[15px] font-semibold tracking-[-0.01em] rounded-xl transition-all duration-200 ease-out border";

  const pillBase = mobile ? mobilePillBase : desktopPillBase;

  // Inactive default style
  const inactiveSkyStyle =
    "border-transparent text-slate-600 hover:text-sky-600 hover:bg-slate-100 hover:border-slate-200/80 dark:text-slate-300 dark:hover:text-sky-300 dark:hover:bg-slate-800/70 dark:hover:border-slate-700/60 dark:hover:shadow-[0_0_12px_rgba(56,189,248,0.12)]";

  const inactiveAmberStyle =
    "border-transparent text-slate-600 hover:text-amber-600 hover:bg-slate-100 hover:border-slate-200/80 dark:text-slate-300 dark:hover:text-amber-300 dark:hover:bg-slate-800/70 dark:hover:border-slate-700/60 dark:hover:shadow-[0_0_12px_rgba(245,158,11,0.12)]";

  // Active state style
  const activeSkyStyle =
    "border-sky-500/35 bg-sky-500/10 text-sky-700 dark:border-sky-400/40 dark:bg-sky-400/15 dark:text-sky-300 font-bold shadow-xs dark:shadow-[0_0_12px_rgba(56,189,248,0.2)]";

  const activeAmberStyle =
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:border-amber-400/45 dark:bg-amber-400/15 dark:text-amber-300 font-bold shadow-xs dark:shadow-[0_0_12px_rgba(245,158,11,0.2)]";

  const roadmapHref = location === "/" ? "#roadmap" : "/#roadmap";
  const storeHref = location === "/" ? "#store" : "/#store";

  return (
    <nav
      className={
        mobile
          ? `flex flex-col gap-2 ${className}`
          : `hidden items-center gap-1.5 md:flex ${className}`
      }
      aria-label="Main Navigation"
    >
      {/* 1. Roadmap */}
      <a
        href={roadmapHref}
        onClick={onItemClick}
        className={`${pillBase} ${isRoadmapActive ? activeSkyStyle : inactiveSkyStyle}`}
      >
        <span>{labels.roadmap}</span>
      </a>

      {/* 2. Store */}
      <a
        href={storeHref}
        onClick={onItemClick}
        className={`${pillBase} ${isStoreActive ? activeSkyStyle : inactiveSkyStyle}`}
      >
        <span>{labels.store}</span>
      </a>

      {/* 3. 🏆 Leaderboard */}
      <Link
        href="/leaderboard"
        onClick={onItemClick}
        className={`${pillBase} ${isLeaderboardActive ? activeAmberStyle : inactiveAmberStyle}`}
      >
        <span className="text-[14px] leading-none shrink-0" aria-hidden="true">
          🏆
        </span>
        <span>{labels.leaderboard}</span>
      </Link>

      {/* 4. 🎫 Support */}
      <Link
        href="/support"
        onClick={onItemClick}
        className={`${pillBase} ${isSupportActive ? activeSkyStyle : inactiveSkyStyle}`}
      >
        <span className="text-[14px] leading-none shrink-0" aria-hidden="true">
          🎫
        </span>
        <span>{labels.support}</span>
      </Link>
    </nav>
  );
}

export default TopNavLinks;
