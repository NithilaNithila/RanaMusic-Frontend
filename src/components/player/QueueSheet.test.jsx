import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import QueueSheet from "./QueueSheet.jsx";

describe("QueueSheet", () => {
  it("returns null when closed", () => {
    const { container } = render(<QueueSheet open={false} queue={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders empty state without crashing when queue is undefined", () => {
    render(<QueueSheet open queue={undefined} />);
    expect(screen.getByText(/queue is empty/i)).toBeInTheDocument();
  });

  it("does not crash when currentTrack is null", () => {
    render(<QueueSheet open queue={[]} currentTrack={null} />);
    expect(screen.getByText(/queue is empty/i)).toBeInTheDocument();
  });
});
