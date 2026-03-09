import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SpecDetail } from "@/types/spec";

const {
  findUniqueMock,
  getSpecForMockUserMock,
  backfillCodexReadyArtifactForPlanMock
} = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  getSpecForMockUserMock: vi.fn(),
  backfillCodexReadyArtifactForPlanMock: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  db: {
    specPromptArtifact: {
      findUnique: findUniqueMock
    }
  }
}));

vi.mock("@/server/services/specs.service", () => ({
  getSpecForMockUser: getSpecForMockUserMock
}));

vi.mock("@/server/services/spec-generation.service", () => ({
  backfillCodexReadyArtifactForPlan: backfillCodexReadyArtifactForPlanMock
}));

import { buildSpecExportForMockUser } from "@/server/services/spec-export.service";

function buildSpecFixture(overrides: Partial<SpecDetail> = {}): SpecDetail {
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
      summary: "Deliver artifact-backed exports.",
      createdAt: new Date("2026-03-09T10:05:00.000Z")
    },
    latestPlanData: {
      id: "plan-1",
      version: 1,
      summary: "Deliver artifact-backed exports.",
      requirements: ["Support human and codex exports."],
      assumptions: ["Use current services."],
      frontendTasks: [{ title: "Update handoff UI", description: "Hide section toggles in codex mode.", priority: "medium" }],
      backendTasks: [{ title: "Persist artifacts", description: "Store codex prompts per plan.", priority: "high" }],
      databaseSchema: [{ entity: "SpecPromptArtifact", fields: [{ name: "status", type: "RunStatus", required: true }] }],
      apiEndpoints: [{ method: "GET", path: "/api/specs/:id/export", purpose: "Export generated artifacts." }],
      edgeCases: ["Codex artifact may be missing for legacy plans."],
      testCases: ["Human exports remain unchanged."],
      risks: ["Artifact generation can fail independently."],
      modelUsed: "gpt-4.1-mini",
      createdAt: new Date("2026-03-09T10:05:00.000Z"),
      codexReadyArtifact: null
    },
    planVersions: [
      {
        id: "plan-1",
        version: 1,
        summary: "Deliver artifact-backed exports.",
        createdAt: new Date("2026-03-09T10:05:00.000Z")
      }
    ],
    latestGenerationRun: {
      id: "run-1",
      status: "SUCCEEDED",
      startedAt: new Date("2026-03-09T10:00:00.000Z"),
      finishedAt: new Date("2026-03-09T10:05:00.000Z"),
      errorMessage: null,
      tokensUsed: 100,
      latencyMs: 5000
    },
    ...overrides
  };
}

describe("buildSpecExportForMockUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps human export rendering unchanged", async () => {
    getSpecForMockUserMock.mockResolvedValue(buildSpecFixture());

    const artifact = await buildSpecExportForMockUser({
      specId: "spec-1",
      query: { mode: "human", format: "text" }
    });

    expect(artifact.mode).toBe("human");
    expect(artifact.content).toContain("# Artifact-backed exports - Engineering Spec");
    expect(artifact.content).toContain("## Frontend Tasks");
  });

  it("keeps compact brief export rendering unchanged", async () => {
    getSpecForMockUserMock.mockResolvedValue(buildSpecFixture());

    const artifact = await buildSpecExportForMockUser({
      specId: "spec-1",
      query: { mode: "compact_brief", format: "text" }
    });

    expect(artifact.mode).toBe("compact_brief");
    expect(artifact.content).toContain("# Artifact-backed exports - Compact Execution Brief");
    expect(artifact.content).toContain("## Requirements");
  });

  it("returns stored codex artifacts and ignores custom sections", async () => {
    getSpecForMockUserMock.mockResolvedValue(buildSpecFixture());
    findUniqueMock.mockResolvedValue({
      id: "artifact-1",
      status: "SUCCEEDED",
      markdown: "# Stored Codex Prompt\n",
      errorMessage: null,
      updatedAt: new Date("2026-03-09T10:06:00.000Z")
    });

    const artifact = await buildSpecExportForMockUser({
      specId: "spec-1",
      query: { mode: "codex_ready", format: "text", sections: ["summary", "requirements"] }
    });

    expect(artifact.mode).toBe("codex_ready");
    expect(artifact.sections).toEqual([]);
    expect(artifact.content).toBe("# Stored Codex Prompt\n");
    expect(backfillCodexReadyArtifactForPlanMock).not.toHaveBeenCalled();
  });

  it("lazy backfills legacy plans without codex artifacts", async () => {
    getSpecForMockUserMock.mockResolvedValue(buildSpecFixture());
    findUniqueMock.mockResolvedValue(null);
    backfillCodexReadyArtifactForPlanMock.mockResolvedValue({
      id: "artifact-2",
      status: "SUCCEEDED",
      markdown: "# Backfilled Prompt\n",
      errorMessage: null,
      updatedAt: new Date("2026-03-09T10:07:00.000Z")
    });

    const artifact = await buildSpecExportForMockUser({
      specId: "spec-1",
      query: { mode: "codex_ready", format: "text" }
    });

    expect(artifact.content).toBe("# Backfilled Prompt\n");
    expect(backfillCodexReadyArtifactForPlanMock).toHaveBeenCalledOnce();
  });

  it("returns PROMPT_NOT_AVAILABLE when codex backfill cannot produce an artifact", async () => {
    getSpecForMockUserMock.mockResolvedValue(buildSpecFixture());
    findUniqueMock.mockResolvedValue(null);
    backfillCodexReadyArtifactForPlanMock.mockResolvedValue({
      id: "artifact-3",
      status: "FAILED",
      markdown: null,
      errorMessage: "Codex prompt generation failed.",
      updatedAt: new Date("2026-03-09T10:08:00.000Z")
    });

    await expect(
      buildSpecExportForMockUser({
        specId: "spec-1",
        query: { mode: "codex_ready", format: "text" }
      })
    ).rejects.toMatchObject({
      code: "PROMPT_NOT_AVAILABLE",
      message: "Codex prompt generation failed."
    });
  });
});
