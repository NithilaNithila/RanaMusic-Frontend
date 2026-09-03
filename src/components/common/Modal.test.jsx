import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "./Modal.jsx";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}} title="Hi">
        <p>content</p>
      </Modal>
    );
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("renders title and children when open", () => {
    render(
      <Modal open onClose={() => {}} title="My Modal">
        <p>content inside</p>
      </Modal>
    );
    expect(screen.getByText("My Modal")).toBeInTheDocument();
    expect(screen.getByText("content inside")).toBeInTheDocument();
  });

  it("closes via Escape key", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Close me">
        <p>body</p>
      </Modal>
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not crash when onClose is omitted and Escape is pressed", () => {
    render(
      <Modal open title="No close handler">
        <p>body</p>
      </Modal>
    );
    expect(() => fireEvent.keyDown(window, { key: "Escape" })).not.toThrow();
  });
});
