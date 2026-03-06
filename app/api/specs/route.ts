import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { createSpecInputSchema } from "@/lib/validations/spec-input.schema";
import { generateSpecPlanForMockUser, toGenerationPayload } from "@/server/services/spec-generation.service";
import { createSpecForMockUser, listSpecsForMockUser } from "@/server/services/specs.service";
import type { ApiErrorResponse, CreateSpecApiResponse, ListSpecsApiResponse } from "@/types/spec";

function validationErrorResponse(error: ZodError): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: "Invalid request payload.",
      details: error.flatten()
    },
    { status: 400 }
  );
}

export async function GET(): Promise<NextResponse<ListSpecsApiResponse | ApiErrorResponse>> {
  try {
    const specs = await listSpecsForMockUser();
    return NextResponse.json({ specs });
  } catch (error) {
    console.error("Failed to list specs:", error);
    return NextResponse.json({ error: "Failed to load specs." }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateSpecApiResponse | ApiErrorResponse>> {
  try {
    const body = await request.json();
    const input = createSpecInputSchema.parse(body);
    const createdSpec = await createSpecForMockUser(input);
    const generationResult = await generateSpecPlanForMockUser(createdSpec.id);
    const generation = toGenerationPayload(generationResult, "Failed to generate plan after creating spec.");

    if (!generationResult) {
      return NextResponse.json({ error: "Spec created but generation could not start." }, { status: 500 });
    }

    return NextResponse.json(
      {
        spec: generationResult.spec,
        generation
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    console.error("Failed to create spec:", error);
    return NextResponse.json({ error: "Failed to create spec." }, { status: 500 });
  }
}
