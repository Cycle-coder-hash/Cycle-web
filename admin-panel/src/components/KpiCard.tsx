import React from "react";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "sky" | "amber" | "emerald" | "default";
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}) => {
  const variantStyles = {
    sky: "bg-gradient-to-br from-[#081833] to-[#0f2c59] text-white border-sky-500/20 shadow-sky-500/10",
    amber: "bg-amber-950/20 border-amber-500/30 text-amber-200",
    emerald: "bg-emerald-950/20 border-emerald-500/30 text-emerald-200",
    default: "bg-slate-900/80 border-slate-800 text-slate-100",
  };

  const iconColors = {
    sky: "text-sky-400",
    amber: "text-amber-400",
    emerald: "text-emerald-400",
    default: "text-slate-400",
  };

  return (
    <div className={`rounded-3xl border p-6 shadow-xl ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">{title}</span>
        <Icon size={20} className={iconColors[variant]} />
      </div>
      <div className="mt-4 text-3xl sm:text-4xl font-black">{value}</div>
      {subtitle && <div className="mt-2 text-xs font-medium text-slate-400">{subtitle}</div>}
    </div>
  );
};
