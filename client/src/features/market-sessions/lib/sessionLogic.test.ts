import { describe, it, expect } from "vitest";
import {
  FOREX_SESSIONS,
  getStandardSessionTimesUtcForDate,
  isWeekendMarketClosed,
  calculateAllSessions,
  getZoneLabel,
  zonedDateTimeToUtc,
} from "./sessionLogic";

describe("Forex Market Sessions DST & Seasonal Logic", () => {
  const sydney = FOREX_SESSIONS.find((s) => s.id === "sydney")!;
  const tokyo = FOREX_SESSIONS.find((s) => s.id === "tokyo")!;
  const london = FOREX_SESSIONS.find((s) => s.id === "london")!;
  const newyork = FOREX_SESSIONS.find((s) => s.id === "newyork")!;

  const toIsoTime = (d: Date) => d.toISOString().slice(11, 16);

  describe("Fixture 1: Northern Summer / Southern Winter (2026-07-15)", () => {
    it("matches expected UTC open-close hours for each session", () => {
      const syd = getStandardSessionTimesUtcForDate(2026, 7, 15, sydney);
      const tok = getStandardSessionTimesUtcForDate(2026, 7, 15, tokyo);
      const lon = getStandardSessionTimesUtcForDate(2026, 7, 15, london);
      const ny = getStandardSessionTimesUtcForDate(2026, 7, 15, newyork);

      // Sydney 07:00 AEST (UTC+10) = 21:00 prev day UTC, closes 16:00 AEST = 06:00 UTC
      expect(toIsoTime(syd.openUtc)).toBe("21:00");
      expect(toIsoTime(syd.closeUtc)).toBe("06:00");

      // Tokyo 09:00 JST (UTC+9) = 00:00 UTC, closes 18:00 JST = 09:00 UTC
      expect(toIsoTime(tok.openUtc)).toBe("00:00");
      expect(toIsoTime(tok.closeUtc)).toBe("09:00");

      // London 08:00 BST (UTC+1) = 07:00 UTC, closes 17:00 BST = 16:00 UTC
      expect(toIsoTime(lon.openUtc)).toBe("07:00");
      expect(toIsoTime(lon.closeUtc)).toBe("16:00");

      // New York 08:00 EDT (UTC-4) = 12:00 UTC, closes 17:00 EDT = 21:00 UTC
      expect(toIsoTime(ny.openUtc)).toBe("12:00");
      expect(toIsoTime(ny.closeUtc)).toBe("21:00");
    });
  });

  describe("Fixture 2: Northern Winter / Southern Summer (2026-12-15 and 2027-01-15)", () => {
    const testWinterDates = [
      { y: 2026, m: 12, d: 15 },
      { y: 2027, m: 1, d: 15 },
    ];

    testWinterDates.forEach(({ y, m, d }) => {
      it(`matches expected UTC hours on ${y}-${m}-${d}`, () => {
        const syd = getStandardSessionTimesUtcForDate(y, m, d, sydney);
        const tok = getStandardSessionTimesUtcForDate(y, m, d, tokyo);
        const lon = getStandardSessionTimesUtcForDate(y, m, d, london);
        const ny = getStandardSessionTimesUtcForDate(y, m, d, newyork);

        // Sydney 07:00 AEDT (UTC+11) = 20:00 prev day UTC, closes 16:00 AEDT = 05:00 UTC
        expect(toIsoTime(syd.openUtc)).toBe("20:00");
        expect(toIsoTime(syd.closeUtc)).toBe("05:00");

        // Tokyo 09:00 JST (UTC+9) = 00:00 UTC, closes 18:00 JST = 09:00 UTC
        expect(toIsoTime(tok.openUtc)).toBe("00:00");
        expect(toIsoTime(tok.closeUtc)).toBe("09:00");

        // London 08:00 GMT (UTC+0) = 08:00 UTC, closes 17:00 GMT = 17:00 UTC
        expect(toIsoTime(lon.openUtc)).toBe("08:00");
        expect(toIsoTime(lon.closeUtc)).toBe("17:00");

        // New York 08:00 EST (UTC-5) = 13:00 UTC, closes 17:00 EST = 22:00 UTC
        expect(toIsoTime(ny.openUtc)).toBe("13:00");
        expect(toIsoTime(ny.closeUtc)).toBe("22:00");
      });
    });
  });

  describe("Fixture 3: Out-of-sync DST Gap Windows", () => {
    it("2026-03-15: US on DST (EDT), UK still on GMT", () => {
      const lon = getStandardSessionTimesUtcForDate(2026, 3, 15, london);
      const ny = getStandardSessionTimesUtcForDate(2026, 3, 15, newyork);

      expect(toIsoTime(lon.openUtc)).toBe("08:00");
      expect(toIsoTime(lon.closeUtc)).toBe("17:00");
      expect(toIsoTime(ny.openUtc)).toBe("12:00");
      expect(toIsoTime(ny.closeUtc)).toBe("21:00");
    });

    it("2026-04-02: UK on BST, Sydney still on AEDT (DST)", () => {
      const syd = getStandardSessionTimesUtcForDate(2026, 4, 2, sydney);
      const lon = getStandardSessionTimesUtcForDate(2026, 4, 2, london);

      expect(toIsoTime(syd.openUtc)).toBe("20:00");
      expect(toIsoTime(syd.closeUtc)).toBe("05:00");
      expect(toIsoTime(lon.openUtc)).toBe("07:00");
      expect(toIsoTime(lon.closeUtc)).toBe("16:00");
    });

    it("2026-04-10: Sydney now on standard time (AEST)", () => {
      const syd = getStandardSessionTimesUtcForDate(2026, 4, 10, sydney);
      expect(toIsoTime(syd.openUtc)).toBe("21:00");
      expect(toIsoTime(syd.closeUtc)).toBe("06:00");
    });

    it("2026-10-10: Sydney on DST (AEDT), London still on BST", () => {
      const syd = getStandardSessionTimesUtcForDate(2026, 10, 10, sydney);
      const lon = getStandardSessionTimesUtcForDate(2026, 10, 10, london);

      expect(toIsoTime(syd.openUtc)).toBe("20:00");
      expect(toIsoTime(syd.closeUtc)).toBe("05:00");
      expect(toIsoTime(lon.openUtc)).toBe("07:00");
      expect(toIsoTime(lon.closeUtc)).toBe("16:00");
    });

    it("2026-10-28: UK back on GMT, US still on DST (EDT)", () => {
      const lon = getStandardSessionTimesUtcForDate(2026, 10, 28, london);
      const ny = getStandardSessionTimesUtcForDate(2026, 10, 28, newyork);

      expect(toIsoTime(lon.openUtc)).toBe("08:00");
      expect(toIsoTime(lon.closeUtc)).toBe("17:00");
      expect(toIsoTime(ny.openUtc)).toBe("12:00");
      expect(toIsoTime(ny.closeUtc)).toBe("21:00");
    });
  });

  describe("Fixture 4: Display Timezones Conversion (Asia/Dhaka, America/New_York, Australia/Sydney)", () => {
    const formatInZone = (utcDate: Date, timeZone: string) => {
      return new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(utcDate);
    };

    it("converts to Asia/Dhaka correctly for summer & winter", () => {
      const dhaka = "Asia/Dhaka";

      // London summer (2026-07-15)
      const lonSummer = getStandardSessionTimesUtcForDate(2026, 7, 15, london);
      expect(formatInZone(lonSummer.openUtc, dhaka)).toBe("1:00 PM");
      expect(formatInZone(lonSummer.closeUtc, dhaka)).toBe("10:00 PM");

      // London winter (2026-12-15)
      const lonWinter = getStandardSessionTimesUtcForDate(2026, 12, 15, london);
      expect(formatInZone(lonWinter.openUtc, dhaka)).toBe("2:00 PM");
      expect(formatInZone(lonWinter.closeUtc, dhaka)).toBe("11:00 PM");

      // New York summer (2026-07-15)
      const nySummer = getStandardSessionTimesUtcForDate(2026, 7, 15, newyork);
      expect(formatInZone(nySummer.openUtc, dhaka)).toBe("6:00 PM");
      expect(formatInZone(nySummer.closeUtc, dhaka)).toBe("3:00 AM");

      // New York winter (2026-12-15)
      const nyWinter = getStandardSessionTimesUtcForDate(2026, 12, 15, newyork);
      expect(formatInZone(nyWinter.openUtc, dhaka)).toBe("7:00 PM");
      expect(formatInZone(nyWinter.closeUtc, dhaka)).toBe("4:00 AM");

      // Sydney summer (2026-12-15)
      const sydSummer = getStandardSessionTimesUtcForDate(2026, 12, 15, sydney);
      expect(formatInZone(sydSummer.openUtc, dhaka)).toBe("2:00 AM");
      expect(formatInZone(sydSummer.closeUtc, dhaka)).toBe("11:00 AM");

      // Sydney winter (2026-07-15)
      const sydWinter = getStandardSessionTimesUtcForDate(2026, 7, 15, sydney);
      expect(formatInZone(sydWinter.openUtc, dhaka)).toBe("3:00 AM");
      expect(formatInZone(sydWinter.closeUtc, dhaka)).toBe("12:00 PM");

      // Tokyo always 6:00 AM - 3:00 PM
      const tokSummer = getStandardSessionTimesUtcForDate(2026, 7, 15, tokyo);
      expect(formatInZone(tokSummer.openUtc, dhaka)).toBe("6:00 AM");
      expect(formatInZone(tokSummer.closeUtc, dhaka)).toBe("3:00 PM");
      const tokWinter = getStandardSessionTimesUtcForDate(2026, 12, 15, tokyo);
      expect(formatInZone(tokWinter.openUtc, dhaka)).toBe("6:00 AM");
      expect(formatInZone(tokWinter.closeUtc, dhaka)).toBe("3:00 PM");
    });

    it("converts to America/New_York and Australia/Sydney correctly", () => {
      const nyDate = getStandardSessionTimesUtcForDate(2026, 7, 15, newyork);
      expect(formatInZone(nyDate.openUtc, "America/New_York")).toBe("8:00 AM");
      expect(formatInZone(nyDate.closeUtc, "America/New_York")).toBe("5:00 PM");

      const sydDate = getStandardSessionTimesUtcForDate(2026, 7, 15, sydney);
      expect(formatInZone(sydDate.openUtc, "Australia/Sydney")).toBe("7:00 AM");
      expect(formatInZone(sydDate.closeUtc, "Australia/Sydney")).toBe("4:00 PM");
    });
  });

  describe("Fixture 5: DST Transition Days (23-hour & 25-hour days)", () => {
    it("2026-03-08: US Spring Forward (23h day in America/New_York)", () => {
      const ny = getStandardSessionTimesUtcForDate(2026, 3, 8, newyork);
      // New York local time is still 08:00 - 17:00 EDT (clock jumped 02:00 -> 03:00)
      expect(toIsoTime(ny.openUtc)).toBe("12:00");
      expect(toIsoTime(ny.closeUtc)).toBe("21:00");
    });

    it("2026-03-29: UK Spring Forward (23h day in Europe/London)", () => {
      const lon = getStandardSessionTimesUtcForDate(2026, 3, 29, london);
      // London local time is 08:00 - 17:00 BST
      expect(toIsoTime(lon.openUtc)).toBe("07:00");
      expect(toIsoTime(lon.closeUtc)).toBe("16:00");
    });

    it("2026-10-04: Sydney Spring Forward (23h day in Australia/Sydney)", () => {
      const syd = getStandardSessionTimesUtcForDate(2026, 10, 4, sydney);
      expect(toIsoTime(syd.openUtc)).toBe("20:00");
      expect(toIsoTime(syd.closeUtc)).toBe("05:00");
    });

    it("2026-10-25: UK Fall Back (25h day in Europe/London)", () => {
      const lon = getStandardSessionTimesUtcForDate(2026, 10, 25, london);
      expect(toIsoTime(lon.openUtc)).toBe("08:00");
      expect(toIsoTime(lon.closeUtc)).toBe("17:00");
    });

    it("2026-11-01: US Fall Back (25h day in America/New_York)", () => {
      const ny = getStandardSessionTimesUtcForDate(2026, 11, 1, newyork);
      expect(toIsoTime(ny.openUtc)).toBe("13:00");
      expect(toIsoTime(ny.closeUtc)).toBe("22:00");
    });
  });

  describe("Fixture 6: Weekend Window (Friday 17:00 to Sunday 17:00 New York time)", () => {
    it("detects weekend closure correctly during EDT (Summer)", () => {
      // 2026-07-17 is Friday. Friday 17:00 EDT is 21:00 UTC.
      const friday1659Utc = new Date("2026-07-17T20:59:00Z");
      expect(isWeekendMarketClosed(friday1659Utc).isClosed).toBe(false);

      const friday1701Utc = new Date("2026-07-17T21:01:00Z");
      const closedState = isWeekendMarketClosed(friday1701Utc);
      expect(closedState.isClosed).toBe(true);

      // Saturday 12:00 UTC
      expect(isWeekendMarketClosed(new Date("2026-07-18T12:00:00Z")).isClosed).toBe(true);

      // Sunday 17:00 EDT is 21:00 UTC on 2026-07-19
      const sunday1659Utc = new Date("2026-07-19T20:59:00Z");
      expect(isWeekendMarketClosed(sunday1659Utc).isClosed).toBe(true);

      const sunday1701Utc = new Date("2026-07-19T21:01:00Z");
      expect(isWeekendMarketClosed(sunday1701Utc).isClosed).toBe(false);
    });

    it("detects weekend closure correctly during EST (Winter)", () => {
      // 2026-12-18 is Friday. Friday 17:00 EST is 22:00 UTC.
      const friday1659Utc = new Date("2026-12-18T21:59:00Z");
      expect(isWeekendMarketClosed(friday1659Utc).isClosed).toBe(false);

      const friday1701Utc = new Date("2026-12-18T22:01:00Z");
      expect(isWeekendMarketClosed(friday1701Utc).isClosed).toBe(true);

      // Sunday 17:00 EST is 22:00 UTC on 2026-12-20
      const sunday1659Utc = new Date("2026-12-20T21:59:00Z");
      expect(isWeekendMarketClosed(sunday1659Utc).isClosed).toBe(true);

      const sunday1701Utc = new Date("2026-12-20T22:01:00Z");
      expect(isWeekendMarketClosed(sunday1701Utc).isClosed).toBe(false);
    });
  });

  describe("Activity Levels", () => {
    it("reports High when London and New York are both open", () => {
      // 2026-07-15 14:00 UTC -> London is open (07:00-16:00), NY is open (12:00-21:00)
      const now = new Date("2026-07-15T14:00:00Z");
      const result = calculateAllSessions(now, "America/New_York");
      expect(result.activityLevel).toBe("high");
    });

    it("reports Quiet during weekend window", () => {
      const saturday = new Date("2026-07-18T14:00:00Z");
      const result = calculateAllSessions(saturday, "UTC");
      expect(result.activityLevel).toBe("quiet");
      expect(result.activeSessionsCount).toBe(0);
      expect(result.weekendState.isClosed).toBe(true);
    });
  });
});
