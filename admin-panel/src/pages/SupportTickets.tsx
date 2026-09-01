import React, { useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { SupportTicket } from "../lib/types";

interface SupportTicketsProps {
  tickets: SupportTicket[];
  onUpdateStatus: (ticketId: number, status: "open" | "in_progress" | "resolved") => void;
}

export const SupportTickets: React.FC<SupportTicketsProps> = ({
  tickets,
  onUpdateStatus,
}) => {
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");

  const filtered = tickets.filter((t) => {
    if (filter !== "all" && t.status !== filter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white">Student Support Desk</h2>
        <p className="mt-1 text-xs text-slate-400">
          Review and resolve student inquiries regarding payments, access codes, and mentorship.
        </p>
      </div>

      <div className="flex gap-2">
        {(["all", "open", "in_progress", "resolved"] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition ${
              filter === st ? "bg-sky-500 text-slate-950 font-black" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {st.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((t) => (
          <div key={t.id} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-white">{t.subject}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      t.status === "resolved"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                        : t.status === "in_progress"
                        ? "bg-sky-950 text-sky-400 border border-sky-800/40"
                        : "bg-amber-950 text-amber-400 border border-amber-800/40"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  From Student #{t.userId} · Created: {new Date(t.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {t.status !== "resolved" && (
                  <button
                    onClick={() => onUpdateStatus(t.id, "resolved")}
                    className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                  >
                    <Check size={13} />
                    <span>Resolve</span>
                  </button>
                )}
                {t.status === "open" && (
                  <button
                    onClick={() => onUpdateStatus(t.id, "in_progress")}
                    className="rounded-xl border border-slate-800 px-3 py-1.5 text-xs font-bold text-slate-400 hover:bg-slate-800"
                  >
                    In Progress
                  </button>
                )}
              </div>
            </div>

            <p className="mt-4 rounded-2xl bg-slate-950/60 p-4 text-xs text-slate-300 leading-relaxed">
              {t.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
