/**
 * Forex Market Sessions Logic
 * Dynamic, DST-aware timezone calculations using native Intl APIs.
 * Zero hardcoded offsets or season dates.
 */

export interface CitySessionConfig {
  id: "sydney" | "tokyo" | "london" | "newyork";
  city: string;
  country: string;
  timeZone: string;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
  color: string;
  locale: string;
}

export const FOREX_SESSIONS: CitySessionConfig[] = [
  {
    id: "sydney",
    city: "Sydney",
    country: "Australia",
    timeZone: "Australia/Sydney",
    openHour: 7,
    openMinute: 0,
    closeHour: 16,
    closeMinute: 0,
    color: "#8b7cff",
    locale: "en-AU",
  },
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    timeZone: "Asia/Tokyo",
    openHour: 9,
    openMinute: 0,
    closeHour: 18,
    closeMinute: 0,
    color: "#ff6b9d",
    locale: "ja-JP",
  },
  {
    id: "london",
    city: "London",
    country: "United Kingdom",
    timeZone: "Europe/London",
    openHour: 8,
    openMinute: 0,
    closeHour: 17,
    closeMinute: 0,
    color: "#38bdf8",
    locale: "en-GB",
  },
  {
    id: "newyork",
    city: "New York",
    country: "United States",
    timeZone: "America/New_York",
    openHour: 8,
    openMinute: 0,
    closeHour: 17,
    closeMinute: 0,
    color: "#34d399",
    locale: "en-US",
  },
];

export interface SessionCalculatedState {
  config: CitySessionConfig;
  isOpen: boolean;
  isOpeningSoon: boolean;
  status: "open" | "opening_soon" | "closed";
  openUtc: Date;
  closeUtc: Date;
  nextOpenUtc: Date;
  zoneLabel: string;
  progressPercent: number;
  countdownCaption: "closes in" | "opens in";
  countdownFormatted: string;
  countdownMinutes: number;
  userHoursFormatted: string;
  localHoursFormatted: string;
  upcomingClockChange: {
    changes: boolean;
    dateStr: string;
    date: Date;
    hoursShift: number;
  } | null;
}

export type MarketActivityLevel = "quiet" | "low" | "medium" | "high";

export interface WeekendMarketState {
  isClosed: boolean;
  closesAtUtc: Date;
  reopensAtUtc: Date;
  msUntilReopen: number;
  reopenCountdownFormatted: string;
}

/**
 * Returns the exact difference in ms: (Time in timeZone) - (Time in UTC)
 * A positive offset means ahead of UTC (e.g. UTC+6 -> +21,600,000ms).
 */
export function getTimeZoneOffset(date: Date, timeZone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const p: Record<string, string> = {};
    for (const part of parts) {
      p[part.type] = part.value;
    }
    const asUtc = Date.UTC(
      parseInt(p.year, 10),
      parseInt(p.month, 10) - 1,
      parseInt(p.day, 10),
      parseInt(p.hour === "24" ? "0" : p.hour, 10),
      parseInt(p.minute, 10),
      parseInt(p.second, 10)
    );
    return asUtc - date.getTime();
  } catch (err) {
    return 0;
  }
}

/**
 * Given a local year, month, day, hour, minute in a specified IANA timeZone,
 * returns the precise UTC Date object representing that instant.
 * Handles DST shifts cleanly by refining the guess with the actual offset.
 */
export function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const guessUtcMs = Date.UTC(year, month - 1, day, hour, minute);
  const offset = getTimeZoneOffset(new Date(guessUtcMs), timeZone);
  const refinedUtcMs = guessUtcMs - offset;
  const offsetRefined = getTimeZoneOffset(new Date(refinedUtcMs), timeZone);
  return new Date(guessUtcMs - offsetRefined);
}

/**
 * Given a target UTC date, extracts the local date components (year, month, day) in the specified timeZone.
 */
export function getLocalDateParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    weekday: "short",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const p: Record<string, string> = {};
  for (const part of parts) {
    p[part.type] = part.value;
  }
  return {
    year: parseInt(p.year, 10),
    month: parseInt(p.month, 10),
    day: parseInt(p.day, 10),
    hour: parseInt(p.hour === "24" ? "0" : p.hour, 10),
    minute: parseInt(p.minute, 10),
  };
}

