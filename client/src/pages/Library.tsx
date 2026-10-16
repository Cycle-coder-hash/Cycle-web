import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Sun,
  Moon,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { FreePdfsView } from "@/features/library/components/FreePdfsView";
import { CourseAlbumView } from "@/features/library/components/CourseAlbumView";
import { HeaderBrandWordmark } from "@/components/HeaderBrandWordmark";
import { Button } from "@/components/ui/button";

export default function Library() {
  const { language, setLanguage, selectText } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  const [activeTab, setActiveTab] = useState<"free-pdfs" | "basic-to-advance" | "cycle-blueprint">("free-pdfs");

  // Read URL query param on mount (e.g. /library?course=basic-to-advance)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get("tab") || searchParams.get("course");
      if (tabParam === "basic-to-advance" || tabParam === "basic") {
        setActiveTab("basic-to-advance");
      } else if (tabParam === "cycle-blueprint" || tabParam === "blueprint" || tabParam === "pro") {
        setActiveTab("cycle-blueprint");
      } else if (tabParam === "free" || tabParam === "pdfs" || tabParam === "free-pdfs") {
        setActiveTab("free-pdfs");
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 transition-colors duration-200 dark:bg-[#030712] dark:text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#030712]/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <HeaderBrandWordmark />
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Language Selector */}
            <div className="flex items-center rounded-xl border border-slate-200 p-0.5 dark:border-slate-800">
              {(["en", "bn"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`rounded-lg px-2 py-1 text-xs font-bold transition-all ${
                    language === lang
                      ? "bg-[#0284c7] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Back to Home / Dashboard Button */}
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-slate-200 text-xs font-bold dark:border-slate-800"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Title Header */}
        <div className="text-center sm:text-left space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3.5 py-1 text-xs font-black tracking-wider text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
            <ShieldCheck size={14} />
            <span>CYCLE OF CHART LEARNING HUB</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {selectText({
              en: "Library & Video Masterclasses",
              bn: "লাইব্রেরি ও ভিডিও মাস্টারক্লাস",
              ur: "لائبریری اور ویڈیو ماسٹر کلاسز",
            })}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {selectText({
              en: "Access institutional trading guides, cheat-sheets, and complete video lessons for Candle Range Theory (CRT), Liquidity Sweeps, and Algorithmic Cycle Execution.",
              bn: "ক্যান্ডেল রেঞ্জ থিওরি (CRT), লিকুইডিটি ও প্রাতিষ্ঠানিক অ্যালগরিদমিক সাইকেল এক্সিকিউশনের সব গাইড এবং সম্পূর্ণ ভিডিও ক্লাস।",
              ur: "ادارہ جاتی ٹریڈنگ گائیڈز اور مکمل ویڈیو اسباق تک رسائی حاصل کریں۔",
            })}
          </p>
        </div>

        {/* 3 Main Tab Selectors */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("free-pdfs")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-black transition-all ${
              activeTab === "free-pdfs"
                ? "bg-[#0284c7] text-white shadow-md shadow-sky-500/20 scale-[1.02]"
                : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <BookOpen size={18} />
            <span>{selectText({ en: "Free PDF Resources", bn: "ফ্রি পিডিএফ রিসোর্স", ur: "مفت پی ڈی ایف" })}</span>
          </button>

          <button
            onClick={() => setActiveTab("basic-to-advance")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-black transition-all ${
              activeTab === "basic-to-advance"
                ? "bg-[#0284c7] text-white shadow-md shadow-sky-500/20 scale-[1.02]"
                : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <GraduationCap size={18} />
            <span>{selectText({ en: "Basic to Advance (৳2,499)", bn: "বেসিক টু অ্যাডভান্স (৳২,৪৯৯)", ur: "بیسک ٹو ایڈوانس" })}</span>
          </button>

          <button
            onClick={() => setActiveTab("cycle-blueprint")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-black transition-all ${
              activeTab === "cycle-blueprint"
                ? "bg-[#0284c7] text-white shadow-md shadow-sky-500/20 scale-[1.02]"
                : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Sparkles size={18} />
            <span>{selectText({ en: "Cycle Blueprint (৳4,999)", bn: "সাইকেল ব্লুপ্রিন্ট (৳৪,৯৯৯)", ur: "سائیکل بلیو پرنٹ" })}</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === "free-pdfs" && <FreePdfsView />}
        {activeTab === "basic-to-advance" && <CourseAlbumView courseId="basic-to-advance" />}
        {activeTab === "cycle-blueprint" && <CourseAlbumView courseId="cycle-blueprint" />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-[#030712] text-center text-xs text-slate-500 dark:text-slate-400">
        <p>(C) {new Date().getFullYear()} Cycle of Chart — Trading Reality. All rights reserved.</p>
      </footer>
    </div>
  );
}
