import { useState, useMemo } from "react";
import {
  BarChart3,
  Calendar,
  ClipboardList,
  Dumbbell,
  FileText,
  Home,
  LineChart,
  Settings,
  Database,
  Sparkles,
  Flame,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { DisciplineDashboardTab } from "./DisciplineDashboardTab";
import { DisciplineScheduleTab } from "./DisciplineScheduleTab";
import { DisciplineWorkoutTab } from "./DisciplineWorkoutTab";
import { DisciplineJournalTab } from "./DisciplineJournalTab";
import { DisciplineForexTrackerTab } from "./DisciplineForexTrackerTab";
import { DisciplineStatsTab } from "./DisciplineStatsTab";
import { DisciplineSettingsTab } from "./DisciplineSettingsTab";
import { DisciplineDataManagementTab } from "./DisciplineDataManagementTab";
import { UpgradeModal, UpgradeFeatureType } from "@/components/subscription/UpgradeModal";

interface DailyDisciplineMasterProps {
  user: any;
  isBn: boolean;
  initialTab?: string;
}

export function DailyDisciplineMaster({
  user,
  isBn,
  initialTab = "dashboard",
}: DailyDisciplineMasterProps) {
  // Current internal tab
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "schedule" | "workout" | "journal" | "forex" | "stats" | "settings" | "data"
  >((initialTab as any) || "dashboard");

  // Global selected date for schedule/workout/journal/forex
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Subscription state & upgrade modal
  const utils = trpc.useUtils();
  const { data: subUsage } = trpc.subscription.getMyUsage.useQuery(undefined, { enabled: !!user });
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<UpgradeFeatureType>("generic");

  // ============================================================================
  // TRPC QUERIES
  // ============================================================================
  const {
    data: scheduleData,
    isLoading: isScheduleLoading,
    refetch: refetchSchedule,
  } = trpc.customer.disciplineSchedule.useQuery(
    { date: selectedDate },
    { enabled: !!user }
  );

  const {
    data: workoutData,
    isLoading: isWorkoutLoading,
    refetch: refetchWorkouts,
  } = trpc.customer.disciplineWorkouts.useQuery(
    { date: selectedDate },
    { enabled: !!user }
  );

  const {
    data: journalsData,
    isLoading: isJournalsLoading,
    refetch: refetchJournals,
  } = trpc.customer.disciplineJournals.useQuery(undefined, { enabled: !!user });

  const {
    data: forexLogsData,
    isLoading: isForexLoading,
    refetch: refetchForex,
  } = trpc.customer.disciplineForexLogs.useQuery(undefined, { enabled: !!user });

  const {
    data: settingsData,
    isLoading: isSettingsLoading,
    refetch: refetchSettings,
  } = trpc.customer.disciplineSettings.useQuery(undefined, { enabled: !!user });

  const {
    data: statsData,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = trpc.customer.disciplineStats.useQuery(undefined, { enabled: !!user });

  // ============================================================================
  // TRPC MUTATIONS
  // ============================================================================
  const addTaskMutation = trpc.customer.addDisciplineTask.useMutation({
    onSuccess: () => {
      refetchSchedule();
      refetchStats();
    },
  });

  const updateTaskMutation = trpc.customer.updateDisciplineTask.useMutation({
    onSuccess: () => {
      refetchSchedule();
      refetchStats();
    },
  });

  const deleteTaskMutation = trpc.customer.deleteDisciplineTask.useMutation({
    onSuccess: () => {
      refetchSchedule();
      refetchStats();
    },
  });

  const toggleTaskMutation = trpc.customer.toggleDisciplineTask.useMutation({
    onSuccess: () => {
      refetchSchedule();
      refetchStats();
      utils.subscription.getMyUsage.invalidate();
    },
    onError: (err) => {
      if (err.data?.code === "FORBIDDEN") {
        setUpgradeFeature("discipline_limit");
        setIsUpgradeModalOpen(true);
      }
    },
  });

  const addExerciseMutation = trpc.customer.addDisciplineExercise.useMutation({
    onSuccess: () => {
      refetchWorkouts();
      refetchStats();
      utils.subscription.getMyUsage.invalidate();
    },
    onError: (err) => {
      if (err.data?.code === "FORBIDDEN") {
        setUpgradeFeature("workout");
        setIsUpgradeModalOpen(true);
      }
    },
  });

  const updateExerciseMutation = trpc.customer.updateDisciplineExercise.useMutation({
    onSuccess: () => {
      refetchWorkouts();
      refetchStats();
    },
  });

  const deleteExerciseMutation = trpc.customer.deleteDisciplineExercise.useMutation({
    onSuccess: () => {
      refetchWorkouts();
      refetchStats();
    },
  });

  const toggleExerciseMutation = trpc.customer.toggleDisciplineWorkout.useMutation({
    onSuccess: () => {
      refetchWorkouts();
      refetchStats();
      utils.subscription.getMyUsage.invalidate();
    },
    onError: (err) => {
      if (err.data?.code === "FORBIDDEN") {
        setUpgradeFeature("workout");
        setIsUpgradeModalOpen(true);
      }
    },
  });

  const saveJournalMutation = trpc.customer.saveDisciplineJournal.useMutation({
    onSuccess: () => {
      refetchJournals();
      refetchStats();
    },
  });

  const deleteJournalMutation = trpc.customer.deleteDisciplineJournal.useMutation({
    onSuccess: () => {
      refetchJournals();
      refetchStats();
    },
  });

  const saveForexMutation = trpc.customer.saveDisciplineForexLog.useMutation({
    onSuccess: () => {
      refetchForex();
      refetchStats();
    },
  });

  const deleteForexMutation = trpc.customer.deleteDisciplineForexLog.useMutation({
    onSuccess: () => {
      refetchForex();
      refetchStats();
    },
  });

  const updateSettingsMutation = trpc.customer.updateDisciplineSettings.useMutation({
    onSuccess: () => {
      refetchSettings();
      refetchStats();
    },
  });

  const exportDataMutation = trpc.customer.exportDisciplineData.useMutation();
  const importDataMutation = trpc.customer.importDisciplineData.useMutation({
    onSuccess: () => {
      refetchSchedule();
      refetchWorkouts();
      refetchJournals();
      refetchForex();
      refetchSettings();
      refetchStats();
    },
  });

  const resetDataMutation = trpc.customer.resetDisciplineData.useMutation({
    onSuccess: () => {
      refetchSchedule();
      refetchWorkouts();
      refetchJournals();
      refetchForex();
      refetchSettings();
      refetchStats();
    },
  });

  // Nav tab definitions
  const disciplineNavItems = useMemo(
    () => [
      { id: "dashboard", labelEn: "Home / Overview", labelBn: "হোম / ওভারভিউ", icon: Home },
      { id: "schedule", labelEn: "Today's Schedule", labelBn: "আজকের শিডিউল", icon: ClipboardList },
      { id: "workout", labelEn: "Workout & Timer", labelBn: "ওয়ার্কআউট ও টাইমার", icon: Dumbbell },
      { id: "journal", labelEn: "Discipline Journal", labelBn: "ডিসিপ্লিন জার্নাল", icon: FileText },
      { id: "forex", labelEn: "Forex Tracker", labelBn: "ফরেক্স ট্র্যাকার", icon: LineChart },
      { id: "stats", labelEn: "Stats & Analytics", labelBn: "পরিসংখ্যান", icon: BarChart3 },
      { id: "settings", labelEn: "Settings", labelBn: "সেটিংস", icon: Settings },
      { id: "data", labelEn: "Data Management", labelBn: "ডেটা ম্যানেজমেন্ট", icon: Database },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#0284c7] dark:text-sky-400">
              TRADER DISCIPLINE PROTOCOL
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
              <Flame size={13} />
              <span>{statsData?.currentStreak ?? 0} {isBn ? "দিনের স্ট্রিক" : "Day Streak"}</span>
            </span>
          </div>

          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {isBn ? "ডেইলি ডিসিপ্লিন ও রুটিন সিস্টেম" : "Daily Trader Discipline System"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? "একজন প্রফেশনাল ট্রেডারের প্রতিদিনের শিডিউল, শারীরিক রুটিন, জার্নালিং এবং চার্ট অ্যানালাইসিস ম্যানেজমেন্ট।"
              : "Master the daily loop of professional trading: Routine Execution → Physical Stamina → Mindset Reflection → Chart Study."}
          </p>
        </div>
      </div>

      {/* INTERNAL NAVIGATION TABS BAR */}
      <div className="overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
          {disciplineNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all duration-200 ${
                  isActive
                    ? "bg-[#081833] text-white shadow-md dark:bg-sky-500 dark:text-slate-950"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon size={15} />
                <span>{isBn ? item.labelBn : item.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* INTERNAL TAB CONTENT */}
      <div>
        {/* 1. HOME / OVERVIEW */}
        {activeTab === "dashboard" && (
          <DisciplineDashboardTab
            stats={statsData}
            isLoading={isStatsLoading}
            isBn={isBn}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* 2. TODAY'S SCHEDULE */}
        {activeTab === "schedule" && (
          <DisciplineScheduleTab
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
            scheduleData={scheduleData}
            isLoading={isScheduleLoading}
            isBn={isBn}
            onToggleTask={(taskId, completed) => {
              if (completed && subUsage && subUsage.disciplineDaysLimit !== "unlimited") {
                if (subUsage.disciplineDaysCount >= subUsage.disciplineDaysLimit) {
                  setUpgradeFeature("discipline_limit");
                  setIsUpgradeModalOpen(true);
                  return;
                }
              }
              toggleTaskMutation.mutate({ taskId, date: selectedDate, completed });
            }}
            onAddTask={(task) => addTaskMutation.mutate(task)}
            onUpdateTask={(id, updates) => updateTaskMutation.mutate({ id, updates })}
            onDeleteTask={(id) => deleteTaskMutation.mutate({ id })}
          />
        )}

        {/* 3. WORKOUT */}
        {activeTab === "workout" && (
          <DisciplineWorkoutTab
            selectedDate={selectedDate}
            workoutData={workoutData}
            isLoading={isWorkoutLoading}
            isBn={isBn}
            isLocked={!!subUsage?.isWorkoutLocked}
            onUpgradeClick={() => {
              setUpgradeFeature("workout");
              setIsUpgradeModalOpen(true);
            }}
            onToggleExercise={(exerciseId, completed) =>
              toggleExerciseMutation.mutate({ exerciseId, date: selectedDate, completed })
            }
            onAddExercise={(ex) => addExerciseMutation.mutate(ex)}
            onUpdateExercise={(id, updates) => updateExerciseMutation.mutate({ id, updates })}
            onDeleteExercise={(id) => deleteExerciseMutation.mutate({ id })}
          />
        )}

        {/* 4. DISCIPLINE JOURNAL */}
        {activeTab === "journal" && (
          <DisciplineJournalTab
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
            journals={journalsData || []}
            isLoading={isJournalsLoading}
            isBn={isBn}
            onSaveJournal={(date, content) => saveJournalMutation.mutate({ date, content })}
            onDeleteJournal={(id) => deleteJournalMutation.mutate({ id })}
          />
        )}

        {/* 5. FOREX ANALYSIS TRACKER */}
        {activeTab === "forex" && (
          <DisciplineForexTrackerTab
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
            forexLogs={forexLogsData || []}
            settings={settingsData}
            isLoading={isForexLoading}
            isBn={isBn}
            onSaveLog={(date, minutes, pairs, notes) =>
              saveForexMutation.mutate({ date, minutes, pairs, notes })
            }
            onDeleteLog={(id) => deleteForexMutation.mutate({ id })}
          />
        )}

        {/* 6. STATS & ANALYTICS */}
        {activeTab === "stats" && (
          <DisciplineStatsTab
            stats={statsData}
            isLoading={isStatsLoading}
            isBn={isBn}
            onSelectDate={(d) => {
              setSelectedDate(d);
              setActiveTab("schedule");
            }}
          />
        )}

        {/* 7. SETTINGS */}
        {activeTab === "settings" && (
          <DisciplineSettingsTab
            settings={settingsData}
            tasks={scheduleData?.tasks || []}
            exercises={workoutData?.exercises || []}
            isLoading={isSettingsLoading}
            isBn={isBn}
            onUpdateSettings={(updates) => updateSettingsMutation.mutate(updates)}
            onAddTask={(t) => addTaskMutation.mutate(t)}
            onDeleteTask={(id) => deleteTaskMutation.mutate({ id })}
            onAddExercise={(e) => addExerciseMutation.mutate(e)}
            onDeleteExercise={(id) => deleteExerciseMutation.mutate({ id })}
          />
        )}

        {/* 8. DATA MANAGEMENT */}
        {activeTab === "data" && (
          <DisciplineDataManagementTab
            isBn={isBn}
            onExportData={() => exportDataMutation.mutateAsync()}
            onImportData={(data) => importDataMutation.mutateAsync({ data })}
            onResetData={() => resetDataMutation.mutateAsync()}
          />
        )}
      </div>

      {/* Subscription Access / Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        feature={upgradeFeature}
        currentPlan={subUsage?.plan}
      />
    </div>
  );
}
