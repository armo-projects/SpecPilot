import "server-only";
import {
  EXPORT_SECTION_ORDER,
  type ExportSectionKey,
  type RenderMarkdownInput,
  type RenderedMarkdownArtifact
} from "@/types/export";
import { EXPORT_TEMPLATES } from "@/server/services/spec-export.templates";

type RendererContext = {
  spec: RenderMarkdownInput["spec"];
  plan: NonNullable<RenderMarkdownInput["spec"]["latestPlanData"]>;
};

type SectionRenderer = (context: RendererContext) => string;

const SECTION_TITLES: Readonly<Record<ExportSectionKey, string>> = {
  product_request: "Product Request",
  additional_context: "Additional Context",
  summary: "Summary",
  requirements: "Requirements",
  assumptions: "Assumptions",
  frontend_tasks: "Frontend Tasks",
  backend_tasks: "Backend Tasks",
  database_schema: "Database Schema",
  api_endpoints: "API Endpoints",
  edge_cases: "Edge Cases",
  test_cases: "Test Cases",
  risks: "Risks and Unknowns"
} as const;

export class MissingSpecPlanDataError extends Error {
  readonly specId: string;

  constructor(specId: string) {
    super("No generated plan data is available for export.");
    this.name = "MissingSpecPlanDataError";
    this.specId = specId;
  }
}

function normalizeMultilineText(value: string): string {
  const text = value.replace(/\r\n/g, "\n").trim();
  return text.length > 0 ? text : "_None provided._";
}

function escapeInlineCode(value: string): string {
  return value.replace(/`/g, "\\`");
}

function escapeTableCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r\n/g, " ").replace(/\n/g, " ").trim();
}

function listToBullets(items: readonly string[]): string {
  if (items.length === 0) {
    return "_None._";
  }

  return items.map((item) => `- ${normalizeMultilineText(item)}`).join("\n");
}

function formatTaskList(
  tasks: ReadonlyArray<{ title: string; description: string; priority: "low" | "medium" | "high" }>
): string {
  if (tasks.length === 0) {
    return "_None._";
  }

  return tasks
    .map((task, index) => {
      const title = normalizeMultilineText(task.title);
      const description = normalizeMultilineText(task.description);
      return `${index + 1}. **${title}** (\`${task.priority.toUpperCase()}\`)\n   - ${description}`;
    })
    .join("\n");
}

function formatDatabaseSchema(
  entities: ReadonlyArray<{
    entity: string;
    fields: ReadonlyArray<{
      name: string;
      type: string;
      required: boolean;
    }>;
  }>
): string {
  if (entities.length === 0) {
    return "_None._";
  }

  const blocks = entities.map((entity) => {
    const header = `### ${normalizeMultilineText(entity.entity)}`;
    const tableHeader = "| Field | Type | Required |\n| --- | --- | --- |";
    const rows = entity.fields
      .map(
        (field) =>
          `| ${escapeTableCell(field.name)} | ${escapeTableCell(field.type)} | ${field.required ? "Yes" : "No"} |`
      )
      .join("\n");

    return [header, tableHeader, rows].join("\n");
  });

  return blocks.join("\n\n");
}

function formatApiEndpoints(
  endpoints: ReadonlyArray<{
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    path: string;
    purpose: string;
  }>
): string {
  if (endpoints.length === 0) {
    return "_None._";
  }

  return endpoints
    .map((endpoint, index) => {
      const purpose = normalizeMultilineText(endpoint.purpose);
      const method = endpoint.method.toUpperCase();
      const path = normalizeMultilineText(endpoint.path);

      return [
        `### Endpoint ${index + 1}`,
        "```http",
        `${method} ${escapeInlineCode(path)}`,
        "```",
        `Purpose: ${purpose}`
      ].join("\n");
    })
    .join("\n\n");
}

const SECTION_RENDERERS: Readonly<Record<ExportSectionKey, SectionRenderer>> = {
  product_request: ({ spec }) => normalizeMultilineText(spec.rawPrompt),
  additional_context: ({ spec }) =>
    spec.context && spec.context.trim().length > 0 ? normalizeMultilineText(spec.context) : "_No additional context provided._",
  summary: ({ plan }) => normalizeMultilineText(plan.summary),
  requirements: ({ plan }) => listToBullets(plan.requirements),
  assumptions: ({ plan }) => listToBullets(plan.assumptions),
  frontend_tasks: ({ plan }) => formatTaskList(plan.frontendTasks),
  backend_tasks: ({ plan }) => formatTaskList(plan.backendTasks),
  database_schema: ({ plan }) => formatDatabaseSchema(plan.databaseSchema),
  api_endpoints: ({ plan }) => formatApiEndpoints(plan.apiEndpoints),
  edge_cases: ({ plan }) => listToBullets(plan.edgeCases),
  test_cases: ({ plan }) => listToBullets(plan.testCases),
  risks: ({ plan }) => listToBullets(plan.risks)
} as const;

function resolveRenderableSections(sections: readonly ExportSectionKey[]): ExportSectionKey[] {
  const selectedSections = new Set<ExportSectionKey>(sections);
  return EXPORT_SECTION_ORDER.filter((section) => selectedSections.has(section));
}

function joinMarkdownBlocks(blocks: readonly string[]): string {
  const normalized = blocks.map((block) => block.trim()).filter((block) => block.length > 0);
  return `${normalized.join("\n\n")}\n`;
}

function renderPreamble(preambleBlocks: readonly string[]): string {
  if (preambleBlocks.length === 0) {
    return "";
  }

  return preambleBlocks.map((block) => normalizeMultilineText(block)).join("\n\n");
}

export function renderSpecMarkdownArtifact(input: RenderMarkdownInput): RenderedMarkdownArtifact {
  if (!input.spec.latestPlanData) {
    throw new MissingSpecPlanDataError(input.spec.id);
  }

  const template = EXPORT_TEMPLATES[input.mode];
  const renderableSections = resolveRenderableSections(input.sections);
  const context: RendererContext = {
    spec: input.spec,
    plan: input.spec.latestPlanData
  };

  const title = template.buildTitle({ spec: input.spec });
  const blocks: string[] = [`# ${title}`];

  const preamble = renderPreamble(template.buildPreamble({ spec: input.spec }));
  if (preamble.length > 0) {
    blocks.push(preamble);
  }

  for (const section of renderableSections) {
    const sectionTitle = template.sectionTitleOverrides?.[section] ?? SECTION_TITLES[section];
    const content = SECTION_RENDERERS[section](context);
    blocks.push(`## ${sectionTitle}\n\n${content}`);
  }

  if (template.buildFooter) {
    const footer = renderPreamble(template.buildFooter({ spec: input.spec }));
    if (footer.length > 0) {
      blocks.push(footer);
    }
  }

  return {
    content: joinMarkdownBlocks(blocks),
    title,
    mode: input.mode,
    sections: renderableSections,
    generatedAt: input.generatedAt ?? input.spec.latestPlanData.createdAt
  };
}
