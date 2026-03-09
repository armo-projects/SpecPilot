import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { ZodError } from "zod";
import { SpecPrintDocument } from "@/components/specs/spec-print-document";
import { SpecPrintToolbar } from "@/components/specs/spec-print-toolbar";
import { specIdParamsSchema } from "@/lib/validations/spec-input.schema";
import {
  buildSpecExportForMockUser,
  isSpecExportServiceError,
  type SpecExportArtifact
} from "@/server/services/spec-export.service";

type PrintPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type PrintPageError = {
  title: string;
  message: string;
  specId?: string;
};

function PrintErrorState({ error }: { error: PrintPageError }) {
  return (
    <section className="mx-auto max-w-3xl">
      <article className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5" />
          <div className="space-y-2">
            <h1 className="text-lg font-semibold">{error.title}</h1>
            <p className="text-sm">{error.message}</p>
            <ButtonRow specId={error.specId} />
          </div>
        </div>
      </article>
    </section>
  );
}

function ButtonRow({ specId }: { specId?: string }) {
  return (
    <div className="print-hidden flex flex-wrap items-center gap-2">
      <Link
        href="/dashboard"
        className="inline-flex items-center rounded-md border bg-white px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
      >
        Back to Dashboard
      </Link>
      {specId ? (
        <Link
          href={`/specs/${specId}`}
          className="inline-flex items-center rounded-md border bg-white px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
        >
          Back to Spec
        </Link>
      ) : null}
    </div>
  );
}

export default async function SpecPrintPage({ params, searchParams }: PrintPageProps) {
  const rawParams = await params;
  const rawSearchParams = await searchParams;
  const idResult = specIdParamsSchema.safeParse(rawParams);

  if (!idResult.success) {
    return (
      <div className="specpilot-print-page">
        <PrintErrorState
          error={{
            title: "Invalid spec id",
            message: "The print link is malformed. Open the spec from the dashboard and try again."
          }}
        />
      </div>
    );
  }

  const query = {
    mode: rawSearchParams.mode,
    sections: rawSearchParams.sections,
    format: "markdown"
  };

  let artifact: SpecExportArtifact | null = null;
  let pageError: PrintPageError | null = null;

  try {
    artifact = await buildSpecExportForMockUser({
      specId: idResult.data.id,
      query
    });
  } catch (error) {
    if (error instanceof ZodError) {
      pageError = {
        title: "Invalid export options",
        message: "The print link has invalid mode or section filters. Return to the spec page and try again.",
        specId: idResult.data.id
      };
    } else if (isSpecExportServiceError(error) && error.code === "SPEC_NOT_FOUND") {
      pageError = {
        title: "Spec not found",
        message: "This spec no longer exists or is not accessible with the current mock user."
      };
    } else if (isSpecExportServiceError(error) && error.code === "PLAN_NOT_FOUND") {
      pageError = {
        title: "No generated plan available",
        message:
          "Generate a plan first, then open print/PDF export again from the spec detail page.",
        specId: idResult.data.id
      };
    } else if (isSpecExportServiceError(error) && error.code === "PROMPT_NOT_AVAILABLE") {
      pageError = {
        title: "Codex-ready prompt unavailable",
        message:
          error.message ||
          "The latest plan does not have a usable Codex-ready prompt. Regenerate the plan to retry.",
        specId: idResult.data.id
      };
    } else {
      console.error("Failed to render print page:", error);
      pageError = {
        title: "Unable to render print view",
        message: "An unexpected error occurred while preparing this document.",
        specId: idResult.data.id
      };
    }
  }

  if (pageError || !artifact) {
    return (
      <div className="specpilot-print-page">
        <PrintErrorState
          error={
            pageError ?? {
              title: "Unable to render print view",
              message: "No export artifact was generated.",
              specId: idResult.data.id
            }
          }
        />
      </div>
    );
  }

  return (
    <div className="specpilot-print-page">
      <SpecPrintToolbar specId={idResult.data.id} />
      <SpecPrintDocument markdown={artifact.content} />
    </div>
  );
}
