import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { specIdParamsSchema } from "@/lib/validations/spec-input.schema";
import {
  buildSpecExportForMockUser,
  isSpecExportServiceError
} from "@/server/services/spec-export.service";
import type { ApiErrorResponse } from "@/types/spec";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ExportApiErrorCode =
  | "INVALID_EXPORT_QUERY"
  | "SPEC_NOT_FOUND"
  | "PLAN_NOT_FOUND"
  | "EXPORT_FAILED";

type ExportApiErrorResponse = ApiErrorResponse & {
  code: ExportApiErrorCode;
};

function validationErrorResponse(error: ZodError): NextResponse<ExportApiErrorResponse> {
  return NextResponse.json(
    {
      error: "Invalid export query.",
      code: "INVALID_EXPORT_QUERY",
      details: error.flatten()
    },
    { status: 400 }
  );
}

function toSafeAttachmentFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<string | ExportApiErrorResponse>> {
  try {
    const params = specIdParamsSchema.parse(await context.params);
    const artifact = await buildSpecExportForMockUser({
      specId: params.id,
      query: request.nextUrl.searchParams
    });

    const headers = new Headers({
      "Content-Type": artifact.contentType,
      "Cache-Control": "no-store",
      "X-SpecPilot-Export-Mode": artifact.mode,
      "X-SpecPilot-Export-Sections": artifact.sections.join(","),
      "X-SpecPilot-Export-Title": encodeURIComponent(artifact.title)
    });

    if (artifact.format === "markdown") {
      headers.set(
        "Content-Disposition",
        `attachment; filename="${toSafeAttachmentFilename(artifact.filename)}"`
      );
    }

    return new NextResponse(artifact.content, {
      status: 200,
      headers
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    if (isSpecExportServiceError(error)) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code
        },
        { status: error.statusCode }
      );
    }

    console.error("Failed to export spec:", error);
    return NextResponse.json(
      {
        error: "Failed to export spec.",
        code: "EXPORT_FAILED"
      },
      { status: 500 }
    );
  }
}
