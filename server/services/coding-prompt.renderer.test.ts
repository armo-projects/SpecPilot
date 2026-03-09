import { describe, expect, it } from "vitest";
import type { AiCodingPrompt } from "@/lib/validations/ai-coding-prompt.schema";
import { renderCodingPromptArtifact } from "@/server/services/coding-prompt.renderer";

function buildPromptFixture(overrides: Partial<AiCodingPrompt> = {}): AiCodingPrompt {
  return {
    executionMode: "existing_repo",
    objective: "Implement the requested feature in the current repository with a tightly scoped solution.",
    inScope: ["Add the main workflow", "Persist required data", "Cover critical tests"],
    outOfScope: ["Do not redesign the application shell", "Do not add auth changes"],
    adoptedDefaults: ["Use the current stack and patterns", "Prefer server-side validation"],
    implementationConstraints: ["Avoid unrelated refactors", "Keep naming aligned with existing modules"],
    orderedImplementationSteps: [
      {
        title: "Update persistence",
        instructions: ["Add the necessary model changes.", "Keep migrations additive only."]
      },
      {
        title: "Wire application behavior",
        instructions: ["Implement the new service flow.", "Update the UI entry points."]
      }
    ],
    dataModel: [
      {
        name: "PromptArtifact",
        details: ["Store one artifact per plan version.", "Track success or failure state."]
      }
    ],
    apiContracts: [
      {
        method: "GET",
        path: "/api/example",
        purpose: "Return the generated artifact.",
        details: ["Use the existing JSON envelope.", "Return 409 when unavailable."]
      }
    ],
    uiSurfaces: [
      {
        name: "Handoff panel",
        purpose: "Expose the prompt export workflow.",
        details: ["Hide section filters in fixed-prompt mode.", "Keep copy and export actions available."]
      }
    ],
    acceptanceChecks: ["The artifact renders with fixed sections.", "Codex mode does not expose partial copy."],
    agentInstructions: ["Inspect the existing repo before editing.", "Run focused validation before finishing."],
    ...overrides
  };
}

describe("renderCodingPromptArtifact", () => {
  it("renders the fixed codex prompt structure and avoids human-plan headings", () => {
    const artifact = renderCodingPromptArtifact({
      specTitle: "Artifact-backed export",
      rawPrompt: "Build the codex-ready export path.",
      context: "Existing repository task.",
      priority: "HIGH",
      prompt: buildPromptFixture()
    });

    expect(artifact.title).toBe("Artifact-backed export - Codex Ready Build Prompt");
    expect(artifact.content).toContain("## Objective");
    expect(artifact.content).toContain("## Build Context");
    expect(artifact.content).toContain("## Deliverables");
    expect(artifact.content).toContain("## Ordered Implementation Steps");
    expect(artifact.content).toContain("## API Contracts");
    expect(artifact.content).not.toContain("## Frontend Tasks");
    expect(artifact.content).not.toContain("## Backend Tasks");
  });

  it("renders a decisive greenfield fixture with explicit defaults", () => {
    const artifact = renderCodingPromptArtifact({
      specTitle: "Hamburger restaurant management system",
      rawPrompt: "Build a hamburger restaurant management system that lets people take orders and sends them to the kitchen.",
      context: null,
      priority: "MEDIUM",
      prompt: buildPromptFixture({
        executionMode: "greenfield",
        objective: "Build a restaurant operations MVP from scratch for staff order taking and kitchen fulfillment.",
        adoptedDefaults: [
          "Use a relational database for orders and order items.",
          "Assume tablets and desktop browsers are the initial clients."
        ]
      })
    });

    expect(artifact.content).toContain("Execution mode: Greenfield build");
    expect(artifact.content).toContain("Use a relational database for orders and order items.");
    expect(artifact.content).toContain("Assume tablets and desktop browsers are the initial clients.");
  });

  it("renders an existing-repo fixture with repo-aware instructions", () => {
    const artifact = renderCodingPromptArtifact({
      specTitle: "Existing repo feature",
      rawPrompt: "Add artifact-backed codex exports to the current app.",
      context: "Preserve the existing Next.js architecture.",
      priority: "HIGH",
      prompt: buildPromptFixture({
        executionMode: "existing_repo",
        agentInstructions: [
          "Inspect the current services and type contracts before changing them.",
          "Preserve existing error handling and export semantics."
        ]
      })
    });

    expect(artifact.content).toContain("Execution mode: Existing repository task");
    expect(artifact.content).toContain("Inspect the current services and type contracts before changing them.");
    expect(artifact.content).toContain("Preserve existing error handling and export semantics.");
  });

  it("renders an integration-heavy fixture with concrete acceptance checks", () => {
    const artifact = renderCodingPromptArtifact({
      specTitle: "Integration-heavy workflow",
      rawPrompt: "Connect invoice processing, storage, and export.",
      context: "The flow touches uploads, extraction, and CSV export.",
      priority: "HIGH",
      prompt: buildPromptFixture({
        acceptanceChecks: [
          "Uploading a supported invoice produces an extraction result.",
          "CSV export returns the expected columns and row counts."
        ],
        apiContracts: [
          {
            method: "POST",
            path: "/api/invoices/upload",
            purpose: "Upload an invoice and start extraction.",
            details: ["Accept PDF and image files.", "Reject unsupported file types with validation errors."]
          }
        ]
      })
    });

    expect(artifact.content).toContain("Uploading a supported invoice produces an extraction result.");
    expect(artifact.content).toContain("CSV export returns the expected columns and row counts.");
    expect(artifact.content).toContain("POST /api/invoices/upload");
  });
});
