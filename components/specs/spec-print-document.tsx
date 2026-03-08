import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type SpecPrintDocumentProps = {
  markdown: string;
};

export function SpecPrintDocument({ markdown }: SpecPrintDocumentProps) {
  return (
    <article className="specpilot-print-document">
      <div className="specpilot-print-markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </article>
  );
}
