import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SpecDetail, SpecPlanData } from "@/types/spec";

const {
  responsesCreateMock,
  getSpecForMockUserMock,
  getOrCreateMockUserMock,
  specFindFirstMock,
  specUpdateMock,
  generationRunCreateMock,
  generationRunUpdateMock,
  specPlanFindFirstMock,
  specPlanCreateMock,
  specPromptArtifactFindUniqueMock,
  specPromptArtifactCreateMock,
  specPromptArtifactUpdateMock,
  transactionMock
} = vi.hoisted(() => ({
  responsesCreateMock: vi.fn(),
  getSpecForMockUserMock: vi.fn(),
  getOrCreateMockUserMock: vi.fn(),
  specFindFirstMock: vi.fn(),
  specUpdateMock: vi.fn(),
  generationRunCreateMock: vi.fn(),
  generationRunUpdateMock: vi.fn(),
  specPlanFindFirstMock: vi.fn(),
  specPlanCreateMock: vi.fn(),
  specPromptArtifactFindUniqueMock: vi.fn(),
  specPromptArtifactCreateMock: vi.fn(),
  specPromptArtifactUpdateMock: vi.fn(),
  transactionMock: vi.fn()
}));

const tx = {
  specPlan: {
    findFirst: specPlanFindFirstMock,
    create: specPlanCreateMock
  },
  specPromptArtifact: {
    create: specPromptArtifactCreateMock
  },
  generationRun: {
    update: generationRunUpdateMock
  },
  spec: {
    update: specUpdateMock
  }
};

vi.mock("@/lib/openai", () => ({
  DEFAULT_OPENAI_MODEL: "gpt-4.1-mini",
  MissingOpenAIKeyError: class MissingOpenAIKeyError extends Error {},
  getOpenAIClient: () => ({
    responses: {
      create: responsesCreateMock
    }
  })
}));

vi.mock("@/server/auth/mock-user", () => ({
  getOrCreateMockUser: getOrCreateMockUserMock
}));

vi.mock("@/server/services/specs.service", () => ({
  getSpecForMockUser: getSpecForMockUserMock
}));

vi.mock("@/lib/db", () => ({
  db: {
    spec: {
      findFirst: specFindFirstMock,
      update: specUpdateMock
    },
    generationRun: {
      create: generationRunCreateMock,
      update: generationRunUpdateMock
    },
    specPlan: {
      findFirst: specPlanFindFirstMock,
      create: specPlanCreateMock
    },
    specPromptArtifact: {
      findUnique: specPromptArtifactFindUniqueMock,
      create: specPromptArtifactCreateMock,
      update: specPromptArtifactUpdateMock
    },
    $transaction: transactionMock
  }
}));

import { backfillCodexReadyArtifactForPlan, generateSpecPlanForMockUser } from "@/server/services/spec-generation.service";

function buildHumanPlanResponse() {
  return {
    id: "resp-human",
    model: "gpt-4.1-mini",
    status: "completed",
    output_text: JSON.stringify({
      summary: "Deliver artifact-backed codex exports.",
      requirements: ["Support human exports.", "Support codex-ready exports."],
      assumptions: ["Use existing services."],
      frontendTasks: [{ title: "Update handoff UI", description: "Hide sections in codex mode.", priority: "medium" }],
      backendTasks: [{ title: "Persist artifacts", description: "Store codex prompts per plan.", priority: "high" }],
      databaseSchema: [{ entity: "SpecPromptArtifact", fields: [{ name: "status", type: "RunStatus", required: true }] }],
      apiEndpoints: [{ method: "GET", path: "/api/specs/:id/export", purpose: "Export generated content." }],
      edgeCases: ["Legacy plans may not have codex artifacts."],
      testCases: ["Human exports remain unchanged."],
      risks: ["Codex prompt generation can fail independently."]
    }),
    output: [],
    usage: { total_tokens: 123 },
    error: null,
    incomplete_details: null
  };
}

