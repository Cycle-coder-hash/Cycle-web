import React from "react";
import { X, Paperclip, Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TicketDetailsModalProps {
  ticket: any | null;
  ticketModalData: any | null;
  isLoadingTicketModalData?: boolean;
  onClose: () => void;
  staffReplyText: string;
  setStaffReplyText: (text: string) => void;
  staffReplyStatus: "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
  setStaffReplyStatus: (status: "open" | "in_progress" | "waiting_user" | "resolved" | "closed") => void;
  onSendReply: (ticketId: number, message: string, status: string) => void;
  isReplying?: boolean;
}

export const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  ticket,
  ticketModalData,
  isLoadingTicketModalData,
  onClose,
  staffReplyText,
  setStaffReplyText,
  staffReplyStatus,
  setStaffReplyStatus,
  onSendReply,
  isReplying,
}) => {
  if (!ticket) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400">
                {ticket.ticketCode || `#TKT-${ticket.id}`}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {ticket.category || "General"}
              </span>
            </div>
            <h3 className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
              {ticket.subject}
            </h3>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Student: <span className="font-bold text-slate-700 dark:text-slate-300">{ticket.userName}</span> ({ticket.userEmail})
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Original Student Issue */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {ticket.userName} (Original Inquiry)
              </span>
              <span className="text-[11px] text-slate-400">
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {ticket.message}
            </p>
            {ticket.attachmentUrl && (
              <div className="mt-2.5">
                <a
                  href={ticket.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:underline dark:text-sky-400"
                >
                  <Paperclip size={13} /> View Attached Screenshot / File
                </a>
              </div>
            )}
          </div>

          {/* Replies Stream */}
          {isLoadingTicketModalData ? (
            <div className="flex items-center justify-center p-8 text-slate-400">
              <RefreshCw size={20} className="animate-spin mr-2" />
              <span>Loading conversation...</span>
            </div>
          ) : (
            (ticketModalData?.replies || []).map((r: any) => {
              const isStaff = r.senderRole === "support" || r.senderRole === "admin";
              return (
                <div
                  key={r.id}
                  className={`rounded-2xl border p-4 ${
                    isStaff
                      ? "border-sky-300 bg-sky-50/60 dark:border-sky-900/60 dark:bg-sky-950/25"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{r.senderName}</span>
                      {isStaff && (
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                          Support Team
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {r.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Staff Reply Box */}
        <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!staffReplyText.trim()) return;
              onSendReply(ticket.id, staffReplyText.trim(), staffReplyStatus);
            }}
            className="space-y-3"
          >
            <textarea
              rows={3}
              required
              placeholder="Write support response to student..."
              value={staffReplyText}
              onChange={(e) => setStaffReplyText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs font-bold text-slate-500 shrink-0">Status after reply:</label>
                <select
                  value={staffReplyStatus}
                  onChange={(e) => setStaffReplyStatus(e.target.value as any)}
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="waiting_user">Waiting for User</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Mark Resolved</option>
                  <option value="closed">Close Ticket</option>
                  <option value="open">Keep Open</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={isReplying || !staffReplyText.trim()}
                className="w-full sm:w-auto bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 font-bold text-xs"
              >
                {isReplying ? (
                  <RefreshCw size={13} className="animate-spin mr-1.5" />
                ) : (
                  <Send size={13} className="mr-1.5" />
                )}
                <span>Send Reply</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
