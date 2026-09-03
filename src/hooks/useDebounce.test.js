import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("a", 300));
    expect(result.current).toBe("a");
  });

  it("updates to the debounced value after the delay", async () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 100), {
      initialProps: { v: "initial" },
    });
    rerender({ v: "updated" });
    expect(result.current).toBe("initial");
    await waitFor(() => expect(result.current).toBe("updated"));
  });

  it("does not fire for intermediate values quickly changed", async () => {
    vi.useFakeTimers();
    try {
      const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
        initialProps: { v: "1" },
      });
      rerender({ v: "2" });
      rerender({ v: "3" });
      act(() => vi.advanceTimersByTime(200));
      expect(result.current).toBe("1");
    } finally {
      vi.useRealTimers();
    }
  });
});
