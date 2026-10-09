import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileJson,
  RotateCcw,
  ShieldAlert,
  Upload,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DisciplineDataManagementTabProps {
  isBn: boolean;
  onExportData: () => Promise<any>;
  onImportData: (data: any) => Promise<any>;
  onResetData: () => Promise<any>;
}

export function DisciplineDataManagementTab({
  isBn,
  onExportData,
  onImportData,
  onResetData,
}: DisciplineDataManagementTabProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Import preview
  const [importedJson, setImportedJson] = useState<any | null>(null);
  const [importFileName, setImportFileName] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Reset confirmation modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await onExportData();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `cycle_discipline_backup_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      alert(isBn ? "ব্যাকআপ এক্সপোর্ট করতে সমস্যা হয়েছে।" : `Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImportError(null);
    setImportSuccessMsg(null);
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      setImportError(isBn ? "অনুগ্রহ করে একটি বৈধ .json ফাইল নির্বাচন করুন।" : "Please select a valid .json backup file.");
      return;
    }

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || typeof parsed !== "object") {
          throw new Error("Invalid backup file content");
        }
        setImportedJson(parsed);
      } catch (err) {
        setImportError(isBn ? "ফাইলটি পার্স করা যায়নি। এটি সঠিক JSON ফরম্যাটে নেই।" : "Failed to parse file: Invalid JSON format.");
        setImportedJson(null);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleConfirmImport = async () => {
    if (!importedJson) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const res = await onImportData(importedJson);
      setImportSuccessMsg(
        isBn
          ? `সফলভাবে ডেটা ইম্পোর্ট হয়েছে (${res?.count || "সব"}টি রেকর্ড অন্তর্ভুক্ত করা হয়েছে)।`
          : `Successfully imported backup (${res?.count || "all"} records restored into your account).`
      );
      setImportedJson(null);
      setImportFileName("");
    } catch (err: any) {
      setImportError(isBn ? "ইম্পোর্ট ব্যর্থ হয়েছে: " + err.message : `Import failed: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmReset = async () => {
    if (confirmText.toUpperCase() !== "RESET") return;
    setIsResetting(true);
    try {
      await onResetData();
      setShowResetModal(false);
      setConfirmText("");
      alert(isBn ? "আপনার ডিসিপ্লিন ডেটা সফলভাবে রিসেট করা হয়েছে এবং ডিফল্ট রুটিন লোড করা হয়েছে।" : "Discipline data successfully reset. Clean default routine has been reloaded.");
    } catch (err: any) {
      alert(isBn ? "রিসেট করতে সমস্যা হয়েছে: " + err.message : `Reset failed: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* EXPORT SECTION */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-[#0284c7] dark:text-sky-400" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {isBn ? "ব্যক্তিগত ডিসিপ্লিন ব্যাকআপ এক্সপোর্ট" : "Export Personal Discipline Backup"}
            </h3>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
          {isBn
            ? "আপনার সমস্ত রুটিন টাস্ক, টাস্ক সম্পন্নের ইতিহাস, ব্যায়ামের তালিকা, ডিসিপ্লিন জার্নাল এন্ট্রি এবং ফরেক্স অ্যানালাইসিস লগ একটি সুরক্ষিত JSON ফাইলে ডাউনলোড করুন।"
            : "Download a structured JSON backup of your personal schedule tasks, completion history, workouts, reflections, and Forex tracker records. Only your personal records are exported."}
        </p>

        <div className="mt-5">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2 bg-[#081833] hover:bg-[#0c244b] text-white dark:bg-sky-500 dark:text-slate-950 font-bold px-6 py-5 rounded-2xl"
          >
            <Download size={16} />
            <span>{isExporting ? (isBn ? "এক্সপোর্ট হচ্ছে..." : "Exporting...") : (isBn ? "ব্যাকআপ ডাউনলোড করুন (.json)" : "Export Discipline Backup (.json)")}</span>
          </Button>
        </div>
      </div>

      {/* IMPORT SECTION */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {isBn ? "ডিসিপ্লিন ব্যাকআপ ইম্পোর্ট ও রিস্টোর" : "Import & Restore Discipline Backup"}
            </h3>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
          {isBn
            ? "পূর্বে ডাউনলোড করা JSON ব্যাকআপ ফাইল আপলোড করে আপনার ব্যক্তিগত অ্যাকাউন্টে ডেটা রিস্টোর করুন। ফাইলটি যাচাই করার পর নিরাপদে ইম্পোর্ট করা হবে।"
            : "Upload a valid JSON backup to restore tasks, workout routines, and journal history into your account. Ownership is strictly assigned to your current session."}
        </p>

        {importError && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        {importSuccessMsg && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{importSuccessMsg}</span>
          </div>
        )}

        {/* File Picker or Preview */}
        <div className="mt-5">
          {!importedJson ? (
            <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs px-5 py-3 rounded-2xl transition">
              <Upload size={15} />
              <span>{isBn ? "JSON ফাইল নির্বাচন করুন" : "Select JSON Backup File"}</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileJson size={18} className="text-[#0284c7] dark:text-sky-400" />
                  <span className="font-extrabold text-xs">{importFileName}</span>
                </div>
                <button
                  onClick={() => {
                    setImportedJson(null);
                    setImportFileName("");
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-xl">
                  {isBn ? "টাস্ক:" : "Tasks:"} <b>{importedJson.tasks?.length || 0}</b>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-xl">
                  {isBn ? "ব্যায়াম:" : "Exercises:"} <b>{importedJson.exercises?.length || 0}</b>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-xl">
                  {isBn ? "জার্নাল:" : "Journals:"} <b>{importedJson.journals?.length || 0}</b>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-xl">
                  {isBn ? "ফরেক্স লগ:" : "Forex Logs:"} <b>{importedJson.forexLogs?.length || 0}</b>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  onClick={handleConfirmImport}
                  disabled={isImporting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  {isImporting ? (isBn ? "ইম্পোর্ট হচ্ছে..." : "Importing...") : (isBn ? "ইম্পোর্ট নিশ্চিত করুন" : "Confirm & Restore Data")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImportedJson(null);
                    setImportFileName("");
                  }}
                  className="text-xs font-bold"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RESET SECTION */}
      <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm dark:border-rose-950/50 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-rose-100 pb-3 dark:border-rose-950/40">
          <div className="flex items-center gap-2">
            <RotateCcw size={18} className="text-rose-600 dark:text-rose-400" />
            <h3 className="font-extrabold text-base text-rose-700 dark:text-rose-400">
              {isBn ? "ডিসিপ্লিন ডেটা রিসেট জোন" : "Reset Personal Discipline Data"}
            </h3>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
          {isBn
            ? "আপনার অ্যাকাউন্টের শুধুমাত্র ডেইলি ডিসিপ্লিন সম্পর্কিত টাস্ক, সম্পন্নের ইতিহাস এবং জার্নাল মুছে ফেলে প্রাথমিক ডিফল্ট অবস্থায় ফিরিয়ে আনবে। এটি আপনার মূল ওয়েবসাইট অ্যাকাউন্ট বা ট্রেডিং জার্নালকে প্রভাবিত করবে না।"
            : "Reset your personal discipline routine, task completions, and discipline journals to clean default state. This affects ONLY your Daily Discipline data and will NEVER touch your website account, purchases, or trade journal."}
        </p>

        <div className="mt-5">
          <Button
            onClick={() => setShowResetModal(true)}
            variant="outline"
            className="gap-2 border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/60 dark:hover:bg-rose-950/30 font-bold px-5 py-3 rounded-2xl"
          >
            <RotateCcw size={15} />
            <span>{isBn ? "ডিসিপ্লিন ডেটা রিসেট করুন..." : "Reset Discipline Data..."}</span>
          </Button>
        </div>
      </div>

      {/* RESET CONFIRMATION MODAL */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 border-b border-rose-100 pb-3 dark:border-rose-950">
              <ShieldAlert size={22} />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isBn ? "ডিসিপ্লিন ডেটা রিসেট নিশ্চিতকরণ" : "Confirm Discipline Reset"}
              </h3>
            </div>

            <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isBn
                ? "এই অ্যাকশনটি সম্পাদন করলে আপনার ডেইলি ডিসিপ্লিন টাস্ক হিস্ট্রি, ব্যায়ামের রেকর্ড ও জার্নালগুলো মুছে যাবে এবং ডিফল্ট রুটিন পুনরায় লোড হবে। নিশ্চিত করতে নিচে 'RESET' টাইপ করুন:"
                : "This action will clear your daily task completion history, custom exercises, and discipline journals, then restore clean defaults. To confirm, type 'RESET' below:"}
            </p>

            <div className="mt-4">
              <input
                type="text"
                placeholder="RESET"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full rounded-xl border border-rose-200 bg-rose-50/50 p-2.5 text-center font-mono font-bold text-sm tracking-widest uppercase outline-none focus:border-rose-500 dark:border-rose-900/50 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="mt-6 flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowResetModal(false);
                  setConfirmText("");
                }}
                className="font-bold text-xs"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </Button>

              <Button
                size="sm"
                disabled={confirmText.toUpperCase() !== "RESET" || isResetting}
                onClick={handleConfirmReset}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                {isResetting ? (isBn ? "রিসেট হচ্ছে..." : "Resetting...") : (isBn ? "রিসেট নিশ্চিত করুন" : "Confirm Reset")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
