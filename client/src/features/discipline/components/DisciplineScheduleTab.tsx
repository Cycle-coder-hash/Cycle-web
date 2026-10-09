import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Plus,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatTaskTimeRange,
  validateTaskTimeRange,
  computeTaskStatus,
  TIME_SUGGESTIONS,
} from "@/lib/disciplineTimeUtils";

interface DisciplineScheduleTabProps {
  selectedDate: string;
  onChangeDate: (d: string) => void;
  scheduleData: any;
  isLoading: boolean;
  isBn: boolean;
  onToggleTask: (taskId: number, completed: boolean) => void;
  onAddTask: (task: {
    title: string;
    startTime?: string | null;
    endTime?: string | null;
    time?: string | null;
    isMandatory: boolean;
    isTrackable: boolean;
  }) => void;
  onUpdateTask: (id: number, updates: any) => void;
  onDeleteTask: (id: number) => void;
}

export function DisciplineScheduleTab({
  selectedDate,
  onChangeDate,
  scheduleData,
  isLoading,
  isBn,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: DisciplineScheduleTabProps) {
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  // Form states (Flexible Start Time + End Time)
  const [taskTitle, setTaskTitle] = useState("");
  const [taskStartTime, setTaskStartTime] = useState("");
  const [taskEndTime, setTaskEndTime] = useState("");
  const [taskMandatory, setTaskMandatory] = useState(true);
  const [taskTrackable, setTaskTrackable] = useState(true);

  // Real-time time range validation
  const timeValidationError = useMemo(
    () => validateTaskTimeRange(taskStartTime, taskEndTime),
    [taskStartTime, taskEndTime]
  );

  // Date helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onChangeDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onChangeDate(d.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    onChangeDate(new Date().toISOString().split("T")[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  const tasks = scheduleData?.tasks || [];
  const completedCount = tasks.filter((t: any) => t.completed).length;
  const progressPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleOpenAdd = () => {
    setTaskTitle("");
    setTaskStartTime("");
    setTaskEndTime("");
    setTaskMandatory(true);
    setTaskTrackable(true);
    setShowAddModal(true);
  };

  const handleOpenEdit = (task: any) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskStartTime(task.startTime ?? (task.time || ""));
    setTaskEndTime(task.endTime ?? "");
    setTaskMandatory(task.isMandatory !== false);
    setTaskTrackable(task.isTrackable !== false);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || timeValidationError) return;
    onAddTask({
      title: taskTitle.trim(),
      startTime: taskStartTime.trim() || null,
      endTime: taskEndTime.trim() || null,
      time: taskStartTime.trim() || null,
      isMandatory: taskMandatory,
      isTrackable: taskTrackable,
    });
    setShowAddModal(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !taskTitle.trim() || timeValidationError) return;
    onUpdateTask(editingTask.id, {
      title: taskTitle.trim(),
      startTime: taskStartTime.trim() || null,
      endTime: taskEndTime.trim() || null,
      time: taskStartTime.trim() || null,
      isMandatory: taskMandatory,
      isTrackable: taskTrackable,
    });
    setEditingTask(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* DATE NAVIGATOR & ACTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevDay}
            className="size-9 rounded-xl border-slate-200 dark:border-slate-800"
            title="Previous Day"
          >
            <ChevronLeft size={18} />
          </Button>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onChangeDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />

            {!isToday && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToday}
                className="h-8 text-xs font-bold rounded-xl"
              >
                {isBn ? "আজকে ফিরুন" : "Today"}
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextDay}
            className="size-9 rounded-xl border-slate-200 dark:border-slate-800"
            title="Next Day"
          >
            <ChevronRight size={18} />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-extrabold text-slate-900 dark:text-white">
              {completedCount} / {tasks.length} {isBn ? "টাস্ক সম্পন্ন" : "Completed"}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {progressPercent}% {isBn ? "ডিসিপ্লিন স্কোর" : "Score"}
            </div>
          </div>

          <Button
            onClick={handleOpenAdd}
            size="sm"
            className="gap-1.5 bg-[#081833] hover:bg-[#0c244b] text-white dark:bg-sky-500 dark:text-slate-950 font-bold rounded-xl"
          >
            <Plus size={16} />
            <span>{isBn ? "নতুন টাস্ক যোগ করুন" : "Add Task"}</span>
          </Button>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
          <span>{isBn ? "তারিখের ডিসিপ্লিন প্রগ্রেস" : "Daily Schedule Progress"}</span>
          <span className="font-mono text-[#0284c7] dark:text-sky-400">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* TASK LIST */}
      {isLoading ? (
        <div className="py-16 text-center animate-pulse">
          <div className="mx-auto size-10 rounded-full bg-slate-200 dark:bg-slate-800 mb-2" />
          <p className="text-xs text-slate-400 font-bold">{isBn ? "টাস্ক লোড হচ্ছে..." : "Loading Tasks..."}</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-500 dark:border-slate-800">
          <AlertCircle size={36} className="mx-auto text-slate-400 mb-3" />
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            {isBn ? "কোনো টাস্ক নেই" : "No Tasks Found for this Date"}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {isBn ? "উপরে 'নতুন টাস্ক যোগ করুন' বাটনে ক্লিক করে আপনার টাস্ক যোগ করুন।" : "Click 'Add Task' above to create your personal routine."}
          </p>
          <Button onClick={handleOpenAdd} size="sm" className="mt-4 gap-1.5 font-bold">
            <Plus size={15} /> {isBn ? "টাস্ক যোগ করুন" : "Add Your First Task"}
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task: any) => {
            const isChecked = task.completed;
            const timeDisplay = formatTaskTimeRange(task.startTime, task.endTime, task.time);
            const autoStatus = computeTaskStatus(task, selectedDate);
            return (
              <div
                key={task.id}
                className={`group flex items-center justify-between rounded-2xl border p-4 transition-all duration-150 ${
                  isChecked
                    ? "border-emerald-200/80 bg-emerald-50/40 text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                }`}
              >
                {/* Left: Checkbox + Title + Time + Badges */}
                <div
                  onClick={() => onToggleTask(task.id, !isChecked)}
                  className="flex items-center gap-3.5 flex-1 cursor-pointer select-none"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id, !isChecked);
                    }}
                    className={`size-6 shrink-0 rounded-lg flex items-center justify-center border transition ${
                      isChecked
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-sky-500"
                    }`}
                  >
                    {isChecked && <Check size={14} className="stroke-[3]" />}
                  </button>

                  <div className="overflow-hidden">
                    <div
                      className={`text-sm font-extrabold transition ${
                        isChecked ? "line-through opacity-70 text-slate-500 dark:text-slate-400" : ""
                      }`}
                    >
                      {task.title}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px]">
                      {/* Time */}
                      {timeDisplay && (
                        <span className="flex items-center gap-1 font-mono font-bold text-slate-500 dark:text-slate-400">
                          <Clock size={11} />
                          <span>{timeDisplay}</span>
                        </span>
                      )}

                      {/* Automatic Status Badge */}
                      {autoStatus === "Completed" && (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-bold uppercase text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                          {isBn ? "সম্পন্ন" : "Completed"}
                        </span>
                      )}
                      {autoStatus === "In Progress" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 font-bold uppercase text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                          {isBn ? "চলমান" : "In Progress"}
                        </span>
                      )}
                      {autoStatus === "Upcoming" && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {isBn ? "আসন্ন" : "Upcoming"}
                        </span>
                      )}
                      {autoStatus === "Overdue" && (
                        <span className="rounded-md bg-rose-50 px-2 py-0.5 font-bold uppercase text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                          {isBn ? "বিলম্বিত" : "Overdue"}
                        </span>
                      )}

                      {/* Mandatory / Optional Badge */}
                      <span
                        className={`rounded-md px-2 py-0.5 font-bold uppercase ${
                          task.isMandatory !== false
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {task.isMandatory !== false
                          ? isBn
                            ? "বাধ্যতামূলক"
                            : "Mandatory"
                          : isBn
                          ? "ঐচ্ছিক"
                          : "Optional"}
                      </span>

                      {/* Trackable Status */}
                      {task.isTrackable === false && (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                          {isBn ? "নন-ট্র্যাকযোগ্য" : "Non-trackable"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions (Edit & Delete) */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Edit Task"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    onClick={() => setDeletingTaskId(task.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete Task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================================= */}
      {/* ADD TASK MODAL */}
      {/* ======================================================================= */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isBn ? "নতুন ডিসিপ্লিন টাস্ক যোগ করুন" : "Add New Task"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {isBn ? "টাস্কের শিরোনাম" : "Task Title"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isBn ? "যেমন: সকাল ৬টায় ঘুম থেকে ওঠা ও পানি পান" : "e.g. Check Economic Calendar before London open"}
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Flexible Start Time + End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {isBn ? "শুরুর সময়" : "Start Time"}
                  </label>
                  <input
                    type="text"
                    list="discipline-time-suggestions"
                    placeholder="08:00 AM"
                    value={taskStartTime}
                    onChange={(e) => setTaskStartTime(e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border bg-slate-50 p-2.5 text-xs sm:text-sm font-medium outline-none transition dark:bg-slate-950 dark:text-white ${
                      timeValidationError
                        ? "border-rose-400 focus:border-rose-500 dark:border-rose-800"
                        : "border-slate-200 focus:border-sky-500 dark:border-slate-800"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {isBn ? "শেষের সময়" : "End Time"}
                  </label>
                  <input
                    type="text"
                    list="discipline-time-suggestions"
                    placeholder="10:00 AM"
                    value={taskEndTime}
                    onChange={(e) => setTaskEndTime(e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border bg-slate-50 p-2.5 text-xs sm:text-sm font-medium outline-none transition dark:bg-slate-950 dark:text-white ${
                      timeValidationError
                        ? "border-rose-400 focus:border-rose-500 dark:border-rose-800"
                        : "border-slate-200 focus:border-sky-500 dark:border-slate-800"
                    }`}
                  />
                </div>
              </div>

              {/* Inline Validation Error */}
              {timeValidationError && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{timeValidationError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    {isBn ? "ধরন" : "Priority"}
                  </label>
                  <select
                    value={taskMandatory ? "mandatory" : "optional"}
                    onChange={(e) => setTaskMandatory(e.target.value === "mandatory")}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="mandatory">{isBn ? "বাধ্যতামূলক (Mandatory)" : "Mandatory"}</option>
                    <option value="optional">{isBn ? "ঐচ্ছিক (Optional)" : "Optional"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    {isBn ? "ট্র্যাকিং" : "Tracking"}
                  </label>
                  <select
                    value={taskTrackable ? "trackable" : "non-trackable"}
                    onChange={(e) => setTaskTrackable(e.target.value === "trackable")}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="trackable">{isBn ? "ট্র্যাকযোগ্য (Trackable)" : "Trackable"}</option>
                    <option value="non-trackable">{isBn ? "নন-ট্র্যাকযোগ্য" : "Non-trackable"}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={!!timeValidationError}
                  className="w-full bg-[#081833] hover:bg-[#0c244b] text-white dark:bg-sky-500 dark:text-slate-950 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBn ? "টাস্ক সংরক্ষণ করুন" : "Save Task"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* EDIT TASK MODAL */}
      {/* ======================================================================= */}
      {editingTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setEditingTask(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isBn ? "টাস্ক এডিট করুন" : "Edit Task"}
              </h3>
              <button
                onClick={() => setEditingTask(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {isBn ? "টাস্কের শিরোনাম" : "Task Title"}
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Flexible Start Time + End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {isBn ? "শুরুর সময়" : "Start Time"}
                  </label>
                  <input
                    type="text"
                    list="discipline-time-suggestions"
                    placeholder="08:00 AM"
                    value={taskStartTime}
                    onChange={(e) => setTaskStartTime(e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border bg-slate-50 p-2.5 text-xs sm:text-sm font-medium outline-none transition dark:bg-slate-950 dark:text-white ${
                      timeValidationError
                        ? "border-rose-400 focus:border-rose-500 dark:border-rose-800"
                        : "border-slate-200 focus:border-sky-500 dark:border-slate-800"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {isBn ? "শেষের সময়" : "End Time"}
                  </label>
                  <input
                    type="text"
                    list="discipline-time-suggestions"
                    placeholder="10:00 AM"
                    value={taskEndTime}
                    onChange={(e) => setTaskEndTime(e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border bg-slate-50 p-2.5 text-xs sm:text-sm font-medium outline-none transition dark:bg-slate-950 dark:text-white ${
                      timeValidationError
                        ? "border-rose-400 focus:border-rose-500 dark:border-rose-800"
                        : "border-slate-200 focus:border-sky-500 dark:border-slate-800"
                    }`}
                  />
                </div>
              </div>

              {/* Inline Validation Error */}
              {timeValidationError && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{timeValidationError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    {isBn ? "ধরন" : "Priority"}
                  </label>
                  <select
                    value={taskMandatory ? "mandatory" : "optional"}
                    onChange={(e) => setTaskMandatory(e.target.value === "mandatory")}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="mandatory">{isBn ? "বাধ্যতামূলক (Mandatory)" : "Mandatory"}</option>
                    <option value="optional">{isBn ? "ঐচ্ছিক (Optional)" : "Optional"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    {isBn ? "ট্র্যাকিং" : "Tracking"}
                  </label>
                  <select
                    value={taskTrackable ? "trackable" : "non-trackable"}
                    onChange={(e) => setTaskTrackable(e.target.value === "trackable")}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="trackable">{isBn ? "ট্র্যাকযোগ্য (Trackable)" : "Trackable"}</option>
                    <option value="non-trackable">{isBn ? "নন-ট্র্যাকযোগ্য" : "Non-trackable"}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={!!timeValidationError}
                  className="w-full bg-[#081833] hover:bg-[#0c244b] text-white dark:bg-sky-500 dark:text-slate-950 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBn ? "আপডেট সংরক্ষণ করুন" : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ======================================================================= */}
      {deletingTaskId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setDeletingTaskId(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isBn ? "টাস্ক ডিলিট করতে চান?" : "Delete this Task?"}
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isBn
                ? "এই টাস্কটি আপনার তালিকা থেকে মুছে ফেলা হবে। আপনি কি নিশ্চিত?"
                : "This task will be removed from your daily routine list. Are you sure?"}
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingTaskId(null)}
                className="font-bold text-xs"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (deletingTaskId) onDeleteTask(deletingTaskId);
                  setDeletingTaskId(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                {isBn ? "ডিলিট করুন" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Time suggestions datalist */}
      <datalist id="discipline-time-suggestions">
        {TIME_SUGGESTIONS.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </div>
  );
}
