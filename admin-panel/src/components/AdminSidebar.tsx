import React from "react";
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  ShieldCheck,
  KeyRound,
  Shield,
  LogOut,
  ExternalLink,
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingOrdersCount?: number;
  openTicketsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  pendingOrdersCount = 0,
  openTicketsCount = 0,
}) => {
  const menuItems = [
    { id: "overview", label: "Executive KPI", icon: LayoutDashboard },
    {
      id: "orders",
      label: "Payment Queue",
      icon: FileCheck2,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : undefined,
    },
    { id: "students", label: "Students & Access", icon: Users },
    {
      id: "support",
      label: "Support Desk",
      icon: ShieldCheck,
      badge: openTicketsCount > 0 ? `${openTicketsCount}` : undefined,
    },
    { id: "settings", label: "Gateways & Notice", icon: KeyRound },
    { id: "audit", label: "Audit Trail", icon: Shield },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col justify-between border-r border-slate-800 bg-[#070e1b] p-5 lg:flex">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500 font-black text-slate-950 shadow-md">
            C
          </div>
          <div>
            <div className="text-xs font-black tracking-widest text-white uppercase">CYCLE OF CHART</div>
            <div className="text-[10px] font-bold text-sky-400">ADMIN OPERATIONS</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-extrabold transition-all duration-150 ${
                  isActive
                    ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? "text-slate-950" : "text-slate-400"} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.2 text-[10px] font-black ${
                      isActive ? "bg-slate-950 text-sky-400" : "bg-amber-500 text-slate-950"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-800/80 pt-4 text-[11px] text-slate-400">
        <div className="font-bold text-slate-300">Trading Reality v2.0</div>
        <div className="text-[10px] text-slate-400 mt-0.5">Dual-Mode Security Enabled</div>
      </div>
    </aside>
  );
};
