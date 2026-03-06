"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateSpecInputSchema } from "@/lib/validations/spec-input.schema";
import type { ApiErrorResponse, GetSpecApiResponse, SpecDetail } from "@/types/spec";

type UpdateSpecFormProps = {
  spec: SpecDetail;
};

type FormValues = {
  title: string;
  rawPrompt: string;
  context: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
};

export function UpdateSpecForm({ spec }: UpdateSpecFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({
    title: spec.title,
    rawPrompt: spec.rawPrompt,
    context: spec.context ?? "",
    priority: spec.priority
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange<Key extends keyof FormValues>(key: Key, value: FormValues[Key]): void {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);

    const parsed = updateSpecInputSchema.safeParse({
      title: values.title,
      rawPrompt: values.rawPrompt,
      context: values.context,
      priority: values.priority
    });

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Please review your updates.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/specs/${spec.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });

      const data = (await response.json()) as GetSpecApiResponse | ApiErrorResponse;
      if (!response.ok) {
        setErrorMessage("error" in data ? data.error : "Failed to update spec.");
        return;
      }

      if (!("spec" in data)) {
        setErrorMessage("Unexpected API response.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Update spec failed:", error);
      setErrorMessage("Request failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold">Edit Input</h2>

      <div className="space-y-2">
        <label htmlFor="edit-title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="edit-title"
          type="text"
          value={values.title}
          onChange={(event) => handleChange("title", event.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="edit-rawPrompt" className="text-sm font-medium">
          Product request / ticket
        </label>
        <textarea
          id="edit-rawPrompt"
          value={values.rawPrompt}
          onChange={(event) => handleChange("rawPrompt", event.target.value)}
          className="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="edit-context" className="text-sm font-medium">
          Context
        </label>
        <textarea
          id="edit-context"
          value={values.context}
          onChange={(event) => handleChange("context", event.target.value)}
          className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="edit-priority" className="text-sm font-medium">
          Priority
        </label>
        <select
          id="edit-priority"
          value={values.priority}
          onChange={(event) => handleChange("priority", event.target.value as FormValues["priority"])}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" variant="outline" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
