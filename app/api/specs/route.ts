import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { createSpecInputSchema } from "@/lib/validations/spec-input.schema";
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
    const spec = await createSpecForMockUser(input);
    return NextResponse.json({ spec }, { status: 201 });
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
