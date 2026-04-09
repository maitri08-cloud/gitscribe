import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { StoryLike } from "@/lib/repoNarrative";
import { buildChangelogMarkdown } from "@/lib/repoNarrative";

type ReleaseNotesProps = {
  repoLabel: string;
  story: StoryLike | null;
};

const ReleaseNotes = ({ repoLabel, story }: ReleaseNotesProps) => {
  const releaseContent = useMemo(() => buildChangelogMarkdown(repoLabel, story), [repoLabel, story]);

  const handleCopy = () => {
    navigator.clipboard.writeText(releaseContent);
    toast.success("Release notes copied!");
  };

  return (
    <div className="relative rounded-2xl glass-card overflow-hidden opacity-0 animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <span className="text-sm text-muted-foreground ml-2 font-mono">CHANGELOG.md</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="text-muted-foreground hover:text-foreground gap-1.5">
          <Copy className="w-3.5 h-3.5" />
          Copy
        </Button>
      </div>
      <div className="p-6 font-mono text-sm leading-relaxed overflow-auto max-h-[500px]">
        {releaseContent.split("\n").map((line, i) => {
          let className = "text-muted-foreground";
          if (line.startsWith("## ")) className = "text-foreground font-bold text-base mt-2";
          else if (line.startsWith("### ")) className = "text-foreground font-semibold mt-4 mb-1";
          else if (line.startsWith("- ")) className = "text-muted-foreground pl-4";
          else if (line.startsWith("_")) className = "text-muted-foreground/70 italic pl-2 text-xs";
          return (
            <p key={i} className={className}>
              {line || "\u00A0"}
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default ReleaseNotes;
