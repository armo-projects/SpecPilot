import "server-only";
import type { AiCodingPrompt } from "@/lib/validations/ai-coding-prompt.schema";

type RenderCodingPromptArtifactInput = {
  specTitle: string;
  rawPrompt: string;
  context: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  prompt: AiCodingPrompt;
};

type RenderedCodingPromptArtifact = {
  title: string;
  content: string;
};

function normalizeMultilineText(value: string): string {
  const text = value.replace(/\r\n/g, "\n").trim();
  return text.length > 0 ? text : "_None provided._";
}

function listToBullets(items: readonly string[]): string {
  if (items.length === 0) {
    return "_None._";
  }

  return items.map((item) => `- ${normalizeMultilineText(item)}`).join("\n");
}

function formatOrderedSteps(steps: AiCodingPrompt["orderedImplementationSteps"]): string {
  return steps
    .map((step, index) => {
      const lines = step.instructions.map((instruction) => `   - ${normalizeMultilineText(instruction)}`).join("\n");
      return `${index + 1}. **${normalizeMultilineText(step.title)}**\n${lines}`;
    })
    .join("\n");
}

function formatNamedDetailList(
  items: ReadonlyArray<{ name: string; purpose?: string; details: readonly string[] }>,
  extraLabel?: (item: { name: string; purpose?: string; details: readonly string[] }) => string | null
): string {
  return items
    .map((item) => {
      const heading = `### ${normalizeMultilineText(item.name)}`;
      const label = extraLabel?.(item);
      const lines = item.details.map((detail) => `- ${normalizeMultilineText(detail)}`).join("\n");
      return [heading, label, lines].filter(Boolean).join("\n");
    })
    .join("\n\n");
}

function formatApiContracts(contracts: AiCodingPrompt["apiContracts"]): string {
  return contracts
    .map((contract) => {
      const lines = contract.details.map((detail) => `- ${normalizeMultilineText(detail)}`).join("\n");
      return [
        `### ${contract.method} ${normalizeMultilineText(contract.path)}`,
        `Purpose: ${normalizeMultilineText(contract.purpose)}`,
        lines
      ].join("\n");
    })
    .join("\n\n");
}

function buildDeliverables(prompt: AiCodingPrompt): string[] {
  const deliverables: string[] = [];

  for (const surface of prompt.uiSurfaces) {
    deliverables.push(`Implement UI surface "${surface.name}" for ${surface.purpose}.`);
  }

  for (const contract of prompt.apiContracts) {
    deliverables.push(`Implement API contract ${contract.method} ${contract.path} for ${contract.purpose}.`);
  }

  for (const entity of prompt.dataModel) {
    deliverables.push(`Add or update data model "${entity.name}".`);
  }

  return deliverables;
}

function joinMarkdownBlocks(blocks: readonly string[]): string {
  const normalized = blocks.map((block) => block.trim()).filter((block) => block.length > 0);
  return `${normalized.join("\n\n")}\n`;
}

export function renderCodingPromptArtifact(input: RenderCodingPromptArtifactInput): RenderedCodingPromptArtifact {
  const title = `${input.specTitle} - Codex Ready Build Prompt`;
  const executionModeLabel = input.prompt.executionMode === "existing_repo" ? "Existing repository task" : "Greenfield build";
  const deliverables = buildDeliverables(input.prompt);

  const blocks = [
    `# ${title}`,
    "You are implementing the feature described below.",
    "Treat this prompt as the execution source of truth.",
    "Preserve existing patterns, avoid unrelated refactors, and stay within the listed scope.",
    `## Objective\n\n${normalizeMultilineText(input.prompt.objective)}`,
    [
      "## Build Context",
      `- Execution mode: ${executionModeLabel}`,
      `- Priority: ${input.priority}`,
      `- Original request: ${normalizeMultilineText(input.rawPrompt)}`,
      `- Additional context: ${
        input.context && input.context.trim().length > 0
          ? normalizeMultilineText(input.context)
          : "_No additional context provided._"
      }`
    ].join("\n"),
    `## In Scope\n\n${listToBullets(input.prompt.inScope)}`,
    `## Out of Scope\n\n${listToBullets(input.prompt.outOfScope)}`,
    `## Adopted Defaults\n\n${listToBullets(input.prompt.adoptedDefaults)}`,
    `## Deliverables\n\n${listToBullets(deliverables)}`,
    `## Ordered Implementation Steps\n\n${formatOrderedSteps(input.prompt.orderedImplementationSteps)}`,
    `## Data Model\n\n${formatNamedDetailList(input.prompt.dataModel)}`,
    `## API Contracts\n\n${formatApiContracts(input.prompt.apiContracts)}`,
    `## UI Surfaces\n\n${formatNamedDetailList(input.prompt.uiSurfaces, (surface) => `Purpose: ${normalizeMultilineText(surface.purpose ?? "")}`)}`,
    `## Constraints\n\n${listToBullets(input.prompt.implementationConstraints)}`,
    `## Acceptance Checks\n\n${listToBullets(input.prompt.acceptanceChecks)}`,
    `## Agent Instructions\n\n${listToBullets(input.prompt.agentInstructions)}`
  ];

  return {
    title,
    content: joinMarkdownBlocks(blocks)
  };
}