/**
 * Derives the session's open & close UTC times for the target date.
 * If targetDate is already past the close time, returns the current day's session
 * and the next day's open time for countdown purposes.
 */
export function getSessionTimesUtc(
  referenceDate: Date,
  session: CitySessionConfig
): { openUtc: Date; closeUtc: Date; nextOpenUtc: Date } {
  const localParts = getLocalDateParts(referenceDate, session.timeZone);

  // Today's session in the city
  let openUtc = zonedDateTimeToUtc(
    localParts.year,
    localParts.month,
    localParts.day,
    session.openHour,
    session.openMinute,
    session.timeZone
  );

  let closeUtc = zonedDateTimeToUtc(
    localParts.year,
    localParts.month,
    localParts.day,
    session.closeHour,
    session.closeMinute,
    session.timeZone
  );

  // If closeHour is less than openHour (crosses local midnight), close is next calendar day
  if (session.closeHour < session.openHour) {
    closeUtc = new Date(closeUtc.getTime() + 86400000);
  }

  // Next open time
  let nextOpenUtc = new Date(openUtc.getTime() + 86400000);
  // Recalculate accurately with DST
  const nextParts = getLocalDateParts(new Date(referenceDate.getTime() + 86400000), session.timeZone);
  nextOpenUtc = zonedDateTimeToUtc(
    nextParts.year,
    nextParts.month,
    nextParts.day,
    session.openHour,
    session.openMinute,
    session.timeZone
  );

  // If the session has already completed for today and now is past closeUtc,
  // or if we are before today's open, adjust so openUtc / closeUtc represent the active or upcoming window
  if (referenceDate.getTime() > closeUtc.getTime()) {
    openUtc = nextOpenUtc;
    closeUtc = zonedDateTimeToUtc(
      nextParts.year,
      nextParts.month,
      nextParts.day,
      session.closeHour,
      session.closeMinute,
      session.timeZone
    );
    if (session.closeHour < session.openHour) {
      closeUtc = new Date(closeUtc.getTime() + 86400000);
    }
    const dayAfter = getLocalDateParts(new Date(referenceDate.getTime() + 2 * 86400000), session.timeZone);
    nextOpenUtc = zonedDateTimeToUtc(
      dayAfter.year,
      dayAfter.month,
      dayAfter.day,
      session.openHour,
      session.openMinute,
      session.timeZone
    );
  } else if (referenceDate.getTime() < openUtc.getTime()) {
    // Before today's open, next open is today's open
    nextOpenUtc = openUtc;
  }

  return { openUtc, closeUtc, nextOpenUtc };
}

/**
 * Standard session open & close for a specific calendar date (used for fixtures and timeline display).
 */
export function getStandardSessionTimesUtcForDate(
  year: number,
  month: number,
  day: number,
  session: CitySessionConfig
): { openUtc: Date; closeUtc: Date } {
  const openUtc = zonedDateTimeToUtc(
    year,
    month,
    day,
    session.openHour,
    session.openMinute,
    session.timeZone
  );
  let closeUtc = zonedDateTimeToUtc(
    year,
    month,
    day,
    session.closeHour,
    session.closeMinute,
    session.timeZone
  );
  if (session.closeHour < session.openHour) {
    closeUtc = new Date(closeUtc.getTime() + 86400000);
  }
  return { openUtc, closeUtc };
}

/**
 * Computes the zone label dynamically using Intl.
 * e.g. "BST · UTC+1", "AEDT · UTC+11", "EDT · UTC-4", "JST · UTC+9", "GMT · UTC+0".
 */
export function getZoneLabel(date: Date, timeZone: string, locale = "en-US"): string {
  try {
    const parts = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: "short" }).formatToParts(date);
    const longParts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" }).formatToParts(date);

    const shortTz = parts.find((p) => p.type === "timeZoneName")?.value || "";
    const longTz = longParts.find((p) => p.type === "timeZoneName")?.value || "";

    let offset = longTz.replace("GMT", "UTC");
    if (offset === "UTC") offset = "UTC+0";

    const m = offset.match(/^UTC([+-])(\d{2}):(\d{2})$/);
    if (m) {
      const sign = m[1];
      const h = parseInt(m[2], 10);
      const min = parseInt(m[3], 10);
      if (min > 0) {
        offset = `UTC${sign}${h}:${min < 10 ? "0" + min : min}`;
      } else {
        offset = `UTC${sign}${h}`;
      }
    }

    if (/^[A-Z]{2,5}$/.test(shortTz)) {
      return `${shortTz} · ${offset}`;
    }
    return offset;
  } catch (err) {
    return "UTC";
  }
}

