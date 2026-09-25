import React from "react";
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  BookOpen,
  ShieldCheck,
  MessageSquare,
  UserCheck,
  KeyRound,
  Shield,
  UserCog,
} from "lucide-react";

export type AdminTab = "overview" | "orders" | "user_management" | "students" | "ebooks" | "support" | "owner" | "settings" | "audit";

interface AdminNavTabsProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  pendingOrdersCount?: number;
  studentsCount?: number;
  ebooksCount?: number;
  openTicketsCount?: number;
}

export const AdminNavTabs: React.FC<AdminNavTabsProps> = ({
  activeTab,
  setActiveTab,
  pendingOrdersCount = 0,
  studentsCount = 0,
  ebooksCount = 0,
  openTicketsCount = 0,
}) => {
  const tabs = [
    { id: "overview", label: "Executive KPI", icon: LayoutDashboard, badge: undefined },
    {
      id: "orders",
      label: "Payment Verification",
      icon: FileCheck2,
      badge: pendingOrdersCount ? `${pendingOrdersCount}` : undefined,
    },
    {
      id: "user_management",
      label: "User Management",
      icon: UserCog,
      badge: undefined,
    },
    {
      id: "students",
      label: "Students & Access",
      icon: Users,
      badge: studentsCount ? `${studentsCount}` : undefined,
    },
    {
      id: "ebooks",
      label: "Free eBooks & PDFs",
      icon: BookOpen,
      badge: ebooksCount ? `${ebooksCount}` : undefined,
    },
    {
      id: "support",
      label: "Support Messages",
      icon: MessageSquare,
      badge: openTicketsCount ? `${openTicketsCount}` : undefined,
    },
    { id: "owner", label: "Owner Profile", icon: UserCheck, badge: undefined },
    { id: "settings", label: "Gateways & Notice", icon: KeyRound, badge: undefined },
    { id: "audit", label: "Audit Trail", icon: Shield, badge: undefined },
  ];

  return (
    <div className="border-b border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-[#070e1b]/80">
      <div className="mx-auto flex max-w-7xl overflow-x-auto px-5 lg:px-8">
        <div className="flex gap-1 border-b-2 border-transparent pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-xs font-extrabold transition-all ${
                  isActive
                    ? "border-[#0284c7] text-[#0284c7] dark:border-sky-400 dark:text-sky-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-black text-slate-950 animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
