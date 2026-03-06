import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <SiteHeader />
      <main className="container py-8">{children}</main>
    </div>
  );
}
