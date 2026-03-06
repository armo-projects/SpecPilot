"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createSpecInputSchema } from "@/lib/validations/spec-input.schema";
import type { ApiErrorResponse, CreateSpecApiResponse } from "@/types/spec";

type FormValues = {
  title: string;
  rawPrompt: string;
  context: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
};

const INITIAL_VALUES: FormValues = {
  title: "",
  rawPrompt: "",
  context: "",
  priority: "MEDIUM"
};

export function CreateSpecForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange<Key extends keyof FormValues>(key: Key, value: FormValues[Key]): void {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFieldError(null);
    setSubmitError(null);

    const parsed = createSpecInputSchema.safeParse({
      title: values.title,
      rawPrompt: values.rawPrompt,
      context: values.context,
      priority: values.priority
    });

    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Please review your input.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });

      const data = (await response.json()) as CreateSpecApiResponse | ApiErrorResponse;
      if (!response.ok) {
        setSubmitError("error" in data ? data.error : "Failed to create spec.");
        return;
      }

      if (!("spec" in data)) {
        setSubmitError("Unexpected API response.");
        return;
      }

      router.push(`/specs/${data.spec.id}`);
      router.refresh();
    } catch (error) {
      console.error("Create spec failed:", error);
      setSubmitError("Request failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={values.title}
          onChange={(event) => handleChange("title", event.target.value)}
          placeholder="Invoice upload with line-item extraction"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="rawPrompt" className="text-sm font-medium">
          Product request / ticket
        </label>
        <textarea
          id="rawPrompt"
          value={values.rawPrompt}
          onChange={(event) => handleChange("rawPrompt", event.target.value)}
          placeholder="Users should be able to upload invoices and automatically extract line items."
          className="min-h-40 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="context" className="text-sm font-medium">
          Optional context
        </label>
        <textarea
          id="context"
          value={values.context}
          onChange={(event) => handleChange("context", event.target.value)}
          placeholder="Current stack, constraints, deadlines, existing services..."
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="priority" className="text-sm font-medium">
          Priority
        </label>
        <select
          id="priority"
          value={values.priority}
          onChange={(event) => handleChange("priority", event.target.value as FormValues["priority"])}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {fieldError ? <p className="text-sm text-red-600">{fieldError}</p> : null}
      {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Spec"}
        </Button>
      </div>
    </form>
  );
}
