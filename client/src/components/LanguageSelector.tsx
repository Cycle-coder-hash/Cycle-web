import React, { useState, useRef, useEffect, useMemo } from "react";
import { Globe, ChevronDown, Check, Search, X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { CountryLanguageOption } from "../i18n/types";

interface LanguageSelectorProps {
  className?: string;
  variant?: "default" | "compact" | "footer";
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = "",
  variant = "default",
}) => {
  const { currentOption, setCountryLanguage, allOptions, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto-focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return allOptions;
    const q = searchQuery.toLowerCase().trim();
    return allOptions.filter(
      (opt) =>
        opt.countryName.toLowerCase().includes(q) ||
        opt.langName.toLowerCase().includes(q) ||
        opt.nativeName.toLowerCase().includes(q)
    );
  }, [allOptions, searchQuery]);

  const handleSelect = (e: React.MouseEvent, option: CountryLanguageOption) => {
    e.preventDefault();
    e.stopPropagation();
    setCountryLanguage(option.id);
    setTimeout(() => {
      setIsOpen(false);
      setSearchQuery("");
    }, 50);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
          isOpen
            ? "border-[#2563eb] bg-white text-[#1d4ed8] shadow-[0_0_15px_rgba(37,99,235,0.15)] dark:border-cyan-500/60 dark:bg-[#0d1b33] dark:text-cyan-300 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            : "border-[rgba(37,99,235,0.25)] bg-[rgba(255,255,255,0.85)] hover:bg-white text-slate-800 dark:border-slate-700/80 dark:hover:border-cyan-500/40 dark:bg-[#0a1324]/90 dark:hover:bg-[#0e1c36] dark:text-slate-200"
        } ${
          variant === "compact"
            ? "text-xs py-1 px-2"
            : variant === "footer"
            ? "text-xs py-1.5 px-3 bg-slate-100/90 border-slate-300/80 text-slate-800 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-200"
            : "text-xs sm:text-sm"
        }`}
      >
        <span className="text-base sm:text-lg leading-none shrink-0" role="img" aria-label={currentOption.countryName}>
          {currentOption.flag}
        </span>
        <span className="font-semibold tracking-wide truncate max-w-[90px] sm:max-w-[120px]">
          {variant === "compact" ? currentOption.langCode.toUpperCase() : currentOption.nativeName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 group-hover:text-[#2563eb] dark:text-slate-400 dark:group-hover:text-cyan-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-[#2563eb] dark:text-cyan-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Transparent fixed backdrop to prevent click bleed-through to underlying CTAs/links */}
          <div
            className="fixed inset-0 z-[90] bg-transparent"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
            }}
            aria-hidden="true"
          />

          <div
            dir={isRTL ? "rtl" : "ltr"}
            onClick={(e) => e.stopPropagation()}
            className={`absolute mt-2 w-72 sm:w-80 rounded-2xl bg-white/95 text-slate-900 border border-[rgba(37,99,235,0.22)] shadow-[0_16px_40px_rgba(37,99,235,0.12)] backdrop-blur-xl dark:bg-[#091122]/95 dark:text-white dark:border-cyan-500/30 dark:shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(6,182,212,0.1)] z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
              isRTL ? "left-0" : "right-0"
            }`}
          >
            {/* Header & Search */}
            <div className="p-3 border-b border-slate-200/90 bg-slate-50/90 dark:border-slate-800/80 dark:bg-[#0b152b]">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0284c7] dark:text-cyan-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  Select Country & Language
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{allOptions.length} Languages</span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 left-2.5 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search country or language..."
                  className="w-full bg-white border border-slate-300 focus:border-[#2563eb] rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/40 dark:bg-[#050b16] dark:border-slate-700/80 dark:focus:border-cyan-500/70 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:ring-cyan-500/40 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSearchQuery("");
                    }}
                    className="absolute top-1/2 -translate-y-1/2 right-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40 py-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {filteredOptions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  No matching country or language found.
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.id === currentOption.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={(e) => handleSelect(e, opt)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors cursor-pointer group ${
                        isSelected
                          ? "bg-blue-500/10 text-[#1d4ed8] font-medium dark:bg-cyan-500/15 dark:text-cyan-200"
                          : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[#101d38] dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0 leading-none" role="img" aria-label={opt.countryName}>
                          {opt.flag}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-semibold truncate flex items-center gap-1.5">
                            <span>{opt.nativeName}</span>
                            {opt.dir === "rtl" && (
                              <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono">
                                RTL
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-[#0284c7] dark:group-hover:text-cyan-400/80 truncate">
                            {opt.langName} · {opt.countryName}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/40 text-[#2563eb] dark:bg-cyan-500/20 dark:border-cyan-400/50 flex items-center justify-center shrink-0 dark:text-cyan-300">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
