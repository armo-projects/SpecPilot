import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { specIdParamsSchema } from "@/lib/validations/spec-input.schema";
import { generateSpecPlanForMockUser, toGenerationPayload } from "@/server/services/spec-generation.service";
import type { ApiErrorResponse, GenerateSpecApiResponse } from "@/types/spec";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validationErrorResponse(error: ZodError): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: "Invalid request payload.",
      details: error.flatten()
    },
    { status: 400 }
  );
}

export async function POST(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<GenerateSpecApiResponse | ApiErrorResponse>> {
  try {
    const params = specIdParamsSchema.parse(await context.params);
    const result = await generateSpecPlanForMockUser(params.id);

    if (!result) {
      return NextResponse.json({ error: "Spec not found." }, { status: 404 });
    }

    return NextResponse.json({
      spec: result.spec,
      generation: toGenerationPayload(result)
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    console.error("Failed to generate plan:", error);
    return NextResponse.json({ error: "Failed to generate plan." }, { status: 500 });
  }
}