/**
 * Checks whether the city's timezone clocks change within the next 7 days.
 * Returns information about the change if detected.
 */
export function getUpcomingClockChange(
  date: Date,
  timeZone: string,
  daysAhead = 7
): { changes: boolean; dateStr: string; date: Date; hoursShift: number } | null {
  try {
    const currentOffset = getTimeZoneOffset(date, timeZone);

    for (let day = 1; day <= daysAhead; day++) {
      const probeDate = new Date(date.getTime() + day * 86400000);
      const probeOffset = getTimeZoneOffset(probeDate, timeZone);

      if (probeOffset !== currentOffset) {
        // Transition detected between (day - 1) and (day). Binary search exact transition.
        let low = date.getTime() + (day - 1) * 86400000;
        let high = probeDate.getTime();
        while (high - low > 3600000) {
          const mid = Math.floor((low + high) / 2);
          if (getTimeZoneOffset(new Date(mid), timeZone) === currentOffset) {
            low = mid;
          } else {
            high = mid;
          }
        }

        const transitionDate = new Date(high);
        const shiftHours = Math.round(Math.abs(probeOffset - currentOffset) / 3600000);

        const dateStr = new Intl.DateTimeFormat("en-US", {
          timeZone,
          day: "numeric",
          month: "short",
        }).format(transitionDate);

        return {
          changes: true,
          dateStr,
          date: transitionDate,
          hoursShift: shiftHours,
        };
      }
    }
  } catch (e) {
    // Ignore error
  }
  return null;
}

/**
 * Determines whether the Forex market is closed for the weekend.
 * Rule: Closed from Friday 17:00 New York time to Sunday 17:00 New York time (DST-aware).
 */
export function isWeekendMarketClosed(now: Date): WeekendMarketState {
  const nyZone = "America/New_York";
  const nyParts = getLocalDateParts(now, nyZone);

  // Get Day of Week in NY: 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  const dayFormatter = new Intl.DateTimeFormat("en-US", { timeZone: nyZone, weekday: "short" });
  const dayName = dayFormatter.format(now);
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayOfWeek = dayMap[dayName] ?? 1;

  let closesAtUtc: Date;
  let reopensAtUtc: Date;
  let isClosed = false;

  if (dayOfWeek === 5) {
    // Friday
    const friClose = zonedDateTimeToUtc(nyParts.year, nyParts.month, nyParts.day, 17, 0, nyZone);
    const sunReopen = zonedDateTimeToUtc(nyParts.year, nyParts.month, nyParts.day + 2, 17, 0, nyZone);
    closesAtUtc = friClose;
    reopensAtUtc = sunReopen;
    if (now.getTime() >= friClose.getTime()) {
      isClosed = true;
    }
  } else if (dayOfWeek === 6) {
    // Saturday
    const friClose = zonedDateTimeToUtc(nyParts.year, nyParts.month, nyParts.day - 1, 17, 0, nyZone);
    const sunReopen = zonedDateTimeToUtc(nyParts.year, nyParts.month, nyParts.day + 1, 17, 0, nyZone);
    closesAtUtc = friClose;
    reopensAtUtc = sunReopen;
    isClosed = true;
  } else if (dayOfWeek === 0) {
    // Sunday
    const friClose = zonedDateTimeToUtc(nyParts.year, nyParts.month, nyParts.day - 2, 17, 0, nyZone);
    const sunReopen = zonedDateTimeToUtc(nyParts.year, nyParts.month, nyParts.day, 17, 0, nyZone);
    closesAtUtc = friClose;
    reopensAtUtc = sunReopen;
    if (now.getTime() < sunReopen.getTime()) {
      isClosed = true;
    }
  } else {
    // Mon - Thu: open
    // For calculation reference, nearest upcoming Friday close
    const daysUntilFri = 5 - dayOfWeek;
    closesAtUtc = zonedDateTimeToUtc(nyParts.year, nyParts.month, nyParts.day + daysUntilFri, 17, 0, nyZone);
    reopensAtUtc = zonedDateTimeToUtc(nyParts.year, nyParts.month, nyParts.day + daysUntilFri + 2, 17, 0, nyZone);
    isClosed = false;
  }

  const msUntilReopen = Math.max(0, reopensAtUtc.getTime() - now.getTime());
  const hours = Math.floor(msUntilReopen / (1000 * 60 * 60));
  const mins = Math.floor((msUntilReopen % (1000 * 60 * 60)) / (1000 * 60));

  return {
    isClosed,
    closesAtUtc,
    reopensAtUtc,
    msUntilReopen,
    reopenCountdownFormatted: `${hours}h ${mins}m`,
  };
}

