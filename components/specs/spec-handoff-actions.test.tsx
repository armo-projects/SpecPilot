// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SpecHandoffActions } from "@/components/specs/spec-handoff-actions";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
    loading: vi.fn(() => "toast-id")
  }
}));

describe("SpecHandoffActions", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("treats codex-ready as a fixed prompt and removes partial-copy behavior", () => {
    render(<SpecHandoffActions specId="spec-1" />);

    expect(screen.getByText("Copy Selected")).toBeInTheDocument();
    expect(screen.getByText(/Sections:/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Mode"), {
      target: { value: "codex_ready" }
    });

    expect(screen.queryByText("Copy Selected")).not.toBeInTheDocument();
    expect(screen.getByText("Copy Prompt")).toBeInTheDocument();
    expect(screen.getByText("Fixed prompt")).toBeInTheDocument();
    expect(screen.getByText(/Section filters do not apply to this mode/)).toBeInTheDocument();
  });
});
