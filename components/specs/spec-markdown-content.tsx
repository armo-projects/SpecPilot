import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type SpecMarkdownContentProps = {
  markdown: string;
  className?: string;
};

export function SpecMarkdownContent({ markdown, className }: SpecMarkdownContentProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
