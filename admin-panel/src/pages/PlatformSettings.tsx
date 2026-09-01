import React, { useState } from "react";
import { Check } from "lucide-react";

export const PlatformSettings: React.FC = () => {
  const [bkash, setBkash] = useState("01961079326");
  const [nagad, setNagad] = useState("01961079326");
  const [rocket, setRocket] = useState("01961079326");
  const [announcement, setAnnouncement] = useState("Special Eid Discount 50% Active on All Institutional Packages!");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white">Payment Gateways & System Settings</h2>
        <p className="mt-1 text-xs text-slate-400">
          Update merchant and personal payment numbers displayed across the checkout page.
        </p>
      </div>

      <form onSubmit={handleSave} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-5">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400">
            bKash Personal / Send Money Number
          </label>
          <input
            type="text"
            value={bkash}
            onChange={(e) => setBkash(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-sm font-bold text-white outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Nagad Personal / Send Money Number
          </label>
          <input
            type="text"
            value={nagad}
            onChange={(e) => setNagad(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-sm font-bold text-white outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Rocket Number
          </label>
          <input
            type="text"
            value={rocket}
            onChange={(e) => setRocket(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-sm font-bold text-white outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Platform Notice Banner
          </label>
          <input
            type="text"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-medium text-white outline-none focus:border-sky-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-sky-500 py-3 text-xs font-black text-slate-950 hover:bg-sky-400 transition"
        >
          {saved ? "Saved Settings Successfully ✓" : "Save Gateway Settings"}
        </button>
      </form>
    </div>
  );
};
