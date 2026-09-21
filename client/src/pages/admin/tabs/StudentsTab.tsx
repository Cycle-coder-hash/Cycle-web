import React from "react";
import { Search, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}) => {
  const filteredStudents = (students || []).filter((s: any) => {
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      return (
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Students & Access Entitlements</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            View student profiles, assign administrative roles, and manually grant or revoke digital packages.
          </p>
        </div>
      </div>

      {/* Student Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students by name, email, or phone..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      {/* Students Table / Grid */}
      <div className="space-y-3">
        {filteredStudents.length ? (
          filteredStudents.map((s: any) => (
            <div
              key={s.id}
              className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[#081833] font-bold text-white dark:bg-sky-500 dark:text-slate-950 shrink-0">
                  {s.name ? s.name[0].toUpperCase() : "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm">{s.name || "Student"}</span>
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
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {s.email} {s.phone ? `· ${s.phone}` : ""}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    Joined: {new Date(s.createdAt).toLocaleDateString()} · Orders: {s.ordersCount || 0}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 md:border-t-0 md:pt-0 dark:border-slate-800">
                <Button
                  size="sm"
                  onClick={() => onOpenGrantAccess(s)}
                  className="bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950"
                >
                  <UserPlus size={13} className="mr-1.5" />
                  <span>Grant Access</span>
                </Button>

                <select
                  value={s.role}
                  onChange={(e) => onUpdateRole(s.id, e.target.value as any)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="user">Role: User</option>
                  <option value="support">Role: Support</option>
                  <option value="admin">Role: Admin</option>
                </select>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            <Users size={36} className="mx-auto text-slate-400 mb-2" />
            <div className="font-bold">No students found</div>
          </div>
        )}
      </div>
    </div>
  );
};