/**
 * Formats a time span into "Xh Ym" or "Ym Zs".
 */
export function formatDurationMs(ms: number): string {
  if (ms <= 0) return "0m";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

/**
 * Calculates the complete state for all 4 sessions at a given instant.
 */
export function calculateAllSessions(
  now: Date,
  userTimeZone: string,
  userLocale = "en-US"
): {
  sessions: SessionCalculatedState[];
  weekendState: WeekendMarketState;
  activityLevel: MarketActivityLevel;
  activeSessionsCount: number;
} {
  const weekendState = isWeekendMarketClosed(now);

  const sessions: SessionCalculatedState[] = FOREX_SESSIONS.map((config) => {
    const { openUtc, closeUtc, nextOpenUtc } = getSessionTimesUtc(now, config);

    const nowMs = now.getTime();
    const openMs = openUtc.getTime();
    const closeMs = closeUtc.getTime();
    const isDuringHours = nowMs >= openMs && nowMs < closeMs;
    const isOpen = !weekendState.isClosed && isDuringHours;

    const msUntilOpen = Math.max(0, openMs - nowMs);
    const isOpeningSoon = !weekendState.isClosed && !isOpen && msUntilOpen > 0 && msUntilOpen <= 3600000;

    let status: "open" | "opening_soon" | "closed" = "closed";
    if (isOpen) {
      status = "open";
    } else if (isOpeningSoon) {
      status = "opening_soon";
    }

    let progressPercent = 0;
    if (isOpen) {
      const totalSessionMs = closeMs - openMs;
      const elapsedMs = nowMs - openMs;
      progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalSessionMs) * 100)));
    }

    let countdownCaption: "closes in" | "opens in" = "opens in";
    let countdownFormatted = "0m";
    let countdownMinutes = 0;

    if (isOpen) {
      countdownCaption = "closes in";
      const remainingMs = Math.max(0, closeMs - nowMs);
      countdownMinutes = Math.ceil(remainingMs / 60000);
      countdownFormatted = formatDurationMs(remainingMs);
    } else if (weekendState.isClosed) {
      countdownCaption = "opens in";
      countdownMinutes = Math.ceil(weekendState.msUntilReopen / 60000);
      countdownFormatted = formatDurationMs(weekendState.msUntilReopen);
    } else {
      countdownCaption = "opens in";
      const remainingMs = msUntilOpen > 0 ? msUntilOpen : Math.max(0, nextOpenUtc.getTime() - nowMs);
      countdownMinutes = Math.ceil(remainingMs / 60000);
      countdownFormatted = formatDurationMs(remainingMs);
    }

    const zoneLabel = getZoneLabel(now, config.timeZone, config.locale);

    // Format local hours in city
    const localFmt = new Intl.DateTimeFormat(userLocale, {
      timeZone: config.timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const localHoursFormatted = `${localFmt.format(openUtc)} – ${localFmt.format(closeUtc)}`;

    // Format session hours in user time zone
    const userFmt = new Intl.DateTimeFormat(userLocale, {
      timeZone: userTimeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const userHoursFormatted = `${userFmt.format(openUtc)} – ${userFmt.format(closeUtc)}`;

    const upcomingClockChange = getUpcomingClockChange(now, config.timeZone, 7);

    return {
      config,
      isOpen,
      isOpeningSoon,
      status,
      openUtc,
      closeUtc,
      nextOpenUtc,
      zoneLabel,
      progressPercent,
      countdownCaption,
      countdownFormatted,
      countdownMinutes,
      userHoursFormatted,
      localHoursFormatted,
      upcomingClockChange,
    };
  });

  const activeSessionsCount = sessions.filter((s) => s.isOpen).length;

  let activityLevel: MarketActivityLevel = "quiet";
  if (!weekendState.isClosed) {
    const londonOpen = sessions.find((s) => s.config.id === "london")?.isOpen;
    const nyOpen = sessions.find((s) => s.config.id === "newyork")?.isOpen;

    if (londonOpen && nyOpen) {
      activityLevel = "high";
    } else if (activeSessionsCount >= 2) {
      activityLevel = "medium";
    } else if (activeSessionsCount === 1) {
      activityLevel = "low";
    } else {
      activityLevel = "quiet";
    }
  }

  return {
    sessions,
    weekendState,
    activityLevel,
    activeSessionsCount,
  };
}

/**
 * Calculates timeline visual intervals [startFraction, endFraction] in [0, 1] for a 24-hour day in user's timezone.
 * Handles sessions that cross midnight by returning up to two continuous segments.
 */
export function getTimelineSegmentsForSession(
  openUtc: Date,
  closeUtc: Date,
  userTimeZone: string,
  referenceDate: Date
): Array<{ startPct: number; endPct: number }> {
  const userParts = getLocalDateParts(referenceDate, userTimeZone);
  // Start and end of user's day in UTC
  const dayStartUtc = zonedDateTimeToUtc(userParts.year, userParts.month, userParts.day, 0, 0, userTimeZone);
  const dayEndUtc = new Date(dayStartUtc.getTime() + 86400000);

  const dayStartMs = dayStartUtc.getTime();
  const dayEndMs = dayEndUtc.getTime();
  const dayDurationMs = 86400000;

  // We test the session window, plus 1 day before/after in case of wrap-around
  const segments: Array<{ startPct: number; endPct: number }> = [];

  const checkWindow = (winOpen: Date, winClose: Date) => {
    const s = Math.max(winOpen.getTime(), dayStartMs);
    const e = Math.min(winClose.getTime(), dayEndMs);
    if (e > s) {
      const startPct = ((s - dayStartMs) / dayDurationMs) * 100;
      const endPct = ((e - dayStartMs) / dayDurationMs) * 100;
      segments.push({ startPct, endPct });
    }
  };

  checkWindow(openUtc, closeUtc);
  checkWindow(new Date(openUtc.getTime() - 86400000), new Date(closeUtc.getTime() - 86400000));
  checkWindow(new Date(openUtc.getTime() + 86400000), new Date(closeUtc.getTime() + 86400000));

  return segments;
}

/**
 * Calculates the overlap intervals between two sessions in user's 24-hour timeline.
 */
export function getTimelineOverlapSegments(
  sessionAOpenUtc: Date,
  sessionACloseUtc: Date,
  sessionBOpenUtc: Date,
  sessionBCloseUtc: Date,
  userTimeZone: string,
  referenceDate: Date
): Array<{ startPct: number; endPct: number }> {
  const userParts = getLocalDateParts(referenceDate, userTimeZone);
  const dayStartUtc = zonedDateTimeToUtc(userParts.year, userParts.month, userParts.day, 0, 0, userTimeZone);
  const dayEndUtc = new Date(dayStartUtc.getTime() + 86400000);

  const dayStartMs = dayStartUtc.getTime();
  const dayEndMs = dayEndUtc.getTime();
  const dayDurationMs = 86400000;

  const overlaps: Array<{ startPct: number; endPct: number }> = [];

  const offsets = [-86400000, 0, 86400000];
  for (const offA of offsets) {
    const aOpen = sessionAOpenUtc.getTime() + offA;
    const aClose = sessionACloseUtc.getTime() + offA;
    for (const offB of offsets) {
      const bOpen = sessionBOpenUtc.getTime() + offB;
      const bClose = sessionBCloseUtc.getTime() + offB;

      const overlapStart = Math.max(aOpen, bOpen);
      const overlapClose = Math.min(aClose, bClose);

      if (overlapClose > overlapStart) {
        const s = Math.max(overlapStart, dayStartMs);
        const e = Math.min(overlapClose, dayEndMs);
        if (e > s) {
          const startPct = ((s - dayStartMs) / dayDurationMs) * 100;
          const endPct = ((e - dayStartMs) / dayDurationMs) * 100;
          overlaps.push({ startPct, endPct });
        }
      }
    }
  }

  return overlaps;
}
