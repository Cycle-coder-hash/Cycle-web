import React, { useState, useMemo } from "react";
import {
  Search,
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Zap,
  Crown,
  BookOpen,
  Calendar,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  History,
  X,
  UserCheck,
  Check,
  Loader2,
  ExternalLink,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const UserManagementTab: React.FC = () => {
  const utils = trpc.useUtils();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [proFilter, setProFilter] = useState<string>("all");
  const [premiumFilter, setPremiumFilter] = useState<string>("all");

  // Selected User Modal state
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Queries
  const { data: usersList, isLoading: isLoadingUsers, refetch: refetchUsers } =
    trpc.admin.userManagementList.useQuery({
      search: search.trim() || undefined,
      accountStatus: statusFilter !== "all" ? statusFilter : undefined,
      courseAccess: courseFilter !== "all" ? courseFilter : undefined,
      proAccess: proFilter !== "all" ? proFilter : undefined,
      premiumAccess: premiumFilter !== "all" ? premiumFilter : undefined,
    });

  const { data: userDetailsData, isLoading: isLoadingDetails, refetch: refetchDetails } =
    trpc.admin.userManagementDetails.useQuery(
      { userId: selectedUserId! },
      { enabled: !!selectedUserId }
    );

  // Form states for access control inside modal
  const [courseForm, setCourseForm] = useState<{
    status: "on" | "off";
    startDate: string;
    expiryDate: string;
    isLifetime: boolean;
    notes: string;
  }>({
    status: "off",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    isLifetime: false,
    notes: "",
  });

  const [proForm, setProForm] = useState<{
    status: "on" | "off";
    startDate: string;
    expiryDate: string;
    isLifetime: boolean;
    notes: string;
  }>({
    status: "off",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    isLifetime: false,
    notes: "",
  });

  const [premiumForm, setPremiumForm] = useState<{
    status: "on" | "off";
    startDate: string;
    expiryDate: string;
    isLifetime: boolean;
    notes: string;
  }>({
    status: "off",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    isLifetime: false,
    notes: "",
  });

  // Sync form states whenever user details are loaded
  React.useEffect(() => {
    if (userDetailsData?.user) {
      const u = userDetailsData.user;
      setCourseForm({
        status: u.courseAccess.status,
        startDate: u.courseAccess.startDate ? u.courseAccess.startDate.split("T")[0] : new Date().toISOString().split("T")[0],
        expiryDate: u.courseAccess.expiryDate && u.courseAccess.expiryDate !== "LIFETIME" ? u.courseAccess.expiryDate.split("T")[0] : new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        isLifetime: u.courseAccess.isLifetime,
        notes: "",
      });

      setProForm({
        status: u.proAccess.status,
        startDate: u.proAccess.startDate ? u.proAccess.startDate.split("T")[0] : new Date().toISOString().split("T")[0],
        expiryDate: u.proAccess.expiryDate && u.proAccess.expiryDate !== "LIFETIME" ? u.proAccess.expiryDate.split("T")[0] : new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        isLifetime: u.proAccess.isLifetime,
        notes: "",
      });

      setPremiumForm({
        status: u.premiumAccess.status,
        startDate: u.premiumAccess.startDate ? u.premiumAccess.startDate.split("T")[0] : new Date().toISOString().split("T")[0],
        expiryDate: u.premiumAccess.expiryDate && u.premiumAccess.expiryDate !== "LIFETIME" ? u.premiumAccess.expiryDate.split("T")[0] : new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        isLifetime: u.premiumAccess.isLifetime,
        notes: "",
      });
    }
  }, [userDetailsData]);

  // Mutations
  const updateAccessMutation = trpc.admin.userManagementUpdateAccess.useMutation({
    onSuccess: (data, variables) => {
      utils.admin.userManagementList.invalidate();
      utils.admin.userManagementDetails.invalidate({ userId: variables.userId });
      toast.success(`${variables.accessType.toUpperCase()} Access updated successfully!`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update access.");
    },
  });

  const clearOverrideMutation = trpc.admin.userManagementClearOverride.useMutation({
    onSuccess: (data, variables) => {
      utils.admin.userManagementList.invalidate();
      utils.admin.userManagementDetails.invalidate({ userId: variables.userId });
      toast.success(`Admin override cleared for ${variables.accessType.toUpperCase()}. Automatic entitlement restored!`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to clear override.");
    },
  });

  const setAccountStatusMutation = trpc.admin.userManagementSetAccountStatus.useMutation({
    onSuccess: (data, variables) => {
      utils.admin.userManagementList.invalidate();
      utils.admin.userManagementDetails.invalidate({ userId: variables.userId });
      toast.success(`Account status updated to ${variables.status.toUpperCase()}!`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update account status.");
    },
  });

  // KPI Metrics Summary
  const stats = useMemo(() => {
    const list = usersList || [];
    let activeUsers = 0;
    let suspendedUsers = 0;
    let courseUsers = 0;
    let proUsers = 0;
    let premiumUsers = 0;

    for (const u of list) {
      if (u.accountStatus === "active") activeUsers++;
      if (u.accountStatus === "suspended" || u.accountStatus === "banned") suspendedUsers++;
      if (u.isCourseOn) courseUsers++;
      if (u.isProOn) proUsers++;
      if (u.isPremiumOn) premiumUsers++;
    }

    return {
      total: list.length,
      activeUsers,
      suspendedUsers,
      courseUsers,
      proUsers,
      premiumUsers,
    };
  }, [usersList]);

  const handleSaveAccess = (accessType: "course" | "pro" | "premium") => {
    if (!selectedUserId) return;
    const form = accessType === "course" ? courseForm : accessType === "pro" ? proForm : premiumForm;

    updateAccessMutation.mutate({
      userId: selectedUserId,
      accessType,
      status: form.status,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      expiryDate: form.isLifetime ? null : form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
      isLifetime: form.isLifetime,
      isOverrideBlocked: form.status === "off",
      notes: form.notes || undefined,
    });
  };

  const handleClearOverride = (accessType: "course" | "pro" | "premium") => {
    if (!selectedUserId) return;
    clearOverrideMutation.mutate({
      userId: selectedUserId,
      accessType,
    });
  };

  const formatDate = (isoString: string | null | undefined) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return isoString;
    }
  };

  const formatDateTime = (isoString: string | null | undefined) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} at ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="text-[#0284c7]" size={22} />
            User Management & Access Control
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time registered users from database. Manually control Course, Pro, and Premium access with audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetchUsers()}
            className="h-8 gap-1.5 border-slate-200 text-xs font-bold dark:border-slate-800"
          >
            <RotateCcw size={13} className={isLoadingUsers ? "animate-spin" : ""} />
            Sync Realtime
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800/80 dark:bg-[#070e1b]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Users</div>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{stats.total}</div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800/80 dark:bg-[#070e1b]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Active Accounts</div>
          <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.activeUsers}</div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800/80 dark:bg-[#070e1b]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Course Access</div>
          <div className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{stats.courseUsers}</div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800/80 dark:bg-[#070e1b]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-500">Pro Active</div>
          <div className="mt-1 text-2xl font-black text-sky-600 dark:text-sky-400">{stats.proUsers}</div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800/80 dark:bg-[#070e1b]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Premium Active</div>
          <div className="mt-1 text-2xl font-black text-purple-600 dark:text-purple-400">{stats.premiumUsers}</div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800/80 dark:bg-[#070e1b]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Suspended / Banned</div>
          <div className="mt-1 text-2xl font-black text-rose-500">{stats.suspendedUsers}</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-[#070e1b] md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search by User ID (USER-0001), Name, Gmail, Username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 focus:border-[#0284c7] focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Account Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="all">Status: All</option>
            <option value="active">Status: Active</option>
            <option value="suspended">Status: Suspended</option>
            <option value="banned">Status: Banned</option>
          </select>

          {/* Course Access Filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="all">Course: All</option>
            <option value="on">Course: ON</option>
            <option value="off">Course: OFF</option>
          </select>

          {/* Pro Access Filter */}
          <select
            value={proFilter}
            onChange={(e) => setProFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="all">Pro: All</option>
            <option value="on">Pro: ON</option>
            <option value="off">Pro: OFF</option>
          </select>

          {/* Premium Access Filter */}
          <select
            value={premiumFilter}
            onChange={(e) => setPremiumFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="all">Premium: All</option>
            <option value="on">Premium: ON</option>
            <option value="off">Premium: OFF</option>
          </select>

          {(search || statusFilter !== "all" || courseFilter !== "all" || proFilter !== "all" || premiumFilter !== "all") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setCourseFilter("all");
                setProFilter("all");
                setPremiumFilter("all");
              }}
              className="h-8 px-2 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Main Users Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#070e1b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">User Profile</th>
                <th className="px-4 py-3">Gmail / Email</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Course</th>
                <th className="px-4 py-3 text-center">Pro</th>
                <th className="px-4 py-3 text-center">Premium</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto mb-2 animate-spin text-[#0284c7]" size={24} />
                    Loading registered users from database...
                  </td>
                </tr>
              ) : !usersList || usersList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No users matching criteria found.
                  </td>
                </tr>
              ) : (
                usersList.map((u) => {
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      {/* User ID */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          {u.displayId}
                        </span>
                      </td>

                      {/* Profile: Photo + Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                            ) : (
                              <span>{(u.name || "T")[0].toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {u.name}
                              {u.role === "admin" && (
                                <span className="rounded bg-sky-100 px-1 py-0.2 text-[9px] font-black text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Joined {formatDate(u.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Gmail / Email with Google indicator */}
                      <td className="px-4 py-3.5">
                        {u.email ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-slate-700 dark:text-slate-300">{u.email}</span>
                            {u.isGoogleAuth && (
                              <span
                                title="Authenticated via Google / Gmail"
                                className="rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              >
                                Gmail
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No email</span>
                        )}
                      </td>

                      {/* Username */}
                      <td className="px-4 py-3.5">
                        {u.username ? (
                          <span className="font-mono text-slate-600 dark:text-slate-400">@{u.username}</span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="px-4 py-3.5 text-center">
                        {u.accountStatus === "active" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        ) : u.accountStatus === "suspended" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                            <AlertTriangle size={10} /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                            <Ban size={10} /> Banned
                          </span>
                        )}
                      </td>

                      {/* Course Access */}
                      <td className="px-4 py-3.5 text-center">
                        {u.isCourseOn ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            ON
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                            OFF
                          </span>
                        )}
                      </td>

                      {/* Pro Access */}
                      <td className="px-4 py-3.5 text-center">
                        {u.isProOn ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100/80 px-2.5 py-0.5 text-[11px] font-black text-sky-800 dark:bg-sky-950/80 dark:text-sky-300">
                            ON
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                            OFF
                          </span>
                        )}
                      </td>

                      {/* Premium Access */}
                      <td className="px-4 py-3.5 text-center">
                        {u.isPremiumOn ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100/80 px-2.5 py-0.5 text-[11px] font-black text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">
                            ON
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                            OFF
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          size="sm"
                          onClick={() => setSelectedUserId(u.id)}
                          className="h-7 gap-1 rounded-md bg-[#0284c7] px-2.5 text-[11px] font-bold text-white hover:bg-sky-700"
                        >
                          <UserCheck size={12} />
                          Manage Access
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER DETAILS & ACCESS CONTROL MODAL */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#070e1b] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-[#0284c7] dark:bg-sky-950/50 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    User Details & Access Control
                    {userDetailsData?.user && (
                      <span className="font-mono text-xs text-sky-600 dark:text-sky-400">
                        ({userDetailsData.user.displayId})
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Control Course, Pro, and Premium access with automatic priority and override tracking.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserId(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoadingDetails || !userDetailsData?.user ? (
                <div className="py-16 text-center text-slate-400">
                  <Loader2 className="mx-auto mb-2 animate-spin text-[#0284c7]" size={28} />
                  Loading user data and access states from database...
                </div>
              ) : (
                <>
                  {/* User Profile Card */}
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-900/40">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 flex items-center justify-center text-lg font-black text-slate-700 dark:text-slate-200">
                          {userDetailsData.user.avatar ? (
                            <img
                              src={userDetailsData.user.avatar}
                              alt={userDetailsData.user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            (userDetailsData.user.name || "T")[0].toUpperCase()
                          )}
                        </div>

                        <div>
                          <div className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            {userDetailsData.user.name}
                            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                              {userDetailsData.user.displayId}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <span className="flex items-center gap-1 font-mono">
                              <Mail size={12} /> {userDetailsData.user.email || "No email"}
                              {userDetailsData.user.isGoogleAuth && (
                                <span className="rounded bg-emerald-100 px-1 text-[9px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  Google
                                </span>
                              )}
                            </span>

                            <span className="flex items-center gap-1 font-mono">
                              <UserIcon size={12} /> @{userDetailsData.user.username || "none"}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                            <span>
                              <strong>Signup Date:</strong> {formatDateTime(userDetailsData.user.createdAt)}
                            </span>
                            <span>
                              <strong>Last Login:</strong> {formatDateTime(userDetailsData.user.lastSignedIn)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Account Status Control */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Account Status
                        </div>
                        <select
                          value={userDetailsData.user.accountStatus}
                          onChange={(e) =>
                            setAccountStatusMutation.mutate({
                              userId: userDetailsData.user.id,
                              status: e.target.value as any,
                            })
                          }
                          disabled={setAccountStatusMutation.isPending}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="banned">Banned</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 3 INDEPENDENT ACCESS CONTROLS */}
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                      <Shield size={14} className="text-[#0284c7]" />
                      Access Management (Independent Controls)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 1. COURSE ACCESS CARD */}
                      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <BookOpen size={14} /> Course Access
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                userDetailsData.user.courseAccess.effectiveActive
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              Effective: {userDetailsData.user.courseAccess.effectiveActive ? "ON" : "OFF"}
                            </span>
                          </div>

                          {/* Status Overview Badges */}
                          <div className="mt-3 space-y-1.5 text-[11px] bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Automatic:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {userDetailsData.user.courseAccess.automaticActive ? "Active" : "None"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Manual Grant:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {userDetailsData.user.courseAccess.manualActive
                                  ? userDetailsData.user.courseAccess.isLifetime
                                    ? "Active (Lifetime)"
                                    : `Active (until ${formatDate(userDetailsData.user.courseAccess.expiryDate)})`
                                  : "None / OFF"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Admin Override:</span>
                              <span
                                className={`font-black ${
                                  userDetailsData.user.courseAccess.isOverrideBlocked
                                    ? "text-rose-500"
                                    : "text-slate-400"
                                }`}
                              >
                                {userDetailsData.user.courseAccess.isOverrideBlocked ? "BLOCKED" : "None"}
                              </span>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Access Switch:
                            </span>
                            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
                              <button
                                type="button"
                                onClick={() => setCourseForm((prev) => ({ ...prev, status: "on" }))}
                                className={`px-2.5 py-1 text-xs font-black rounded-md transition-all ${
                                  courseForm.status === "on"
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                ON
                              </button>
                              <button
                                type="button"
                                onClick={() => setCourseForm((prev) => ({ ...prev, status: "off" }))}
                                className={`px-2.5 py-1 text-xs font-black rounded-md transition-all ${
                                  courseForm.status === "off"
                                    ? "bg-rose-600 text-white shadow-sm"
                                    : "text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                OFF
                              </button>
                            </div>
                          </div>

                          {/* Start & Expiry Dates */}
                          {courseForm.status === "on" && (
                            <div className="mt-3 space-y-2.5 text-xs animate-in fade-in duration-150">
                              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={courseForm.isLifetime}
                                  onChange={(e) =>
                                    setCourseForm((prev) => ({ ...prev, isLifetime: e.target.checked }))
                                  }
                                  className="rounded border-slate-300 text-[#0284c7]"
                                />
                                <span>Lifetime Access</span>
                              </label>

                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  value={courseForm.startDate}
                                  onChange={(e) =>
                                    setCourseForm((prev) => ({ ...prev, startDate: e.target.value }))
                                  }
                                  className="w-full rounded-md border border-slate-200 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                              </div>

                              {!courseForm.isLifetime && (
                                <div>
                                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                    Expiry Date
                                  </label>
                                  <input
                                    type="date"
                                    value={courseForm.expiryDate}
                                    onChange={(e) =>
                                      setCourseForm((prev) => ({ ...prev, expiryDate: e.target.value }))
                                    }
                                    className="w-full rounded-md border border-slate-200 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Clear override action if blocked */}
                          {userDetailsData.user.courseAccess.isOverrideBlocked && (
                            <div className="mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleClearOverride("course")}
                                className="w-full h-7 text-[10px] font-bold text-sky-600 border-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/30"
                              >
                                <RotateCcw size={11} className="mr-1" />
                                Clear Block & Restore Automatic
                              </Button>
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleSaveAccess("course")}
                          disabled={updateAccessMutation.isPending}
                          className="w-full h-8 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          Save Course Access
                        </Button>
                      </div>

                      {/* 2. PRO ACCESS CARD */}
                      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1">
                              <Zap size={14} /> Pro Access
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                userDetailsData.user.proAccess.effectiveActive
                                  ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              Effective: {userDetailsData.user.proAccess.effectiveActive ? "ON" : "OFF"}
                            </span>
                          </div>

                          {/* Status Overview Badges */}
                          <div className="mt-3 space-y-1.5 text-[11px] bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Automatic:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {userDetailsData.user.proAccess.automaticActive
                                  ? `Active (until ${formatDate(userDetailsData.user.proAccess.automaticExpiry)})`
                                  : "None"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Manual Grant:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {userDetailsData.user.proAccess.manualActive
                                  ? userDetailsData.user.proAccess.isLifetime
                                    ? "Active (Lifetime)"
                                    : `Active (until ${formatDate(userDetailsData.user.proAccess.expiryDate)})`
                                  : "None / OFF"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Admin Override:</span>
                              <span
                                className={`font-black ${
                                  userDetailsData.user.proAccess.isOverrideBlocked
                                    ? "text-rose-500"
                                    : "text-slate-400"
                                }`}
                              >
                                {userDetailsData.user.proAccess.isOverrideBlocked ? "BLOCKED" : "None"}
                              </span>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Access Switch:
                            </span>
                            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
                              <button
                                type="button"
                                onClick={() => setProForm((prev) => ({ ...prev, status: "on" }))}
                                className={`px-2.5 py-1 text-xs font-black rounded-md transition-all ${
                                  proForm.status === "on"
                                    ? "bg-sky-600 text-white shadow-sm"
                                    : "text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                ON
                              </button>
                              <button
                                type="button"
                                onClick={() => setProForm((prev) => ({ ...prev, status: "off" }))}
                                className={`px-2.5 py-1 text-xs font-black rounded-md transition-all ${
                                  proForm.status === "off"
                                    ? "bg-rose-600 text-white shadow-sm"
                                    : "text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                OFF
                              </button>
                            </div>
                          </div>

                          {/* Start & Expiry Dates */}
                          {proForm.status === "on" && (
                            <div className="mt-3 space-y-2.5 text-xs animate-in fade-in duration-150">
                              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={proForm.isLifetime}
                                  onChange={(e) =>
                                    setProForm((prev) => ({ ...prev, isLifetime: e.target.checked }))
                                  }
                                  className="rounded border-slate-300 text-[#0284c7]"
                                />
                                <span>Lifetime Access</span>
                              </label>

                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  value={proForm.startDate}
                                  onChange={(e) =>
                                    setProForm((prev) => ({ ...prev, startDate: e.target.value }))
                                  }
                                  className="w-full rounded-md border border-slate-200 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                              </div>

                              {!proForm.isLifetime && (
                                <div>
                                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                    Expiry Date
                                  </label>
                                  <input
                                    type="date"
                                    value={proForm.expiryDate}
                                    onChange={(e) =>
                                      setProForm((prev) => ({ ...prev, expiryDate: e.target.value }))
                                    }
                                    className="w-full rounded-md border border-slate-200 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Clear override action if blocked */}
                          {userDetailsData.user.proAccess.isOverrideBlocked && (
                            <div className="mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleClearOverride("pro")}
                                className="w-full h-7 text-[10px] font-bold text-sky-600 border-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/30"
                              >
                                <RotateCcw size={11} className="mr-1" />
                                Clear Block & Restore Automatic
                              </Button>
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleSaveAccess("pro")}
                          disabled={updateAccessMutation.isPending}
                          className="w-full h-8 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white"
                        >
                          Save Pro Access
                        </Button>
                      </div>

                      {/* 3. PREMIUM ACCESS CARD */}
                      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                              <Crown size={14} /> Premium Access
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                userDetailsData.user.premiumAccess.effectiveActive
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              Effective: {userDetailsData.user.premiumAccess.effectiveActive ? "ON" : "OFF"}
                            </span>
                          </div>

                          {/* Status Overview Badges */}
                          <div className="mt-3 space-y-1.5 text-[11px] bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Automatic:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {userDetailsData.user.premiumAccess.automaticActive
                                  ? `Active (until ${formatDate(userDetailsData.user.premiumAccess.automaticExpiry)})`
                                  : "None"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Manual Grant:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {userDetailsData.user.premiumAccess.manualActive
                                  ? userDetailsData.user.premiumAccess.isLifetime
                                    ? "Active (Lifetime)"
                                    : `Active (until ${formatDate(userDetailsData.user.premiumAccess.expiryDate)})`
                                  : "None / OFF"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Admin Override:</span>
                              <span
                                className={`font-black ${
                                  userDetailsData.user.premiumAccess.isOverrideBlocked
                                    ? "text-rose-500"
                                    : "text-slate-400"
                                }`}
                              >
                                {userDetailsData.user.premiumAccess.isOverrideBlocked ? "BLOCKED" : "None"}
                              </span>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Access Switch:
                            </span>
                            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
                              <button
                                type="button"
                                onClick={() => setPremiumForm((prev) => ({ ...prev, status: "on" }))}
                                className={`px-2.5 py-1 text-xs font-black rounded-md transition-all ${
                                  premiumForm.status === "on"
                                    ? "bg-purple-600 text-white shadow-sm"
                                    : "text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                ON
                              </button>
                              <button
                                type="button"
                                onClick={() => setPremiumForm((prev) => ({ ...prev, status: "off" }))}
                                className={`px-2.5 py-1 text-xs font-black rounded-md transition-all ${
                                  premiumForm.status === "off"
                                    ? "bg-rose-600 text-white shadow-sm"
                                    : "text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                OFF
                              </button>
                            </div>
                          </div>

                          {/* Start & Expiry Dates */}
                          {premiumForm.status === "on" && (
                            <div className="mt-3 space-y-2.5 text-xs animate-in fade-in duration-150">
                              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={premiumForm.isLifetime}
                                  onChange={(e) =>
                                    setPremiumForm((prev) => ({ ...prev, isLifetime: e.target.checked }))
                                  }
                                  className="rounded border-slate-300 text-[#0284c7]"
                                />
                                <span>Lifetime Access</span>
                              </label>

                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  value={premiumForm.startDate}
                                  onChange={(e) =>
                                    setPremiumForm((prev) => ({ ...prev, startDate: e.target.value }))
                                  }
                                  className="w-full rounded-md border border-slate-200 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                              </div>

                              {!premiumForm.isLifetime && (
                                <div>
                                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                    Expiry Date
                                  </label>
                                  <input
                                    type="date"
                                    value={premiumForm.expiryDate}
                                    onChange={(e) =>
                                      setPremiumForm((prev) => ({ ...prev, expiryDate: e.target.value }))
                                    }
                                    className="w-full rounded-md border border-slate-200 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Clear override action if blocked */}
                          {userDetailsData.user.premiumAccess.isOverrideBlocked && (
                            <div className="mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleClearOverride("premium")}
                                className="w-full h-7 text-[10px] font-bold text-sky-600 border-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/30"
                              >
                                <RotateCcw size={11} className="mr-1" />
                                Clear Block & Restore Automatic
                              </Button>
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleSaveAccess("premium")}
                          disabled={updateAccessMutation.isPending}
                          className="w-full h-8 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Save Premium Access
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* ACCESS AUDIT HISTORY */}
                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                      <History size={14} className="text-[#0284c7]" />
                      Internal Access History & Audit Trail (Admin-Only)
                    </h4>

                    {(!userDetailsData.auditLogs || userDetailsData.auditLogs.length === 0) ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No manual access changes recorded yet for this user.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:border-slate-800">
                            <tr>
                              <th className="pb-2">Access Type</th>
                              <th className="pb-2">Previous State</th>
                              <th className="pb-2">New State</th>
                              <th className="pb-2">Changed By</th>
                              <th className="pb-2">Timestamp</th>
                              <th className="pb-2">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {userDetailsData.auditLogs.map((log) => (
                              <tr key={log.id} className="text-[11px]">
                                <td className="py-2.5 font-bold uppercase text-slate-700 dark:text-slate-300">
                                  {log.accessType}
                                </td>
                                <td className="py-2.5 text-slate-500 font-mono">
                                  {log.previousState}
                                </td>
                                <td className="py-2.5 font-bold font-mono text-[#0284c7]">
                                  {log.newState}
                                </td>
                                <td className="py-2.5 text-slate-600 dark:text-slate-400">
                                  {log.adminName || `Admin #${log.adminId}`}
                                </td>
                                <td className="py-2.5 text-slate-400">
                                  {formatDateTime(log.createdAt as any)}
                                </td>
                                <td className="py-2.5 text-slate-400 italic">
                                  {log.notes || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-200 px-6 py-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserId(null)}
                className="text-xs font-bold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
