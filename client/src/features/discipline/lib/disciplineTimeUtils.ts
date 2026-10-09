/**
 * Discipline Task Time Utilities
 * Supports Start Time + End Time ranges, validation, formatting, and automatic status computation.
 */

export type TaskAutoStatus = "Completed" | "In Progress" | "Upcoming" | "Overdue" | null;

/**
 * 48 standard 30-minute time suggestions from 12:00 AM to 11:30 PM
 */
export const TIME_SUGGESTIONS = [
  "05:00 AM", "05:30 AM", "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM",
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM",
  "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM",
  "11:00 PM", "11:30 PM", "12:00 AM"
];

/**
 * Parse a human time string (e.g., "08:00 AM", "8:00 PM", "14:30") into minutes from midnight (0 - 1439).
 * Returns null if the time string is empty or unparseable.
 */
export function parseTimeToMinutes(timeStr?: string | null): number | null {
  if (!timeStr) return null;
  const s = timeStr.trim().toUpperCase();
  if (!s) return null;

  // Match 12-hour AM/PM formats: "8:00 AM", "08:30 PM", "8 AM", "8PM"
  const ampmMatch = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const isPm = ampmMatch[3] === "PM";

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      return null;
    }

    if (hours === 12) {
      hours = isPm ? 12 : 0;
    } else if (isPm) {
      hours += 12;
    }
    return hours * 60 + minutes;
  }

  // Match 24-hour formats: "08:00", "14:30"
  const h24Match = s.match(/^(\d{1,2}):(\d{2})$/);
  if (h24Match) {
    const hours = parseInt(h24Match[1], 10);
    const minutes = parseInt(h24Match[2], 10);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    return hours * 60 + minutes;
  }

  return null;
}

/**
 * Validate that End Time is strictly later than Start Time when both are provided.
 * Returns an error string or null if valid.
 */
export function validateTaskTimeRange(
  startTime?: string | null,
  endTime?: string | null
): string | null {
  const start = startTime?.trim();
  const end = endTime?.trim();

  // If either is omitted, no conflict can exist
  if (!start || !end) return null;

  const startMin = parseTimeToMinutes(start);
  const endMin = parseTimeToMinutes(end);

  if (startMin !== null && endMin !== null) {
    if (endMin <= startMin) {
      return "End time must be later than start time.";
    }
  }

  return null;
}

/**
 * Format task time for list / card display:
 * - Both: "08:00 AM – 10:00 AM"
 * - Start only: "Starts 08:00 AM"
 * - End only: "Ends 10:00 AM"
 * - Neither: null (do not show empty label)
 */
export function formatTaskTimeRange(
  startTime?: string | null,
  endTime?: string | null,
  legacyTime?: string | null
): string | null {
  const start = startTime?.trim();
  const end = endTime?.trim();

  if (start && end) {
    return `${start} – ${end}`;
  }
  if (start) {
    return `Starts ${start}`;
  }
  if (end) {
    return `Ends ${end}`;
  }
  // Fallback to legacy single time if present
  if (legacyTime?.trim()) {
    return `Starts ${legacyTime.trim()}`;
  }
  return null;
}

/**
 * Automatic Task Status Computation:
 * - Completed manually -> "Completed" (Manual completion takes priority)
 * - Both Start & End:
 *     Before Start -> "Upcoming"
 *     Start to End -> "In Progress"
 *     After End    -> "Overdue"
 * - Start Only:
 *     Before Start -> "Upcoming"
 *     At/after     -> "In Progress"
 * - End Only:
 *     Before End   -> "Upcoming"
 *     After End    -> "Overdue"
 * - Neither -> null (normal behavior without automatic time status)
 */
export function computeTaskStatus(
  task: {
    completed?: boolean;
    startTime?: string | null;
    endTime?: string | null;
    time?: string | null;
  },
  selectedDate?: string
): TaskAutoStatus {
  if (task.completed) {
    return "Completed";
  }

  const start = task.startTime?.trim() || (!task.endTime?.trim() && task.time?.trim() ? task.time.trim() : null);
  const end = task.endTime?.trim() || null;

  const startMin = parseTimeToMinutes(start);
  const endMin = parseTimeToMinutes(end);

  // If neither time is provided, return null
  if (startMin === null && endMin === null) {
    return null;
  }

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const targetDate = selectedDate || todayStr;

  // If viewing a previous day and task is not completed
  if (targetDate < todayStr) {
    if (endMin !== null) return "Overdue";
    return "In Progress";
  }

  // If viewing a future day
  if (targetDate > todayStr) {
    return "Upcoming";
  }

  // Viewing today: evaluate current time in minutes from midnight
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Both Start and End provided
  if (startMin !== null && endMin !== null) {
    if (currentMinutes < startMin) {
      return "Upcoming";
    }
    if (currentMinutes <= endMin) {
      return "In Progress";
    }
    return "Overdue";
  }

  // Only Start Time provided
  if (startMin !== null) {
    if (currentMinutes < startMin) {
      return "Upcoming";
    }
    return "In Progress";
  }

  // Only End Time provided
  if (endMin !== null) {
    if (currentMinutes <= endMin) {
      return "Upcoming";
    }
    return "Overdue";
  }

  return null;
}
