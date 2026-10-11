import React from "react";
import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import { GrowthDataPoint, PeriodPnl } from "@/types/journal";

export interface JournalAnalyticsChartSectionProps {
  isBn: boolean;
  chartMode: "balance" | "growth" | "period";
  periodType: "daily" | "weekly" | "monthly";
  growthPoints: GrowthDataPoint[];
  periodPnlList: PeriodPnl[];
  currencySymbol: string;
  effectiveStartingBalance: number;
  onChangeChartMode: (mode: "balance" | "growth" | "period") => void;
  onChangePeriodType: (period: "daily" | "weekly" | "monthly") => void;
}

export function JournalAnalyticsChartSection({
  isBn,
  chartMode,
  periodType,
  growthPoints,
  periodPnlList,
  currencySymbol,
  effectiveStartingBalance,
  onChangeChartMode,
  onChangePeriodType,
}: JournalAnalyticsChartSectionProps) {
  return (
    /* PERFORMANCE ANALYTICS & GROWTH CURVE SECTION */
    <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-[#0a1529]/95 via-[#070e1e]/95 to-[#040814]/95 p-5 sm:p-6 lg:p-7 shadow-[0_12px_40px_-15px_rgba(2,6,23,0.85),0_0_25px_-5px_rgba(6,182,212,0.1)] relative overflow-hidden backdrop-blur-xl group/analytics-card transition-all duration-300 hover:border-cyan-500/35 hover:shadow-[0_16px_50px_-15px_rgba(2,6,23,0.95),0_0_35px_-5px_rgba(6,182,212,0.18)]">
      {/* Ambient Top Glow Highlights */}
      <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      {/* Section Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          {/* Polished Compact Icon Container with Ambient Cyan Glow */}
          <div className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-indigo-500/20 border border-cyan-500/35 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] shrink-0">
            <BarChart3 className="size-5 text-cyan-400" />
            <span className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-sm -z-10" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                {isBn ? "পারফরম্যান্স ও গ্রোথ কার্ভ" : "Performance Analytics & Growth Curve"}
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400 tracking-wider uppercase">
                <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {chartMode === "balance"
                  ? (isBn ? "ব্যালেন্স ট্র্যাজেক্টরি" : "Capital Trajectory")
                  : chartMode === "growth"
                  ? (isBn ? "ইকুইটি % রিটার্ন" : "Equity % Return")
                  : (isBn ? "পিরিয়ডিক P&L" : "Periodic P&L")}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium tracking-normal">
              {isBn
                ? "ক্যাপিটাল প্রবৃদ্ধি, ইকুইটি শতকরা রিটার্ন এবং পর্যায়ভিত্তিক P&L"
                : "Real-time balance trajectory & periodic returns"}
            </p>
          </div>
        </div>

        {/* Top-Right Segmented Filter / View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
          {/* Segmented Controller */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-[#030712]/90 border border-slate-800/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] backdrop-blur-md">
            {[
              { id: "balance", label: isBn ? "ব্যালেন্স কার্ভ" : "Balance Curve" },
              { id: "growth", label: isBn ? "গ্রোথ %" : "Growth %" },
              { id: "period", label: isBn ? "পিরিয়ড P&L" : "Period P&L" },
            ].map((tab) => {
              const isActive = chartMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChangeChartMode(tab.id as "balance" | "growth" | "period")}
                  className={`relative rounded-xl px-3 sm:px-3.5 py-1.5 text-xs font-bold transition-all duration-200 select-none ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-[0_0_16px_rgba(6,182,212,0.4)] scale-[1.02]"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Period sub-tabs */}
          {chartMode === "period" && (
            <div className="inline-flex items-center p-1 rounded-2xl bg-[#030712]/90 border border-slate-800/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] backdrop-blur-md animate-in fade-in duration-200">
              {(["daily", "weekly", "monthly"] as const).map((p) => {
                const isActive = periodType === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onChangePeriodType(p)}
                    className={`rounded-xl px-2.5 py-1 text-[11px] font-bold capitalize transition-all duration-150 select-none ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative z-10 mt-6 rounded-2xl border border-slate-800/80 bg-[#040814]/85 p-3 sm:p-4 lg:p-5 backdrop-blur-sm overflow-hidden shadow-inner">
        {/* Subtle depth lighting inside the chart area */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-cyan-500/5 via-blue-500/2 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/80 to-transparent" />

        <div className="h-64 sm:h-72 lg:h-80 w-full relative z-10">
          {growthPoints.length <= 1 && chartMode !== "period" ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-400 p-8 space-y-2">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-1 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
                <BarChart3 className="size-6 text-cyan-400" />
              </div>
              <p className="text-xs font-bold text-slate-200">
                {isBn ? "কোনো ট্রেড ডাটা পাওয়া যায়নি" : "No Equity Curve Data Available"}
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                {isBn
                  ? "গ্রোথ কার্ভ দেখার জন্য অন্তত একটি ট্রেড এন্ট্রি যোগ করুন।"
                  : "Log trades above to begin generating your equity progression curve."}
              </p>
            </div>
          ) : chartMode === "balance" ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthPoints} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="60%" stopColor="#0284c7" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.45} vertical={false} />
                <XAxis
                  dataKey="tradeNumber"
                  tickFormatter={(val) => (val === 0 ? "Start" : `#${val}`)}
                  stroke="#475569"
                  fontSize={11}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={{ stroke: "#1e293b" }}
                  tick={{ fill: "#64748b" }}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tickFormatter={(val) => `${currencySymbol}${Number(val).toLocaleString()}`}
                  stroke="#475569"
                  fontSize={11}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={{ stroke: "#1e293b" }}
                  tick={{ fill: "#64748b" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload as GrowthDataPoint;
                    return (
                      <div className="rounded-2xl border border-cyan-500/30 bg-[#070e1e]/95 p-3.5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-xl text-xs space-y-1.5 min-w-[180px]">
                        <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-slate-400">
                          <span>{data.tradeNumber === 0 ? "Initial Deposit" : `Trade #${data.tradeNumber}`}</span>
                          {data.pair && (
                            <span className="font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded text-[10px]">
                              {data.pair}
                            </span>
                          )}
                        </div>
                        <div className="text-base sm:text-lg font-black tracking-tight text-white flex items-baseline gap-1">
                          <span className="text-cyan-400">{currencySymbol}</span>
                          {data.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {data.tradeNumber > 0 && (
                          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-800/80 text-[11px] font-bold">
                            <span className={data.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}>
                              {data.pnl >= 0 ? `+${currencySymbol}${data.pnl.toLocaleString()}` : `-${currencySymbol}${Math.abs(data.pnl).toLocaleString()}`}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${data.equityGrowth >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                              {data.equityGrowth >= 0 ? `+${data.equityGrowth}%` : `${data.equityGrowth}%`}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={effectiveStartingBalance} stroke="#475569" strokeDasharray="3 3" strokeWidth={1} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#balanceGrad)"
                  dot={{ r: 3, fill: "#040814", stroke: "#06b6d4", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#06b6d4", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : chartMode === "growth" ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthPoints} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="60%" stopColor="#059669" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.45} vertical={false} />
                <XAxis
                  dataKey="tradeNumber"
                  tickFormatter={(val) => (val === 0 ? "Start" : `#${val}`)}
                  stroke="#475569"
                  fontSize={11}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={{ stroke: "#1e293b" }}
                  tick={{ fill: "#64748b" }}
                />
                <YAxis
                  tickFormatter={(val) => `${val}%`}
                  stroke="#475569"
                  fontSize={11}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={{ stroke: "#1e293b" }}
                  tick={{ fill: "#64748b" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload as GrowthDataPoint;
                    return (
                      <div className="rounded-2xl border border-emerald-500/30 bg-[#070e1e]/95 p-3.5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-xl text-xs space-y-1.5 min-w-[180px]">
                        <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-slate-400">
                          <span>{data.tradeNumber === 0 ? "Baseline Initial" : `Trade #${data.tradeNumber}`}</span>
                          {data.pair && (
                            <span className="font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                              {data.pair}
                            </span>
                          )}
                        </div>
                        <div className={`text-base sm:text-lg font-black tracking-tight ${data.equityGrowth >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {data.equityGrowth >= 0 ? `+${data.equityGrowth}%` : `${data.equityGrowth}%`}
                        </div>
                        <div className="text-[11px] font-mono text-slate-300 pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-slate-400">Balance:</span>
                          <span className="text-white font-bold">{currencySymbol}{data.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" strokeWidth={1} />
                <Area
                  type="monotone"
                  dataKey="equityGrowth"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#growthGrad)"
                  dot={{ r: 3, fill: "#040814", stroke: "#10b981", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            /* Period PnL Bar Chart */
            periodPnlList.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-400 p-8 space-y-2">
                <p className="text-xs font-semibold text-slate-400">No period data recorded yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodPnlList} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="posBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.75} />
                    </linearGradient>
                    <linearGradient id="negBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#be123c" stopOpacity={0.75} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.45} vertical={false} />
                  <XAxis
                    dataKey="period"
                    stroke="#475569"
                    fontSize={11}
                    fontWeight={500}
                    tickLine={false}
                    axisLine={{ stroke: "#1e293b" }}
                    tick={{ fill: "#64748b" }}
                  />
                  <YAxis
                    tickFormatter={(val) => `${currencySymbol}${Number(val).toLocaleString()}`}
                    stroke="#475569"
                    fontSize={11}
                    fontWeight={500}
                    tickLine={false}
                    axisLine={{ stroke: "#1e293b" }}
                    tick={{ fill: "#64748b" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload as PeriodPnl;
                      return (
                        <div className="rounded-2xl border border-slate-700 bg-[#070e1e]/95 p-3.5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] backdrop-blur-xl text-xs space-y-1.5 min-w-[170px]">
                          <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">{data.period}</div>
                          <div className={`text-base sm:text-lg font-black tracking-tight ${data.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {data.pnl >= 0 ? `+${currencySymbol}${data.pnl.toLocaleString()}` : `-${currencySymbol}${Math.abs(data.pnl).toLocaleString()}`}
                          </div>
                          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                            <span>{data.trades} Trades</span>
                            <span className="font-bold text-slate-300">
                              <span className="text-emerald-400">{data.wins}W</span> / <span className="text-rose-400">{data.losses}L</span>
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" strokeWidth={1} />
                  <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                    {periodPnlList.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.pnl >= 0 ? "url(#posBarGrad)" : "url(#negBarGrad)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          )}
        </div>
      </div>
    </div>
  );
}
