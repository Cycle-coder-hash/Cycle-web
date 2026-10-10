import React, { useState, useMemo } from "react";
import {
  Search,
  Users,
  Ban,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  UserAccessControlModal,
  AccessTierFormState,
} from "../modals/UserAccessControlModal";

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

  const { data: userDetailsData, isLoading: isLoadingDetails } =
    trpc.admin.userManagementDetails.useQuery(
      { userId: selectedUserId! },
      { enabled: !!selectedUserId }
    );

  // Form states for access control inside modal
  const [courseForm, setCourseForm] = useState<AccessTierFormState>({
    status: "off",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    isLifetime: false,
    notes: "",
  });

  const [proForm, setProForm] = useState<AccessTierFormState>({
    status: "off",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    isLifetime: false,
    notes: "",
  });

  const [premiumForm, setPremiumForm] = useState<AccessTierFormState>({
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
      <UserAccessControlModal
        selectedUserId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        isLoadingDetails={isLoadingDetails}
        userDetailsData={userDetailsData}
        courseForm={courseForm}
        setCourseForm={setCourseForm}
        proForm={proForm}
        setProForm={setProForm}
        premiumForm={premiumForm}
        setPremiumForm={setPremiumForm}
        onSetAccountStatus={(userId, status) =>
          setAccountStatusMutation.mutate({ userId, status })
        }
        isSettingAccountStatus={setAccountStatusMutation.isPending}
        onSaveAccess={handleSaveAccess}
        isUpdatingAccess={updateAccessMutation.isPending}
        onClearOverride={handleClearOverride}
        formatDate={formatDate}
        formatDateTime={formatDateTime}
      />
    </div>
  );
};
