import type { ReactNode } from "react";
import { Braces, Database, FlaskConical, Layers, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpecPlanData } from "@/types/spec";

type SpecPlanSectionsProps = {
  plan: SpecPlanData;
  variant?: "card" | "document";
};

function SectionCard({
  title,
  icon,
  children,
  variant = "card"
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  variant?: "card" | "document";
}) {
  if (variant === "document") {
    return (
      <article className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        </div>
        {children}
      </article>
    );
  }

  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      </div>
      {children}
    </article>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-700 marker:text-slate-400">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function TaskList({
  title,
  tasks,
  tone,
  variant = "card"
}: {
  title: string;
  tasks: Array<{ title: string; description: string; priority: "low" | "medium" | "high" }>;
  tone?: "frontend" | "backend";
  variant?: "card" | "document";
}) {
  const taskItemClassName =
    variant === "document"
      ? tone === "backend"
        ? "rounded-lg border border-emerald-200/70 bg-emerald-50/50 p-3"
        : "rounded-lg border border-blue-200/70 bg-blue-50/50 p-3"
      : "rounded-lg border bg-slate-50/80 p-3";

  return (
    <SectionCard title={title} icon={<Layers className="h-4 w-4 text-slate-500" />} variant={variant}>
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div key={`${task.title}-${index}`} className={taskItemClassName}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-900">{task.title}</p>
              <span className="rounded-full border bg-white px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-600">
                {task.priority}
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-700">{task.description}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function methodClass(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"): string {
  switch (method) {
    case "GET":
      return "border-blue-200 bg-blue-100 text-blue-700";
    case "POST":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "PUT":
      return "border-amber-200 bg-amber-100 text-amber-700";
    case "PATCH":
      return "border-violet-200 bg-violet-100 text-violet-700";
    case "DELETE":
      return "border-red-200 bg-red-100 text-red-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export function SpecPlanSections({ plan, variant = "card" }: SpecPlanSectionsProps) {
  return (
    <div className={cn("space-y-5", variant === "document" && "space-y-4")}>
      <SectionCard title="Summary" icon={<Sparkles className="h-4 w-4 text-slate-500" />} variant={variant}>
        <p className="text-sm leading-6 text-slate-700">{plan.summary}</p>
      </SectionCard>

      <SectionCard title="Requirements" variant={variant}>
        <BulletList items={plan.requirements} />
      </SectionCard>

      <SectionCard title="Assumptions" variant={variant}>
        <BulletList items={plan.assumptions} />
      </SectionCard>

      <TaskList title="Frontend Tasks" tasks={plan.frontendTasks} tone="frontend" variant={variant} />
      <TaskList title="Backend Tasks" tasks={plan.backendTasks} tone="backend" variant={variant} />

      <SectionCard title="Database Schema" icon={<Database className="h-4 w-4 text-slate-500" />} variant={variant}>
        <div className="space-y-4">
          {plan.databaseSchema.map((entity) => (
            <div key={entity.entity} className="overflow-hidden rounded-lg border">
              <div className="border-b bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">{entity.entity}</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="bg-white text-slate-500">
                      <th className="px-3 py-2 font-medium">Field</th>
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entity.fields.map((field, index) => (
                      <tr key={`${entity.entity}-${field.name}`} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                        <td className="px-3 py-2 font-mono text-xs text-slate-800">{field.name}</td>
                        <td className="px-3 py-2 text-slate-700">{field.type}</td>
                        <td className="px-3 py-2 text-slate-700">{field.required ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="API Endpoints" icon={<Braces className="h-4 w-4 text-slate-500" />} variant={variant}>
        <div className="space-y-2.5">
          {plan.apiEndpoints.map((endpoint, index) => (
            <div key={`${endpoint.method}-${endpoint.path}-${index}`} className="rounded-lg border p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${methodClass(endpoint.method)}`}>
                  {endpoint.method}
                </span>
                <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-900">{endpoint.path}</code>
              </div>
              <p className="text-sm text-slate-700">{endpoint.purpose}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Edge Cases" icon={<ShieldAlert className="h-4 w-4 text-slate-500" />} variant={variant}>
        <BulletList items={plan.edgeCases} />
      </SectionCard>

      <SectionCard title="Test Cases" icon={<FlaskConical className="h-4 w-4 text-slate-500" />} variant={variant}>
        <BulletList items={plan.testCases} />
      </SectionCard>

      <SectionCard title="Risks and Unknowns" variant={variant}>
        <BulletList items={plan.risks} />
      </SectionCard>
    </div>
  );
}
