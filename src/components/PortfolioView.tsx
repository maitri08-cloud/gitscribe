import { Briefcase, Copy, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { CommitLike, StoryLike } from "@/lib/repoNarrative";
import { buildPortfolioBullets } from "@/lib/repoNarrative";

type PortfolioViewProps = {
  story: StoryLike | null;
  commits: CommitLike[];
};

const PortfolioView = ({ story, commits }: PortfolioViewProps) => {
  const [copied, setCopied] = useState(false);
  const items = useMemo(() => buildPortfolioBullets(story, commits), [story, commits]);

  const handleCopy = () => {
    const text = items.map((item) => `• ${item}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Portfolio highlights copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl glass-card p-8 opacity-0 animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/10">
            <Briefcase className="w-4 h-4 text-accent" />
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Portfolio Highlights</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="text-muted-foreground hover:text-foreground gap-1.5">
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy for Resume"}
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Analyze a repository to generate highlights from its commit history.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-foreground opacity-0 animate-fade-up"
              style={{ animationDelay: `${0.3 + i * 0.08}s` }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PortfolioView;
