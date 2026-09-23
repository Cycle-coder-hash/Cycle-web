import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <BrandLogo size={34} />
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-sky-400 transition-colors">
                  Cycle of Chart
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-sky-400">
                  Direct Support
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <LanguageSelector variant="compact" />

            <Link href={user ? "/dashboard" : "/login"}>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-slate-700 bg-slate-800/80 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">
                  {user ? (isBn ? "ড্যাশবোর্ড" : "Dashboard") : isBn ? "লগইন" : "Sign In"}
                </span>
              </Button>
            </Link>
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
