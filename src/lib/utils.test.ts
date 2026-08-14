import { describe, expect, it, vi } from "vitest";
import { daysUntil, formatCurrency, formatDate } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats numeric values as USD", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("returns an em dash for missing or invalid values", () => {
    expect(formatCurrency(null)).toBe("—");
    expect(formatCurrency("not-a-number")).toBe("—");
  });
});

describe("formatDate", () => {
  it("formats dates in the expected locale", () => {
    expect(formatDate(new Date(2026, 7, 13))).toBe("Aug 13, 2026");
  });

  it("returns an em dash when no date is provided", () => {
    expect(formatDate(undefined)).toBe("—");
  });
});

describe("daysUntil", () => {
  it("calculates the number of days remaining", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 13));

    expect(daysUntil(new Date(2026, 7, 15))).toBe(2);

    vi.useRealTimers();
  });

  it("returns null when no date is provided", () => {
    expect(daysUntil(null)).toBeNull();
  });
});