import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { specIdParamsSchema, updateSpecInputSchema } from "@/lib/validations/spec-input.schema";
import {
  deleteSpecForMockUser,
  getSpecForMockUser,
  updateSpecForMockUser
} from "@/server/services/specs.service";
import type { ApiErrorResponse, GetSpecApiResponse } from "@/types/spec";

function validationErrorResponse(error: ZodError): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: "Invalid request payload.",
      details: error.flatten()
    },
    { status: 400 }
  );
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<GetSpecApiResponse | ApiErrorResponse>> {
  try {
    const params = specIdParamsSchema.parse(await context.params);
    const spec = await getSpecForMockUser(params.id);

    if (!spec) {
      return NextResponse.json({ error: "Spec not found." }, { status: 404 });
    }

    return NextResponse.json({ spec });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    console.error("Failed to load spec:", error);
    return NextResponse.json({ error: "Failed to load spec." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<GetSpecApiResponse | ApiErrorResponse>> {
  try {
    const params = specIdParamsSchema.parse(await context.params);
    const body = await request.json();
    const input = updateSpecInputSchema.parse(body);
    const spec = await updateSpecForMockUser(params.id, input);

    if (!spec) {
      return NextResponse.json({ error: "Spec not found." }, { status: 404 });
    }

    return NextResponse.json({ spec });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    console.error("Failed to update spec:", error);
    return NextResponse.json({ error: "Failed to update spec." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const params = specIdParamsSchema.parse(await context.params);
    const deleted = await deleteSpecForMockUser(params.id);

    if (!deleted) {
      return NextResponse.json({ error: "Spec not found." }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    console.error("Failed to delete spec:", error);
    return NextResponse.json({ error: "Failed to delete spec." }, { status: 500 });
  }
}
