import React from "react";
import { Search, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SupportTabProps {
  tickets: any[];
  ticketFilter: "all" | "open" | "pending" | "in_progress" | "waiting_customer" | "waiting_user" | "solved" | "resolved" | "closed" | string;
  setTicketFilter: (filter: any) => void;
  ticketCategoryFilter: string;
  setTicketCategoryFilter: (category: string) => void;
  ticketSearch: string;
  setTicketSearch: (query: string) => void;
  onSelectTicketForModal: (ticket: any) => void;
  onUpdateTicketStatus: (ticketId: number, status: string) => void;
}

export const SupportTab: React.FC<SupportTabProps> = ({
  tickets,
  ticketFilter,
  setTicketFilter,
  ticketCategoryFilter,
  setTicketCategoryFilter,
  ticketSearch,
  setTicketSearch,
  onSelectTicketForModal,
  onUpdateTicketStatus,
}) => {
  const normStatus = (st?: string) => {
    if (!st) return "open";
    const s = st.toLowerCase().trim();
    if (s === "waiting_user") return "waiting_customer";
    if (s === "resolved") return "solved";
    return s;
  };

  const filteredTickets = (tickets || []).filter((t: any) => {
    if (ticketFilter !== "all" && normStatus(t.status) !== normStatus(ticketFilter)) return false;
    if (ticketCategoryFilter !== "all" && t.category !== ticketCategoryFilter) return false;
    if (ticketSearch.trim()) {
      const q = ticketSearch.toLowerCase();
      return (
        t.ticketCode?.toLowerCase().includes(q) ||
        t.userName?.toLowerCase().includes(q) ||
        t.userEmail?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.message?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Student Support Desk</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review, assign, and resolve student inquiries regarding courses, payments, eBooks, and access.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Total Tickets", val: (tickets || []).length, color: "text-slate-900 dark:text-white" },
          { label: "Open", val: (tickets || []).filter((t: any) => normStatus(t.status) === "open").length, color: "text-sky-600 dark:text-sky-400" },
          { label: "Pending", val: (tickets || []).filter((t: any) => normStatus(t.status) === "pending").length, color: "text-amber-600 dark:text-amber-400" },
          { label: "In Progress", val: (tickets || []).filter((t: any) => normStatus(t.status) === "in_progress").length, color: "text-indigo-600 dark:text-indigo-400" },
          { label: "Waiting Customer", val: (tickets || []).filter((t: any) => normStatus(t.status) === "waiting_customer").length, color: "text-orange-600 dark:text-orange-400" },
          { label: "Solved", val: (tickets || []).filter((t: any) => normStatus(t.status) === "solved").length, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Closed", val: (tickets || []).filter((t: any) => normStatus(t.status) === "closed").length, color: "text-slate-500" },
        ].map((m, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">{m.label}</div>
            <div className={`mt-1 text-xl font-black ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {/* Status Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All" },
            { id: "open", label: "Open" },
            { id: "pending", label: "Pending" },
            { id: "in_progress", label: "In Progress" },
            { id: "waiting_customer", label: "Waiting Customer" },
            { id: "solved", label: "Solved" },
            { id: "closed", label: "Closed" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setTicketFilter(st.id as any)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition ${
                ticketFilter === st.id
                  ? "bg-[#081833] text-white dark:bg-sky-500 dark:text-slate-950 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Category & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <select
            value={ticketCategoryFilter}
            onChange={(e) => setTicketCategoryFilter(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
          >
            <option value="all">All Categories</option>
            <option value="Course Problem">Course Problem</option>
            <option value="Payment Problem">Payment Problem</option>
            <option value="Account Problem">Account Problem</option>
            <option value="Technical Problem">Technical Problem</option>
            <option value="eBook Problem">eBook Problem</option>
            <option value="Other">Other</option>
          </select>

          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search #TKT, name, email..."
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-8 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Tickets Grid / List */}
      <div className="space-y-3">
        {filteredTickets.length ? (
          filteredTickets.map((t: any) => (
            <div
              key={t.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition hover:border-sky-300 dark:hover:border-sky-800"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400">
                      {t.ticketCode || `#TKT-${t.id}`}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {t.category || "General"}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        normStatus(t.status) === "solved"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : normStatus(t.status) === "in_progress"
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
                          : normStatus(t.status) === "pending"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                          : normStatus(t.status) === "waiting_customer"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                          : normStatus(t.status) === "closed"
                          ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          : "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400"
                      }`}
                    >
                      {normStatus(t.status).replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
                    {t.subject}
                  </h3>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{t.userName}</span>
                    <span>•</span>
                    <span>{t.userEmail}</span>
                    <span>•</span>
                    <span>Created: {new Date(t.createdAt).toLocaleString()}</span>
                    {t.assignedStaff && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-sky-600 dark:text-sky-400">Assigned: {t.assignedStaff}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => onSelectTicketForModal(t)}
                    className="bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950"
                  >
                    <MessageSquare size={13} className="mr-1.5" />
                    <span>View & Reply</span>
                  </Button>

                  <select
                    value={normStatus(t.status)}
                    onChange={(e) => onUpdateTicketStatus(t.id, e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="open">Status: Open</option>
                    <option value="pending">Status: Pending</option>
                    <option value="in_progress">Status: In Progress</option>
                    <option value="waiting_customer">Status: Waiting Customer</option>
                    <option value="solved">Status: Solved</option>
                    <option value="closed">Status: Closed</option>
                  </select>
                </div>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl line-clamp-2">
                {t.message}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            <ShieldCheck size={36} className="mx-auto text-slate-400 mb-2" />
            <div className="font-bold">No tickets found</div>
          </div>
        )}
      </div>
    </div>
  );
};
