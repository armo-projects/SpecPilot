// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpecDetailDocumentViewer } from "@/components/specs/spec-detail-document-viewer";
import type { SpecPlanData } from "@/types/spec";

function buildPlan(overrides: Partial<SpecPlanData> = {}): SpecPlanData {
  return {
    id: "plan-1",
    version: 1,
    summary: "Deliver codex prompt viewing in the detail page.",
    requirements: ["Show the human plan by default.", "Allow switching to the codex prompt."],
    assumptions: ["Use the current detail page layout."],
    frontendTasks: [{ title: "Add viewer", description: "Render a toggle between views.", priority: "medium" }],
    backendTasks: [{ title: "Reuse existing data", description: "Do not change the backend route.", priority: "low" }],
    databaseSchema: [{ entity: "SpecPromptArtifact", fields: [{ name: "markdown", type: "string", required: false }] }],
    apiEndpoints: [{ method: "GET", path: "/api/specs/:id", purpose: "Load detail page data." }],
    edgeCases: ["Codex prompt may be unavailable."],
    testCases: ["Human view stays default."],
    risks: ["Codex markdown may be missing."],
    modelUsed: "gpt-4.1-mini",
    createdAt: new Date("2026-03-09T10:00:00.000Z"),
    codexReadyArtifact: {
      id: "artifact-1",
      mode: "CODEX_READY",
      target: "GENERIC",
      status: "SUCCEEDED",
      markdown: "# Codex Prompt\n\n## Objective\n\nShip the feature.\n",
      errorMessage: null,
      modelUsed: "gpt-4.1-mini",
      createdAt: new Date("2026-03-09T10:01:00.000Z"),
      updatedAt: new Date("2026-03-09T10:01:00.000Z")
    },
    ...overrides
  };
}

describe("SpecDetailDocumentViewer", () => {
  it("shows the human spec by default and can switch to the codex prompt", () => {
    render(
      <SpecDetailDocumentViewer
        spec={{
          rawPrompt: "Add codex prompt viewing.",
          context: "Existing repo task.",
          latestPlanData: buildPlan()
        }}
      />
    );

    expect(screen.getByRole("button", { name: "Human Spec" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Codex Prompt" })).toBeInTheDocument();
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.queryByText("Artifact-backed coding-agent prompt rendered from the latest plan version.")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Codex Prompt" }));

    expect(screen.getByText("Artifact-backed coding-agent prompt rendered from the latest plan version.")).toBeInTheDocument();
    expect(screen.getByText("Objective")).toBeInTheDocument();
    expect(screen.queryByText("Summary")).not.toBeInTheDocument();
  });

  it("does not show the codex toggle when markdown is unavailable", () => {
    render(
      <SpecDetailDocumentViewer
        spec={{
          rawPrompt: "Add codex prompt viewing.",
          context: "Existing repo task.",
          latestPlanData: {
            ...buildPlan(),
            codexReadyArtifact: {
              id: "artifact-1",
              mode: "CODEX_READY",
              target: "GENERIC",
              status: "FAILED",
              markdown: null,
              errorMessage: "Prompt unavailable.",
              modelUsed: null,
              createdAt: new Date("2026-03-09T10:01:00.000Z"),
              updatedAt: new Date("2026-03-09T10:01:00.000Z")
            }
          }
        }}
      />
    );

    expect(screen.queryByRole("button", { name: "Human Spec" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Codex Prompt" })).not.toBeInTheDocument();
    expect(screen.getByText("Summary")).toBeInTheDocument();
  });
});
