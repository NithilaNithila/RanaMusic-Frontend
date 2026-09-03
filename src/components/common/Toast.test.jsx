import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import Toast from "./Toast.jsx";

describe("Toast", () => {
  it("renders the message with the given type", () => {
    render(<Toast message="Saved!" type="success" onClose={() => {}} />);
    expect(screen.getByText("Saved!")).toBeInTheDocument();
  });

  it("renders nothing when there is no message", () => {
    const { container } = render(<Toast message="" onClose={() => {}} />);
    expect(container.querySelector('[role="status"]')).not.toBeInTheDocument();
  });

  it("calls onClose after the duration elapses", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="Bye" duration={3000} onClose={onClose} />);
    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(3000));
    expect(onClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
