function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

export function SpecDetailSkeleton() {
  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-3">
        <Block className="h-4 w-32" />
        <Block className="h-8 w-96 max-w-full" />
        <div className="flex gap-2">
          <Block className="h-7 w-24 rounded-full" />
          <Block className="h-7 w-20 rounded-full" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          {[0, 1, 2, 3].map((idx) => (
            <article key={idx} className="rounded-xl border bg-card p-5 shadow-sm">
              <Block className="mb-3 h-5 w-48" />
              <div className="space-y-2">
                <Block className="h-4 w-full" />
                <Block className="h-4 w-11/12" />
                <Block className="h-4 w-2/3" />
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-5">
          {[0, 1].map((idx) => (
            <article key={idx} className="rounded-xl border bg-card p-5 shadow-sm">
              <Block className="mb-3 h-5 w-40" />
              <div className="space-y-2">
                <Block className="h-4 w-full" />
                <Block className="h-4 w-4/5" />
                <Block className="h-4 w-3/5" />
              </div>
            </article>
          ))}
        </aside>
      </div>
    </section>
  );
}
