import React from "react";
import { AuditEvent } from "../lib/types";

interface AuditLogsProps {
  logs: AuditEvent[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white">Security & Audit Event Log</h2>
        <p className="mt-1 text-xs text-slate-400">
          Immutable event stream recording all administrative actions, approval events, and manual overrides.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="space-y-3 font-mono text-xs">
          {logs.map((ev) => (
            <div
              key={ev.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2.5 gap-1"
            >
              <div>
                <span className="font-extrabold text-sky-400">{ev.action}</span> · Entity #{ev.entityId} (Admin #{ev.actorId})
              </div>
              <span className="text-slate-500 text-[11px]">
                {new Date(ev.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
