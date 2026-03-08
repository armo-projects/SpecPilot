"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

type SpecPrintToolbarProps = {
  specId: string;
};

export function SpecPrintToolbar({ specId }: SpecPrintToolbarProps) {
  function handlePrint(): void {
    window.print();
  }

  return (
    <div className="specpilot-print-toolbar print:hidden">
      <Button type="button" size="sm" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print / Save as PDF
      </Button>
      <Button asChild type="button" size="sm" variant="outline">
        <Link href={`/specs/${specId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Spec
        </Link>
      </Button>
    </div>
  );
}
