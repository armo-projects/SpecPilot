import { SpecMarkdownContent } from "@/components/specs/spec-markdown-content";

type SpecPrintDocumentProps = {
  markdown: string;
};

export function SpecPrintDocument({ markdown }: SpecPrintDocumentProps) {
  return (
    <article className="specpilot-print-document">
      <SpecMarkdownContent markdown={markdown} className="specpilot-print-markdown" />
    </article>
  );
}
