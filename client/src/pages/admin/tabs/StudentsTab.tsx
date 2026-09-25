import React, { useState, useMemo } from "react";
import {
  Search,
  UserPlus,
  Users,
  Crown,
  ShieldCheck,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ChevronDown,
  Loader2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface StudentsTabProps {
  students: any[];
  studentSearch: string;
  setStudentSearch: (query: string) => void;
  onUpdateRole: (userId: number, role: "user" | "admin" | "support") => void;
  onOpenGrantAccess: (student: any) => void;
  isUpdatingRole?: boolean;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  studentSearch,
  setStudentSearch,
  onUpdateRole,
  onOpenGrantAccess,
  isUpdatingRole,
}) => {
  const utils = trpc.useUtils();

  // Status and Plan filters
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended" | "banned">("all");
  const [planFilter, setPlanFilter] = useState<"all" | "free_trial" | "free_after_trial" | "pro" | "premium">("all");
  const [pendingActionUserId, setPendingActionUserId] = useState<number | null>(null);

  // Mutations
  const setAccountStatusMutation = trpc.admin.setUserAccountStatus.useMutation({
    onSuccess: () => {
      utils.admin.users.invalidate();
      toast.success("Student account status updated successfully!");
      setPendingActionUserId(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update account status.");
      setPendingActionUserId(null);
    },
  });

  const activateSubscriptionMutation = trpc.admin.activateUserSubscription.useMutation({
    onSuccess: (data) => {
      utils.admin.users.invalidate();
      toast.success(`Activated ${data.subscription.plan.toUpperCase()} plan successfully!`);
      setPendingActionUserId(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to activate subscription.");
      setPendingActionUserId(null);
    },
  });

  // KPI Calculations
  const statsSummary = useMemo(() => {
    const list = students || [];
    const total = list.length;
    let proCount = 0;
    let premiumCount = 0;
    let trialCount = 0;
    let freeCount = 0;
    let suspendedCount = 0;
    let bannedCount = 0;

    list.forEach((s) => {
      const plan = s.subscription?.plan || "free_trial";
      if (plan === "pro") proCount++;
      else if (plan === "premium") premiumCount++;
      else if (plan === "free_after_trial") freeCount++;
      else trialCount++;

      const accStatus = s.accountStatus || "active";
      if (accStatus === "suspended") suspendedCount++;
      if (accStatus === "banned") bannedCount++;
    });

    return {
      total,
      paidActive: proCount + premiumCount,
      proCount,
      premiumCount,
      trialCount,
      freeCount,
      restrictedCount: suspendedCount + bannedCount,
    };
  }, [students]);

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return (students || []).filter((s: any) => {
      // 1. Search Query
      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase();
        const matches =
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.phone?.includes(q) ||
          String(s.id).includes(q);
        if (!matches) return false;
      }

      // 2. Account Status Filter
      const currentStatus = s.accountStatus || "active";
      if (statusFilter !== "all" && currentStatus !== statusFilter) {
        return false;
      }

      // 3. Subscription Plan Filter
      const currentPlan = s.subscription?.plan || "free_trial";
      if (planFilter !== "all" && currentPlan !== planFilter) {
        return false;
      }

      return true;
    });
  }, [students, studentSearch, statusFilter, planFilter]);

  const handleStatusChange = (userId: number, newStatus: "active" | "suspended" | "banned") => {
    if (newStatus === "banned" || newStatus === "suspended") {
      if (!window.confirm(`Are you sure you want to set Student #${userId} to ${newStatus.toUpperCase()}?`)) {
        return;
      }
    }
    setPendingActionUserId(userId);
    setAccountStatusMutation.mutate({ userId, status: newStatus });
  };

  const handleActivatePlan = (userId: number, plan: "pro" | "premium", durationDays: number = 30) => {
    setPendingActionUserId(userId);
    activateSubscriptionMutation.mutate({ userId, plan, durationDays });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-sky-500">
              MEMBERSHIP & ACCESS GOVERNANCE
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
            Students & Subscription Management
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monitor real-time subscription plans, manage account statuses (Active, Suspended, Banned), and manually grant or renew Pro & Premium tiers.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-3xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Students</span>
            <Users className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {statsSummary.total}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">
            Registered accounts
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Active Paid Subs</span>
            <Crown className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-500">
            {statsSummary.paidActive}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <span className="text-cyan-500">{statsSummary.proCount} Pro</span>
            <span>•</span>
            <span className="text-amber-500">{statsSummary.premiumCount} Premium</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">In 30-Day Trial</span>
            <Clock className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-cyan-600 dark:text-cyan-400">
            {statsSummary.trialCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">
            {statsSummary.freeCount} on Free-After-Trial
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Restricted Users</span>
            <Ban className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-500">
            {statsSummary.restrictedCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">
            Suspended or banned
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students by name, email, phone, or ID..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
            <option value="banned">Banned Only</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as any)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="all">All Plans</option>
            <option value="pro">Pro Plan (৳599)</option>
            <option value="premium">Premium Plan (৳999)</option>
            <option value="free_trial">30-Day Free Trial</option>
            <option value="free_after_trial">Free-After-Trial</option>
          </select>
        </div>
      </div>

      {/* Students Table / Grid */}
      <div className="space-y-3">
        {filteredStudents.length ? (
          filteredStudents.map((s: any) => {
            const sub = s.subscription || {};
            const plan: string = sub.plan || "free_trial";
            const accountStatus: string = s.accountStatus || "active";
            const isActionPending = pendingActionUserId === s.id;

            return (
              <div
                key={s.id}
                className={`flex flex-col justify-between gap-4 rounded-3xl border bg-white p-5 shadow-sm transition-all duration-200 dark:bg-slate-900 ${
                  accountStatus === "banned"
                    ? "border-rose-300/80 bg-rose-50/20 dark:border-rose-900/40 dark:bg-rose-950/10"
                    : accountStatus === "suspended"
                    ? "border-amber-300/80 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: User Avatar & Basic Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="relative">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[#081833] font-bold text-white dark:bg-sky-500 dark:text-slate-950 shrink-0 shadow-sm">
                        {s.name ? s.name[0].toUpperCase() : "U"}
                      </div>
                      {/* Subscription badge avatar corner */}
                      {plan === "premium" && (
                        <div className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-xs">
                          <Crown size={11} className="stroke-[2.5]" />
                        </div>
                      )}
                      {plan === "pro" && (
                        <div className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-xs">
                          <Zap size={11} className="stroke-[2.5]" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {s.name || "Student"}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">#{s.id}</span>

                        {/* Role Badge */}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                            s.role === "admin"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400"
                              : s.role === "support"
                              ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {s.role}
                        </span>

                        {/* Account Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                            accountStatus === "active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : accountStatus === "suspended"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {accountStatus === "active" ? (
                            <CheckCircle2 size={10} />
                          ) : accountStatus === "suspended" ? (
                            <AlertTriangle size={10} />
                          ) : (
                            <Ban size={10} />
                          )}
                          <span>{accountStatus}</span>
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {s.email} {s.phone ? `· ${s.phone}` : ""}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        Joined: {new Date(s.createdAt).toLocaleDateString()} · Orders: {s.ordersCount || 0}
                      </div>
                    </div>
                  </div>

                  {/* Center: Subscription Status Detail Card */}
                  <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 p-3 min-w-[260px]">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {plan === "premium" ? (
                          <div className="inline-flex items-center gap-1 text-xs font-black text-amber-500">
                            <Crown size={13} />
                            <span>PREMIUM INSTITUTIONAL</span>
                          </div>
                        ) : plan === "pro" ? (
                          <div className="inline-flex items-center gap-1 text-xs font-black text-cyan-500">
                            <Zap size={13} />
                            <span>PRO TRADER PLAN</span>
                          </div>
                        ) : plan === "free_trial" ? (
                          <div className="inline-flex items-center gap-1 text-xs font-black text-sky-500">
                            <Clock size={13} />
                            <span>30-DAY FREE TRIAL</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-xs font-black text-slate-500 dark:text-slate-400">
                            <ShieldCheck size={13} />
                            <span>FREE-AFTER-TRIAL</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {plan === "free_trial" && (
                          <span>
                            {sub.daysLeftInTrial != null
                              ? `${sub.daysLeftInTrial} days remaining`
                              : "Active 30 days"}
                          </span>
                        )}
                        {(plan === "pro" || plan === "premium") && (
                          <span>
                            {sub.daysLeftInSubscription != null
                              ? `${sub.daysLeftInSubscription} days left • Ends ${
                                  sub.subscriptionEndsAt
                                    ? new Date(sub.subscriptionEndsAt).toLocaleDateString()
                                    : "Active"
                                }`
                              : "Active Paid Plan"}
                          </span>
                        )}
                        {plan === "free_after_trial" && (
                          <span>5 trades & 5 discipline days max / 30-day cycle</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom / Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800/80">
                  {/* Account Status Control */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400">Account Status:</span>
                    <select
                      value={accountStatus}
                      disabled={isActionPending}
                      onChange={(e) => handleStatusChange(s.id, e.target.value as any)}
                      className={`rounded-xl border px-2.5 py-1.5 text-xs font-extrabold outline-none transition-colors ${
                        accountStatus === "active"
                          ? "border-emerald-500/40 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : accountStatus === "suspended"
                          ? "border-amber-500/40 bg-amber-50/50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : "border-rose-500/40 bg-rose-50/50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                      }`}
                    >
                      <option value="active">Active (Normal Access)</option>
                      <option value="suspended">Suspended (Restricted)</option>
                      <option value="banned">Banned (Forbidden)</option>
                    </select>
                  </div>

                  {/* Subscription Activation & Roles */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Quick Plan Activation Menu */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isActionPending}
                        onClick={() => handleActivatePlan(s.id, "pro", 30)}
                        className="rounded-xl border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 text-xs font-extrabold gap-1 h-8 px-2.5"
                      >
                        <Zap size={12} />
                        <span>+ Pro (30d)</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isActionPending}
                        onClick={() => handleActivatePlan(s.id, "premium", 30)}
                        className="rounded-xl border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs font-extrabold gap-1 h-8 px-2.5"
                      >
                        <Crown size={12} />
                        <span>+ Premium (30d)</span>
                      </Button>
                    </div>

                    {/* Role Dropdown */}
                    <select
                      value={s.role}
                      disabled={isUpdatingRole}
                      onChange={(e) => onUpdateRole(s.id, e.target.value as any)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 h-8"
                    >
                      <option value="user">Role: User</option>
                      <option value="support">Role: Support</option>
                      <option value="admin">Role: Admin</option>
                    </select>

                    {/* Grant Manual Entitlement Package Button */}
                    <Button
                      size="sm"
                      onClick={() => onOpenGrantAccess(s)}
                      className="bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 h-8 rounded-xl px-3"
                    >
                      <UserPlus size={13} className="mr-1.5" />
                      <span>Grant Access</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            <Users size={36} className="mx-auto text-slate-400 mb-2" />
            <div className="font-bold">No students found</div>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