function buildCodingPromptResponse() {
  return {
    id: "resp-codex",
    model: "gpt-4.1-mini",
    status: "completed",
    output_text: JSON.stringify({
      executionMode: "existing_repo",
      objective: "Implement artifact-backed codex exports in the current repository.",
      inScope: ["Persist codex prompt artifacts.", "Switch codex export to artifact-backed content."],
      outOfScope: ["Do not redesign the rest of the export system."],
      adoptedDefaults: ["Keep the current Next.js and Prisma stack.", "Store one generic prompt target only."],
      implementationConstraints: ["Preserve existing error handling.", "Avoid unrelated refactors."],
      orderedImplementationSteps: [
        {
          title: "Add persistence",
          instructions: ["Extend the Prisma schema.", "Persist codex artifacts per plan version."]
        }
      ],
      dataModel: [{ name: "SpecPromptArtifact", details: ["Track status and markdown output."] }],
      apiContracts: [
        {
          method: "GET",
          path: "/api/specs/:id/export",
          purpose: "Return the requested export artifact.",
          details: ["Return codex markdown when mode is codex_ready."]
        }
      ],
      uiSurfaces: [
        {
          name: "Handoff panel",
          purpose: "Expose prompt copy and export actions.",
          details: ["Hide section toggles in codex mode."]
        }
      ],
      acceptanceChecks: ["Codex exports use stored artifact markdown."],
      agentInstructions: ["Inspect the repo before editing.", "Run validation before finishing."]
    }),
    output: [],
    usage: { total_tokens: 77 },
    error: null,
    incomplete_details: null
  };
}

function buildPlanData(): SpecPlanData {
  return {
    id: "plan-1",
    version: 1,
    summary: "Deliver artifact-backed codex exports.",
    requirements: ["Support human exports.", "Support codex-ready exports."],
    assumptions: ["Use existing services."],
    frontendTasks: [{ title: "Update handoff UI", description: "Hide sections in codex mode.", priority: "medium" }],
    backendTasks: [{ title: "Persist artifacts", description: "Store codex prompts per plan.", priority: "high" }],
    databaseSchema: [{ entity: "SpecPromptArtifact", fields: [{ name: "status", type: "RunStatus", required: true }] }],
    apiEndpoints: [{ method: "GET", path: "/api/specs/:id/export", purpose: "Export generated content." }],
    edgeCases: ["Legacy plans may not have codex artifacts."],
    testCases: ["Human exports remain unchanged."],
    risks: ["Codex prompt generation can fail independently."],
    modelUsed: "gpt-4.1-mini",
    createdAt: new Date("2026-03-09T10:05:00.000Z"),
    codexReadyArtifact: null
  };
}

function buildSpecDetail(overrides: Partial<SpecDetail> = {}): SpecDetail {
  return {
    id: "spec-1",
    title: "Artifact-backed exports",
    rawPrompt: "Implement artifact-backed codex exports.",
    context: "Existing repository task.",
    priority: "HIGH",
    status: "COMPLETED",
    createdAt: new Date("2026-03-09T10:00:00.000Z"),
    updatedAt: new Date("2026-03-09T10:05:00.000Z"),
    latestPlan: {
      id: "plan-1",
      version: 1,
      summary: "Deliver artifact-backed codex exports.",
      createdAt: new Date("2026-03-09T10:05:00.000Z")
    },
    latestPlanData: buildPlanData(),
    planVersions: [
      {
        id: "plan-1",
        version: 1,
        summary: "Deliver artifact-backed codex exports.",
        createdAt: new Date("2026-03-09T10:05:00.000Z")
      }
    ],
    latestGenerationRun: {
      id: "run-1",
      status: "SUCCEEDED",
      startedAt: new Date("2026-03-09T10:00:00.000Z"),
      finishedAt: new Date("2026-03-09T10:05:00.000Z"),
      errorMessage: null,
      tokensUsed: 123,
      latencyMs: 5000
    },
    ...overrides
  };
}

