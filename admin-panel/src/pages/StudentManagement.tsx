import React, { useState } from "react";
import { Users, Search, UserPlus, Shield } from "lucide-react";
import { Student } from "../lib/types";

interface StudentManagementProps {
  students: Student[];
  onGrantAccess: (studentId: number, bundleId: number) => void;
  onUpdateRole: (studentId: number, role: "user" | "support" | "admin") => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  onGrantAccess,
  onUpdateRole,
}) => {
  const [search, setSearch] = useState("");
  const [grantModalStudent, setGrantModalStudent] = useState<Student | null>(null);
  const [selectedBundleId, setSelectedBundleId] = useState<number>(3);

  const filtered = students.filter((s) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white">Student & Access Management</h2>
        <p className="mt-1 text-xs text-slate-400">
          View enrolled students, change administrative privileges, and manually provision educational packages.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="relative">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search students by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pr-4 pl-9 text-xs font-medium text-white outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 md:flex-row md:items-center"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-500 font-mono text-sm font-bold text-slate-950">
                {s.name ? s.name[0].toUpperCase() : "U"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white">{s.name || "Student"}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                      s.role === "admin"
                        ? "bg-purple-950 text-purple-400 border border-purple-800/40"
                        : s.role === "support"
                        ? "bg-sky-950 text-sky-400 border border-sky-800/40"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {s.role}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {s.email} {s.phone ? `· ${s.phone}` : ""}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Joined: {new Date(s.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-slate-800 pt-3 md:border-t-0 md:pt-0">
              <button
                onClick={() => setGrantModalStudent(s)}
                className="flex items-center gap-1 rounded-xl bg-sky-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-sky-400 transition"
              >
                <UserPlus size={13} />
                <span>Grant Access</span>
              </button>

              <select
                value={s.role}
                onChange={(e) => onUpdateRole(s.id, e.target.value as any)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-white outline-none"
              >
                <option value="user">Role: User</option>
                <option value="support">Role: Support</option>
                <option value="admin">Role: Admin</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Grant Access Modal */}
      {grantModalStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setGrantModalStudent(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-extrabold text-white">
              Grant Access to {grantModalStudent.name || grantModalStudent.email}
            </h3>
            <p className="mt-2 text-xs text-slate-400">
              Select the bundle or course package to unlock for this student:
            </p>

            <select
              value={selectedBundleId}
              onChange={(e) => setSelectedBundleId(parseInt(e.target.value))}
              className="mt-4 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs font-bold text-white outline-none"
            >
              <option value={3}>Master Full Bundle (All 15 PDFs + Course + eBook)</option>
              <option value={2}>Course + Free Institutional eBook</option>
              <option value={1}>15-PDF Institutional Library Package</option>
            </select>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setGrantModalStudent(null)}
                className="w-1/2 rounded-xl border border-slate-800 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onGrantAccess(grantModalStudent.id, selectedBundleId);
                  setGrantModalStudent(null);
                }}
                className="w-1/2 rounded-xl bg-emerald-500 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                Confirm Grant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
