import React from "react";
import {
  Shield,
  Zap,
  Crown,
  BookOpen,
  RotateCcw,
  History,
  X,
  UserCheck,
  Loader2,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AccessTierFormState {
  status: "on" | "off";
  startDate: string;
  expiryDate: string;
  isLifetime: boolean;
  notes: string;
}

export interface UserAccessTierState {
  status: "on" | "off";
  accessType?: "automatic" | "manual";
  startDate: string | null;
  expiryDate: string | null;
  isLifetime: boolean;
  isOverrideBlocked: boolean;
  automaticActive: boolean;
  automaticExpiry: string | null;
  manualActive: boolean;
  effectiveActive: boolean;
}

export interface UserDetailsRecord {
  id: number;
  displayId: string;
  name: string;
  email: string | null;
  isGoogleAuth: boolean;
  username: string | null;
  avatar: string | null;
  accountStatus: "active" | "suspended" | "banned";
  createdAt: string;
  lastSignedIn: string;
  courseAccess: UserAccessTierState;
  proAccess: UserAccessTierState;
  premiumAccess: UserAccessTierState;
}

export interface UserAccessAuditLogRecord {
  id: number | string;
  accessType: string;
  previousState: string;
  newState: string;
  adminId?: number | null;
  adminName?: string | null;
  createdAt?: string | Date | null;
  notes?: string | null;
}

export interface UserDetailsModalData {
  user: UserDetailsRecord | null;
  auditLogs: UserAccessAuditLogRecord[];
}

export interface UserAccessControlModalProps {
  selectedUserId: number | null;
  onClose: () => void;
  isLoadingDetails: boolean;
  userDetailsData: UserDetailsModalData | undefined;
  courseForm: AccessTierFormState;
  setCourseForm: React.Dispatch<React.SetStateAction<AccessTierFormState>>;
  proForm: AccessTierFormState;
  setProForm: React.Dispatch<React.SetStateAction<AccessTierFormState>>;
  premiumForm: AccessTierFormState;
  setPremiumForm: React.Dispatch<React.SetStateAction<AccessTierFormState>>;
  onSetAccountStatus: (userId: number, status: "active" | "suspended" | "banned") => void;
  isSettingAccountStatus: boolean;
  onSaveAccess: (accessType: "course" | "pro" | "premium") => void;
  isUpdatingAccess: boolean;
  onClearOverride: (accessType: "course" | "pro" | "premium") => void;
  formatDate: (isoString: string | null | undefined) => string;
  formatDateTime: (isoString: string | null | undefined) => string;
}

export const UserAccessControlModal: React.FC<UserAccessControlModalProps> = ({
  selectedUserId,
  onClose,
  isLoadingDetails,
  userDetailsData,
  courseForm,
  setCourseForm,
  proForm,
  setProForm,
  premiumForm,
  setPremiumForm,
  onSetAccountStatus,
  isSettingAccountStatus,
  onSaveAccess,
  isUpdatingAccess,
  onClearOverride,
  formatDate,
  formatDateTime,
}) => {
  if (!selectedUserId) return null;

  return (
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
            onClick={onClose}
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
                        onSetAccountStatus(
                          userDetailsData.user!.id,
                          e.target.value as "active" | "suspended" | "banned"
                        )
                      }
                      disabled={isSettingAccountStatus}
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
                            onClick={() => onClearOverride("course")}
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
                      onClick={() => onSaveAccess("course")}
                      disabled={isUpdatingAccess}
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
                            onClick={() => onClearOverride("pro")}
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
                      onClick={() => onSaveAccess("pro")}
                      disabled={isUpdatingAccess}
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
                            onClick={() => onClearOverride("premium")}
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
                      onClick={() => onSaveAccess("premium")}
                      disabled={isUpdatingAccess}
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
                              {formatDateTime(log.createdAt as string | null | undefined)}
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
            onClick={onClose}
            className="text-xs font-bold"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
