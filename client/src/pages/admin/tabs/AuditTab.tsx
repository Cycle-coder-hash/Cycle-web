import React from "react";

interface AuditTabProps {
  auditLogs: any[];
}

export const AuditTab: React.FC<AuditTabProps> = ({ auditLogs }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-black tracking-tight">Security & Audit Event Log</h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Immutable event stream recording all administrative actions, approval events, and manual overrides.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-3 font-mono text-xs">
          {(auditLogs || []).map((ev: any) => (
            <div
              key={ev.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800 gap-1"
            >
              <div>
                <span className="font-extrabold text-[#0284c7] dark:text-sky-400">{ev.action}</span> · Entity #{ev.entityId} (Actor #{ev.actorId})
              </div>
              <span className="text-slate-400 text-[11px]">
                {new Date(ev.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
          {(!auditLogs || auditLogs.length === 0) && (
            <div className="py-6 text-center text-slate-400 font-sans">
              No audit log entries recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
