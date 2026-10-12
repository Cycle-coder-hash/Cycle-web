import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { HeaderBrandWordmark } from "@/components/HeaderBrandWordmark";
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
      className={`min-h-screen flex flex-col bg-transparent text-white ${
        isBn ? "font-bangla" : ""
      }`}
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <BrandLogo size={34} />
              <div className="flex flex-col">
                <HeaderBrandWordmark className="text-xs sm:text-sm" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--glow-soft)]">
                  Direct Support
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <LanguageSelector variant="compact" />

            {user ? (
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-[var(--border-subtle)] bg-[var(--surface)] text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white"
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
                  className="btn-primary-glow font-bold text-xs px-3 h-8 sm:h-9"
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
