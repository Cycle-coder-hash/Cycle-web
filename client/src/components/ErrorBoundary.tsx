import React, { Component, ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6 text-slate-900 dark:bg-[#060d19] dark:text-slate-100 selection:bg-[#38bdf8]">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {/* Top Glow */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-400 via-emerald-400 to-rose-400" />

            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 shadow-inner">
              <ShieldAlert size={32} />
            </div>

            <h1 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Application Notice
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              একটি অপ্রত্যাশিত সমস্যা হয়েছে। পেজটি পুনরায় রিলোড করুন।
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="gap-2 bg-[#081833] font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
              >
                <RotateCcw size={16} />
                Reload Page / রিলোড
              </Button>

              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="gap-2 font-semibold border-slate-200 dark:border-slate-700"
              >
                <Home size={16} />
                Home
              </Button>
            </div>

            {/* Collapsible Error Trace for Developers */}
            <div className="mt-8 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {this.state.showDetails ? "Hide Technical Details ▲" : "View Technical Diagnostics ▼"}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 max-h-48 overflow-auto rounded-xl bg-slate-100 p-3 text-left font-mono text-xs text-rose-700 dark:bg-slate-950 dark:text-rose-400">
                  <div className="font-bold">{this.state.error?.message}</div>
                  <pre className="mt-2 whitespace-pre-wrap text-[11px] opacity-80">
                    {this.state.error?.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
