import { useState, useMemo } from "react";
import { GitCommit, ArrowRight, Zap, Info } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { CommitLike } from "@/lib/repoNarrative";
import { explainCommit, pickExplainerCommits, firstLine } from "@/lib/repoNarrative";

type CommitExplainerProps = {
  commits: CommitLike[];
};

const CommitExplainer = ({ commits }: CommitExplainerProps) => {
  const picked = useMemo(() => pickExplainerCommits(commits, 6), [commits]);
  const [selected, setSelected] = useState<(CommitLike & { explanation: string; impact: string }) | null>(null);

  const open = (c: CommitLike) => {
    const { explanation, impact } = explainCommit(c);
    setSelected({ ...c, explanation, impact });
  };

  return (
    <div className="space-y-4 opacity-0 animate-slide-up" style={{ animationDelay: "0.25s" }}>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          🔍 Click to Explain
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
          From commit messages
        </span>
      </div>

      {picked.length === 0 ? (
        <p className="text-sm text-muted-foreground">No commits available to explain.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {picked.map((commit) => (
            <button
              key={commit.hash}
              type="button"
              onClick={() => open(commit)}
              className="flex items-center gap-3 rounded-xl glass-card p-4 text-left hover-lift cursor-pointer group transition-all"
            >
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <GitCommit className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-muted-foreground">{commit.hash}</p>
                <p className="text-sm font-medium text-foreground truncate">{firstLine(commit.message)}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-primary" />
              Commit explanation
            </SheetTitle>
            <SheetDescription>
              Heuristic read of{" "}
              <code className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">{selected?.hash}</code> — not a full
              diff analysis.
            </SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-6 space-y-6">
              <div className="rounded-xl bg-secondary/50 p-4 border border-border/30">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Subject</p>
                <p className="text-sm font-mono text-foreground">{firstLine(selected.message)}</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Explanation</p>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{selected.explanation}</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="w-3.5 h-3.5 text-accent" />
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Why it matters</p>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{selected.impact}</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CommitExplainer;
