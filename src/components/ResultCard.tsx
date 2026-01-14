import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trackCopyResult } from "@/utils/analytics";

interface ResultCardProps {
  version: "A" | "B" | "C";
  title: string;
  subtitle: string;
  content: string;
  delay?: number;
}

const versionStyles = {
  A: {
    border: "version-a-border",
    text: "text-version-a",
    badge: "bg-version-a/10 text-version-a border-version-a/30",
  },
  B: {
    border: "version-b-border",
    text: "text-version-b",
    badge: "bg-version-b/10 text-version-b border-version-b/30",
  },
  C: {
    border: "version-c-border",
    text: "text-version-c",
    badge: "bg-version-c/10 text-version-c border-version-c/30",
  },
};

export function ResultCard({ version, title, subtitle, content, delay = 0 }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const styles = versionStyles[version];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("已复制到剪贴板");
    trackCopyResult(`Version ${version}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`gradient-card rounded-lg border border-border/50 p-5 ${styles.border} animate-fade-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-0.5 text-xs font-mono font-semibold rounded border ${styles.badge}`}
          >
            {version}
          </span>
          <div>
            <h3 className={`font-semibold ${styles.text}`}>{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <Button
          variant="copy"
          size="icon-sm"
          onClick={handleCopy}
          className="shrink-0"
        >
          {copied ? (
            <Check className="h-4 w-4 text-version-a" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="font-mono text-sm leading-relaxed text-foreground/90">
        {content}
      </p>
    </div>
  );
}
