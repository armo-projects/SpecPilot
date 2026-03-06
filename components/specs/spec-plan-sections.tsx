import type { SpecPlanData } from "@/types/spec";

type SpecPlanSectionsProps = {
  plan: SpecPlanData;
};

function SimpleList({ items }: { items: string[] }) {
  return (
    <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function TaskList({
  title,
  tasks
}: {
  title: string;
  tasks: Array<{ title: string; description: string; priority: "low" | "medium" | "high" }>;
}) {
  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div key={`${task.title}-${index}`} className="rounded-md border bg-slate-50 p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-900">{task.title}</p>
              <span className="rounded border bg-white px-2 py-0.5 text-xs uppercase text-slate-600">{task.priority}</span>
            </div>
            <p className="text-sm text-slate-700">{task.description}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export function SpecPlanSections({ plan }: SpecPlanSectionsProps) {
  return (
    <div className="space-y-5">
      <article className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="mb-2 text-base font-semibold">Summary</h2>
        <p className="text-sm text-slate-700">{plan.summary}</p>
      </article>

      <article className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-2 text-base font-semibold">Requirements</h3>
        <SimpleList items={plan.requirements} />
      </article>

      <article className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-2 text-base font-semibold">Assumptions</h3>
        <SimpleList items={plan.assumptions} />
      </article>

      <TaskList title="Frontend Tasks" tasks={plan.frontendTasks} />
      <TaskList title="Backend Tasks" tasks={plan.backendTasks} />

      <article className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Database Schema</h3>
        <div className="space-y-4">
          {plan.databaseSchema.map((entity) => (
            <div key={entity.entity} className="rounded-md border p-3">
              <p className="mb-2 text-sm font-semibold text-slate-900">{entity.entity}</p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="pb-1 pr-4 font-medium">Field</th>
                      <th className="pb-1 pr-4 font-medium">Type</th>
                      <th className="pb-1 font-medium">Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entity.fields.map((field) => (
                      <tr key={`${entity.entity}-${field.name}`} className="text-slate-700">
                        <td className="py-1 pr-4">{field.name}</td>
                        <td className="py-1 pr-4">{field.type}</td>
                        <td className="py-1">{field.required ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">API Endpoints</h3>
        <div className="space-y-2">
          {plan.apiEndpoints.map((endpoint, index) => (
            <div key={`${endpoint.method}-${endpoint.path}-${index}`} className="rounded-md border p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded border bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{endpoint.method}</span>
                <code className="text-xs text-slate-900">{endpoint.path}</code>
              </div>
              <p className="text-sm text-slate-700">{endpoint.purpose}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-2 text-base font-semibold">Edge Cases</h3>
        <SimpleList items={plan.edgeCases} />
      </article>

      <article className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-2 text-base font-semibold">Test Cases</h3>
        <SimpleList items={plan.testCases} />
      </article>

      <article className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-2 text-base font-semibold">Risks and Unknowns</h3>
        <SimpleList items={plan.risks} />
      </article>
    </div>
  );
}
