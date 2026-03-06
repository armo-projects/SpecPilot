import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { CreateSpecInput, UpdateSpecInput } from "@/lib/validations/spec-input.schema";
import { getOrCreateMockUser } from "@/server/auth/mock-user";
import type { SpecDetail, SpecListItem, SpecPlanPreview } from "@/types/spec";

const latestPlanInclude = {
  plans: {
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      id: true,
      version: true,
      summary: true,
      createdAt: true
    }
  }
} satisfies Prisma.SpecInclude;

function normalizeOptionalContext(value: string | null | undefined): string | null | undefined {
  if (value === undefined || value === null) {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function mapPlanPreview(plan: { id: string; version: number; summary: string; createdAt: Date } | undefined): SpecPlanPreview | null {
  if (!plan) {
    return null;
  }
  return {
    id: plan.id,
    version: plan.version,
    summary: plan.summary,
    createdAt: plan.createdAt
  };
}

function mapSpecToListItem(spec: {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "DRAFT" | "GENERATING" | "COMPLETED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
  plans: Array<{ id: string; version: number; summary: string; createdAt: Date }>;
}): SpecListItem {
  return {
    id: spec.id,
    title: spec.title,
    priority: spec.priority,
    status: spec.status,
    createdAt: spec.createdAt,
    updatedAt: spec.updatedAt,
    latestPlan: mapPlanPreview(spec.plans[0])
  };
}

function mapSpecToDetail(spec: {
  id: string;
  title: string;
  rawPrompt: string;
  context: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "DRAFT" | "GENERATING" | "COMPLETED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
  plans: Array<{ id: string; version: number; summary: string; createdAt: Date }>;
}): SpecDetail {
  return {
    id: spec.id,
    title: spec.title,
    rawPrompt: spec.rawPrompt,
    context: spec.context,
    priority: spec.priority,
    status: spec.status,
    createdAt: spec.createdAt,
    updatedAt: spec.updatedAt,
    latestPlan: mapPlanPreview(spec.plans[0])
  };
}

export async function listSpecsForMockUser(): Promise<SpecListItem[]> {
  const user = await getOrCreateMockUser();
  const specs = await db.spec.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: latestPlanInclude
  });

  return specs.map(mapSpecToListItem);
}

export async function createSpecForMockUser(input: CreateSpecInput): Promise<SpecDetail> {
  const user = await getOrCreateMockUser();
  const spec = await db.spec.create({
    data: {
      userId: user.id,
      title: input.title,
      rawPrompt: input.rawPrompt,
      context: normalizeOptionalContext(input.context),
      priority: input.priority,
      status: "DRAFT"
    },
    include: latestPlanInclude
  });

  return mapSpecToDetail(spec);
}

export async function getSpecForMockUser(specId: string): Promise<SpecDetail | null> {
  const user = await getOrCreateMockUser();
  const spec = await db.spec.findFirst({
    where: { id: specId, userId: user.id },
    include: latestPlanInclude
  });

  return spec ? mapSpecToDetail(spec) : null;
}

export async function updateSpecForMockUser(specId: string, input: UpdateSpecInput): Promise<SpecDetail | null> {
  const user = await getOrCreateMockUser();
  const existing = await db.spec.findFirst({
    where: { id: specId, userId: user.id },
    select: { id: true }
  });

  if (!existing) {
    return null;
  }

  const updateData: Prisma.SpecUpdateInput = {};
  if (input.title !== undefined) {
    updateData.title = input.title;
  }
  if (input.rawPrompt !== undefined) {
    updateData.rawPrompt = input.rawPrompt;
  }
  if (input.context !== undefined) {
    updateData.context = normalizeOptionalContext(input.context);
  }
  if (input.priority !== undefined) {
    updateData.priority = input.priority;
  }

  const spec = await db.spec.update({
    where: { id: specId },
    data: updateData,
    include: latestPlanInclude
  });

  return mapSpecToDetail(spec);
}
