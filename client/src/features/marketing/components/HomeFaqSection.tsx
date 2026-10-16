import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export interface HomeFaqItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * Easy-to-update list of Frequently Asked Questions for the Home Page.
 */
export const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    id: "what-is-cycle-of-chart",
    question: "1. What is Cycle of Chart?",
    answer:
      "Cycle of Chart is a trading education platform focused on market understanding, trading knowledge, risk management, and disciplined execution.",
  },
  {
    id: "trading-signals",
    question: "2. Does Cycle of Chart provide trading signals?",
    answer:
      "Cycle of Chart focuses on education, analysis, and disciplined trading rather than dependence on trading signals.",
  },
  {
    id: "who-can-learn",
    question: "3. Who can learn from Cycle of Chart?",
    answer:
      "Beginners and developing traders who want to improve their market knowledge and trading process can explore the available learning resources.",
  },
  {
    id: "learning-materials",
    question: "4. What learning materials are available?",
    answer:
      "Depending on the products currently available, users can explore trading courses, PDF materials, journals, and discipline tools.",
  },
  {
    id: "how-to-purchase",
    question: "5. How can I purchase a course or product?",
    answer:
      "Visit the Store, select an available product, and follow the existing checkout and payment instructions.",
  },
  {
    id: "when-receive-product",
    question: "6. When will I receive my purchased product?",
    answer:
      "Access is provided according to the existing payment verification and approval process.",
  },
  {
    id: "track-trading-performance",
    question: "7. Can I track my trading performance?",
    answer:
      "The available trading journal and dashboard features help users record trades and review their trading process.",
  },
  {
    id: "guarantee-profits",
    question: "8. Does Cycle of Chart guarantee profits?",
    answer:
      "No. Trading involves financial risk, and educational materials cannot guarantee profits or eliminate losses.",
  },
  {
    id: "need-account",
    question: "9. Do I need an account to access all features?",
    answer:
      "Some features require registration and login. Access depends on the existing rules for each feature.",
  },
  {
    id: "contact-support",
    question: "10. How can I contact support?",
    answer:
      "Use the existing Support section to send a message and receive assistance.",
  },
];

export const HomeFaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      aria-labelledby="home-faq-heading"
      className="relative py-12 sm:py-20 lg:py-24 text-slate-900 dark:text-white bg-[#f8fafc] dark:bg-[#070e1b] overflow-hidden transition-colors"
    >
      {/* Subtle atmospheric ambient glow matching Home Page sections */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none dark:bg-sky-500/[0.06]" />
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none dark:bg-cyan-400/[0.05]" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-5 lg:px-8 z-10">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/25 bg-sky-500/10 px-3.5 py-1 text-[10px] sm:text-xs font-extrabold uppercase tracking-[.2em] text-[#0284c7] dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-[#38bdf8]">
            <HelpCircle className="size-3.5 shrink-0" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2
            id="home-faq-heading"
            className="mt-3 sm:mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-2 sm:mt-3 text-xs sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Clear answers about Cycle of Chart’s trading education, learning resources, journals, and platform access.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3 sm:space-y-4">
          {HOME_FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            const panelId = `faq-panel-${item.id}`;
            const buttonId = `faq-btn-${item.id}`;

            return (
              <div
                key={item.id}
                className={`group rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? "border-sky-500/60 bg-white shadow-lg shadow-sky-500/[0.08] dark:border-sky-400/50 dark:bg-[#0c182c] dark:shadow-sky-950/40"
                    : "border-slate-200/90 bg-white/85 hover:border-sky-400/50 hover:bg-white dark:border-slate-800/90 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-900/90"
                }`}
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(item.id)}
                    className="flex w-full items-center justify-between gap-3 sm:gap-4 px-4 py-3.5 sm:px-6 sm:py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-xl sm:rounded-2xl cursor-pointer"
                  >
                    <span
                      className={`text-sm sm:text-base lg:text-lg font-bold tracking-tight transition-colors ${
                        isOpen
                          ? "text-[#0284c7] dark:text-[#38bdf8]"
                          : "text-slate-900 group-hover:text-[#0284c7] dark:text-white dark:group-hover:text-sky-300"
                      }`}
                    >
                      {item.question}
                    </span>

                    <span
                      aria-hidden="true"
                      className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? "rotate-180 border-sky-500/40 bg-sky-500/15 text-[#0284c7] dark:border-sky-400/40 dark:bg-sky-400/20 dark:text-[#38bdf8]"
                          : "border-slate-200/80 bg-slate-100/80 text-slate-500 group-hover:border-sky-400/40 group-hover:text-sky-600 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-400 dark:group-hover:text-sky-300"
                      }`}
                    >
                      <ChevronDown className="size-4 sm:size-[18px]" />
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 sm:px-6 sm:pb-5 pt-0.5 text-xs sm:text-sm lg:text-base leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 mt-0.5 pt-3 sm:pt-3.5">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