describe("spec-generation service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getOrCreateMockUserMock.mockResolvedValue({ id: "user-1" });
    specFindFirstMock.mockResolvedValue({
      id: "spec-1",
      title: "Artifact-backed exports",
      rawPrompt: "Implement artifact-backed codex exports.",
      context: "Existing repository task.",
      priority: "HIGH"
    });
    generationRunCreateMock.mockResolvedValue({ id: "run-1" });
    specPlanFindFirstMock.mockResolvedValue(null);
    specPlanCreateMock.mockResolvedValue({ id: "plan-1" });
    specUpdateMock.mockResolvedValue({});
    generationRunUpdateMock.mockResolvedValue({});
    transactionMock.mockImplementation(async (input: unknown) => {
      if (typeof input === "function") {
        return input(tx);
      }

      return Promise.all(input as Promise<unknown>[]);
    });
  });

  it("persists a successful human plan and codex artifact in a dual-pass generation", async () => {
    responsesCreateMock.mockResolvedValueOnce(buildHumanPlanResponse());
    responsesCreateMock.mockResolvedValueOnce(buildCodingPromptResponse());
    getSpecForMockUserMock.mockResolvedValue(
      buildSpecDetail({
        latestPlanData: {
          ...buildPlanData(),
          codexReadyArtifact: {
            id: "artifact-1",
            mode: "CODEX_READY",
            target: "GENERIC",
            status: "SUCCEEDED",
            markdown: "# Prompt\n",
            errorMessage: null,
            modelUsed: "gpt-4.1-mini",
            createdAt: new Date("2026-03-09T10:06:00.000Z"),
            updatedAt: new Date("2026-03-09T10:06:00.000Z")
          }
        }
      })
    );

    const result = await generateSpecPlanForMockUser("spec-1");

    expect(result?.ok).toBe(true);
    expect(result?.planVersion).toBe(1);
    expect(responsesCreateMock).toHaveBeenCalledTimes(2);
    expect(specPromptArtifactCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "SUCCEEDED",
          mode: "CODEX_READY",
          target: "GENERIC",
          markdown: expect.stringContaining("## Objective")
        })
      })
    );
  });

  it("keeps the human plan usable when codex artifact generation fails", async () => {
    responsesCreateMock.mockResolvedValueOnce(buildHumanPlanResponse());
    responsesCreateMock.mockRejectedValueOnce(new Error("Codex prompt request failed."));
    getSpecForMockUserMock.mockResolvedValue(
      buildSpecDetail({
        latestPlanData: {
          ...buildPlanData(),
          codexReadyArtifact: {
            id: "artifact-1",
            mode: "CODEX_READY",
            target: "GENERIC",
            status: "FAILED",
            markdown: null,
            errorMessage: "Codex prompt request failed.",
            modelUsed: null,
            createdAt: new Date("2026-03-09T10:06:00.000Z"),
            updatedAt: new Date("2026-03-09T10:06:00.000Z")
          }
        }
      })
    );

    const result = await generateSpecPlanForMockUser("spec-1");

    expect(result?.ok).toBe(true);
    expect(specPromptArtifactCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "FAILED",
          errorMessage: "Codex prompt request failed."
        })
      })
    );
    expect(generationRunUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "SUCCEEDED"
        })
      })
    );
  });

  it("backfills a missing codex artifact for legacy plans", async () => {
    specPromptArtifactFindUniqueMock.mockResolvedValue(null);
    specPromptArtifactCreateMock.mockResolvedValue({ id: "artifact-2" });
    specPromptArtifactUpdateMock.mockResolvedValue({
      id: "artifact-2",
      status: "SUCCEEDED",
      markdown: "# Prompt\n",
      errorMessage: null
    });
    responsesCreateMock.mockResolvedValueOnce(buildCodingPromptResponse());

    const artifact = await backfillCodexReadyArtifactForPlan({
      spec: {
        title: "Artifact-backed exports",
        rawPrompt: "Implement artifact-backed codex exports.",
        context: "Existing repository task.",
        priority: "HIGH"
      },
      plan: buildPlanData()
    });

    expect(artifact.status).toBe("SUCCEEDED");
    expect(specPromptArtifactUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "SUCCEEDED",
          markdown: expect.stringContaining("## Objective")
        })
      })
    );
  });

  it("stores failed status when lazy backfill cannot generate a codex artifact", async () => {
    specPromptArtifactFindUniqueMock.mockResolvedValue(null);
    specPromptArtifactCreateMock.mockResolvedValue({ id: "artifact-3" });
    specPromptArtifactUpdateMock.mockResolvedValue({
      id: "artifact-3",
      status: "FAILED",
      markdown: null,
      errorMessage: "Backfill failed."
    });
    responsesCreateMock.mockRejectedValueOnce(new Error("Backfill failed."));

    const artifact = await backfillCodexReadyArtifactForPlan({
      spec: {
        title: "Artifact-backed exports",
        rawPrompt: "Implement artifact-backed codex exports.",
        context: "Existing repository task.",
        priority: "HIGH"
      },
      plan: buildPlanData()
    });

    expect(artifact.status).toBe("FAILED");
    expect(specPromptArtifactUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "FAILED",
          errorMessage: "Backfill failed."
        })
      })
    );
  });
});
