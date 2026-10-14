import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { HeaderBrandWordmark } from "@/components/HeaderBrandWordmark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TopNavLinks } from "@/components/TopNavLinks";
import { SupportChat } from "@/components/SupportChat";

export default function SupportPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isBn = language === "bn";

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#070e1b] text-slate-100 ${
        isBn ? "font-bangla" : ""
      }`}
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#070e1b]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <BrandLogo size={34} />
              <div className="flex flex-col">
                <HeaderBrandWordmark className="text-xs sm:text-sm" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-sky-400">
                  Direct Support
                </span>
              </div>
            </Link>
          </div>

          {/* Balanced navigation container */}
          <div className="hidden md:flex flex-1 items-center justify-center px-2 lg:px-6">
            <TopNavLinks isBn={isBn} />
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <LanguageSelector variant="compact" />

            {user ? (
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-slate-700 bg-slate-800/80 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white"
                >
                  <ArrowLeft size={14} />
                  <span className="hidden sm:inline">
                    {isBn ? "ড্যাশবোর্ড" : "Dashboard"}
                  </span>
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  className="bg-sky-500 text-slate-950 hover:bg-sky-400 font-bold text-xs px-3 h-8 sm:h-9 shadow-sm shadow-sky-500/20"
                >
                  Go Process
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Support Container */}
      <main className="flex-1 flex flex-col mx-auto w-full max-w-4xl p-3 sm:p-6">
        <SupportChat inline={false} />
      </main>
    </div>
  );
}
