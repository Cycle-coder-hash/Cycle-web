import React, { useState } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Phone,
  Info,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Megaphone,
  CreditCard,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BkashLogo, NagadLogo, RocketLogo } from "@/components/payment/PaymentIcons";

export interface GatewayConfigState {
  number: string;
  accountType: "Personal" | "Merchant" | "Agent";
  isEnabled: boolean;
  instructions?: string;
}

export interface PaymentSettingsFormState {
  bkash: GatewayConfigState;
  nagad: GatewayConfigState;
  rocket: GatewayConfigState;
  announcement: string;
  isAnnouncementEnabled: boolean;
}

interface SettingsTabProps {
  paymentConfig: PaymentSettingsFormState;
  setPaymentConfig: React.Dispatch<React.SetStateAction<PaymentSettingsFormState>>;
  onSave: () => void;
  onReload: () => void;
  isLoading?: boolean;
  isSaving?: boolean;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  paymentConfig,
  setPaymentConfig,
  onSave,
  onReload,
  isLoading = false,
  isSaving = false,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewMethod, setPreviewMethod] = useState<"bkash" | "nagad" | "rocket">("bkash");

  const copyNumber = (key: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const gatewaysList: Array<{
    id: "bkash" | "nagad" | "rocket";
    name: string;
    banglaName: string;
    brandColor: string;
    bgAccent: string;
    borderAccent: string;
    logo: React.FC<{ size?: number; className?: string }>;
  }> = [
    {
      id: "bkash",
      name: "bKash",
      banglaName: "বিকাশ",
      brandColor: "#D12053",
      bgAccent: "from-[#E2136E]/10 to-[#E2136E]/5",
      borderAccent: "border-[#E2136E]/30",
      logo: BkashLogo,
    },
    {
      id: "nagad",
      name: "Nagad",
      banglaName: "নগদ",
      brandColor: "#EA580C",
      bgAccent: "from-[#F97316]/10 to-[#F97316]/5",
      borderAccent: "border-[#F97316]/30",
      logo: NagadLogo,
    },
    {
      id: "rocket",
      name: "Rocket",
      banglaName: "রকেট",
      brandColor: "#8C3494",
      bgAccent: "from-[#8C3494]/10 to-[#8C3494]/5",
      borderAccent: "border-[#8C3494]/30",
      logo: RocketLogo,
    },
  ];

  const activeCount = gatewaysList.filter((g) => paymentConfig[g.id]?.isEnabled).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight">Payment Gateways & Checkout Control CMS</h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                activeCount === 3
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : activeCount > 0
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              }`}
            >
              {activeCount} of 3 Gateways Active
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Control which payment methods (bKash, Nagad, Rocket) are enabled or hidden on the student checkout page, and update wallet numbers & instructions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={onReload}
            className="gap-1.5 text-xs font-bold border-slate-300 dark:border-slate-700"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Reload Saved</span>
          </Button>

          <a href="/checkout" target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              type="button"
              variant="ghost"
              className="gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400"
            >
              <span>View Checkout</span>
              <ExternalLink size={13} />
            </Button>
          </a>
        </div>
      </div>

      {/* Main Grid: Form Left, Preview Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left: Gateway Cards */}
        <div className="xl:col-span-7 space-y-6">
          {gatewaysList.map((gateway) => {
            const current = paymentConfig[gateway.id];
            const LogoComponent = gateway.logo;
            const isEnabled = current?.isEnabled !== false;

            return (
              <div
                key={gateway.id}
                className={`rounded-3xl border transition-all shadow-sm overflow-hidden ${
                  isEnabled
                    ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                    : "border-slate-200/60 bg-slate-50/70 dark:border-slate-800/60 dark:bg-slate-950/40 opacity-80"
                }`}
              >
                {/* Gateway Card Header */}
                <div
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b bg-gradient-to-r ${gateway.bgAccent} ${
                    isEnabled ? gateway.borderAccent : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/80 dark:border-slate-700">
                      <LogoComponent size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          {gateway.name}
                        </h3>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          ({gateway.banglaName})
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isEnabled
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                              : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                          }`}
                        >
                          {isEnabled ? "Active on Checkout" : "Disabled (Hidden)"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {isEnabled
                          ? `Students can select ${gateway.name} to complete payment.`
                          : `${gateway.name} is completely hidden from the checkout page.`}
                      </p>
                    </div>
                  </div>

                  {/* On/Off Switch */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {isEnabled ? "Enabled" : "Disabled"}
                    </span>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) =>
                        setPaymentConfig((prev) => ({
                          ...prev,
                          [gateway.id]: {
                            ...prev[gateway.id],
                            isEnabled: checked,
                          },
                        }))
                      }
                      className="data-[state=checked]:bg-emerald-500"
                      aria-label={`Toggle ${gateway.name} Payment Method`}
                    />
                  </div>
                </div>

                {/* Gateway Inputs */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    {/* Wallet Number */}
                    <div className="sm:col-span-7">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Phone size={13} className="text-sky-500" />
                        <span>{gateway.name} Number / Wallet *</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={current?.number || ""}
                          placeholder="e.g. 01961079326"
                          onChange={(e) =>
                            setPaymentConfig((prev) => ({
                              ...prev,
                              [gateway.id]: {
                                ...prev[gateway.id],
                                number: e.target.value,
                              },
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pr-10 text-sm font-bold font-mono tracking-wider outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => copyNumber(gateway.id, current?.number || "")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition"
                          title="Copy number"
                        >
                          {copiedKey === gateway.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Account Type */}
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <CreditCard size={13} className="text-sky-500" />
                        <span>Account Type</span>
                      </label>
                      <select
                        value={current?.accountType || "Personal"}
                        onChange={(e) =>
                          setPaymentConfig((prev) => ({
                            ...prev,
                            [gateway.id]: {
                              ...prev[gateway.id],
                              accountType: e.target.value as any,
                            },
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      >
                        <option value="Personal">Personal (Send Money)</option>
                        <option value="Merchant">Merchant (Make Payment)</option>
                        <option value="Agent">Agent (Cash In)</option>
                      </select>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Info size={13} className="text-sky-500" />
                      <span>Student Payment Instructions</span>
                    </label>
                    <input
                      type="text"
                      value={current?.instructions || ""}
                      placeholder={`e.g. Send Money using ${gateway.name} App, then paste TrxID below.`}
                      onChange={(e) =>
                        setPaymentConfig((prev) => ({
                          ...prev,
                          [gateway.id]: {
                            ...prev[gateway.id],
                            instructions: e.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Displayed inside the payment box when this method is selected on the checkout page.
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Announcement Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Megaphone size={18} className="text-amber-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Checkout Announcement Banner
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">
                  {paymentConfig.isAnnouncementEnabled ? "Active" : "Hidden"}
                </span>
                <Switch
                  checked={paymentConfig.isAnnouncementEnabled}
                  onCheckedChange={(checked) =>
                    setPaymentConfig((prev) => ({ ...prev, isAnnouncementEnabled: checked }))
                  }
                  aria-label="Toggle Announcement Banner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Announcement Message
              </label>
              <input
                type="text"
                value={paymentConfig.announcement}
                placeholder="e.g. Special Discount active! Send payment to official numbers only."
                onChange={(e) =>
                  setPaymentConfig((prev) => ({ ...prev, announcement: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                When enabled, appears as an ambient highlight banner above the package selection on the checkout page.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <Button
              type="button"
              disabled={isSaving}
              onClick={onSave}
              className="w-full sm:w-auto min-w-[220px] bg-[#0284c7] hover:bg-sky-600 font-extrabold text-white text-sm shadow-md py-3.5"
            >
              {isSaving && <RefreshCw size={14} className="animate-spin mr-2" />}
              <span>Save Payment Settings</span>
            </Button>
          </div>
        </div>

        {/* Right: Live Interactive Checkout Preview */}
        <div className="xl:col-span-5 xl:sticky xl:top-24 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Live Checkout Page Preview
            </span>
          </div>

          {/* Preview Container Styled Exactly Like Checkout Page */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-[#081325] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-extrabold text-[#0284c7] uppercase tracking-wider">
                Payment Section Preview
              </span>
              <span className="text-slate-400 text-[11px]">
                {activeCount} active methods
              </span>
            </div>

            {/* Announcement Banner Preview */}
            {paymentConfig.isAnnouncementEnabled && paymentConfig.announcement && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <Megaphone size={15} className="shrink-0 text-amber-500" />
                <span className="font-medium text-[11px]">{paymentConfig.announcement}</span>
              </div>
            )}

            {/* Branded Method Selector Buttons */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Select Payment Gateway
              </label>

              {activeCount === 0 ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 text-center">
                  All payment gateways are currently disabled! Please enable at least one gateway above.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {gatewaysList.map((g) => {
                    const isEnabled = paymentConfig[g.id]?.isEnabled !== false;
                    const isSelected = previewMethod === g.id;
                    const Logo = g.logo;

                    if (!isEnabled) {
                      return (
                        <div
                          key={g.id}
                          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/30 opacity-40 cursor-not-allowed text-center"
                        >
                          <Logo size={22} className="grayscale" />
                          <span className="mt-1 text-[11px] font-bold text-slate-400">
                            {g.name}
                          </span>
                          <span className="text-[9px] font-semibold text-rose-500">Disabled</span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setPreviewMethod(g.id)}
                        className={`flex flex-col items-center justify-center rounded-2xl border p-3 transition-all ${
                          isSelected
                            ? "border-sky-500 bg-sky-50/80 shadow-sm dark:bg-sky-950/40 dark:border-sky-400 ring-2 ring-sky-500/20"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                        }`}
                      >
                        <Logo size={26} />
                        <span className="mt-1 text-xs font-black text-slate-900 dark:text-white">
                          {g.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          {paymentConfig[g.id]?.accountType || "Personal"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Method Details Box Preview */}
            {paymentConfig[previewMethod] && paymentConfig[previewMethod]?.isEnabled !== false && (
              <div className="rounded-2xl border border-sky-200/80 bg-sky-50/70 p-4 dark:border-sky-900/40 dark:bg-sky-950/25 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                    Send Payment via {previewMethod.toUpperCase()}
                  </span>
                  <span className="rounded-md bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300">
                    {paymentConfig[previewMethod]?.accountType} Account
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-sky-100 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400">Account Number</div>
                    <div className="text-sm font-black font-mono tracking-wider text-slate-900 dark:text-white">
                      {paymentConfig[previewMethod]?.number || "01961079326"}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    className="h-8 gap-1 text-xs font-bold text-sky-600 hover:bg-sky-50"
                  >
                    <Copy size={12} />
                    <span>Copy</span>
                  </Button>
                </div>

                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {paymentConfig[previewMethod]?.instructions ||
                    `Send Money using ${previewMethod.toUpperCase()}, then paste your Transaction ID below.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
