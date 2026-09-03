import { describe, it, expect } from "vitest";
import { formatDuration } from "./formatDuration";

describe("formatDuration", () => {
  it("formats minutes and seconds", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(599)).toBe("9:59");
    expect(formatDuration(600)).toBe("10:00");
    expect(formatDuration(3601)).toBe("60:01");
  });

  it("pads seconds with a leading zero", () => {
    expect(formatDuration(61)).toBe("1:01");
    expect(formatDuration(1)).toBe("0:01");
  });

  it("handles NaN and negative values gracefully", () => {
    expect(formatDuration(NaN)).toBe("0:00");
    expect(formatDuration(-5)).toBe("0:00");
    expect(formatDuration(undefined)).toBe("0:00");
    expect(formatDuration(null)).toBe("0:00");
    expect(formatDuration("abc")).toBe("0:00");
  });

  it("accepts numeric strings", () => {
    expect(formatDuration("90")).toBe("1:30");
  });
});
