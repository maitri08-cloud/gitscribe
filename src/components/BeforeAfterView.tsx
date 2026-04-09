import { useState } from "react";
import { ArrowLeftRight, GitCommit, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CommitLike, StoryLike } from "@/lib/repoNarrative";
import { rawMessagesForCompare, structuredFromStory } from "@/lib/repoNarrative";

type BeforeAfterViewProps = {
  commits: CommitLike[];
  story: StoryLike | null;
};

const BeforeAfterView = ({ commits, story }: BeforeAfterViewProps) => {
  const [showCompare, setShowCompare] = useState(false);
  const raw = rawMessagesForCompare(commits);
  const structured = structuredFromStory(story);

  return (
    <div className="space-y-4 opacity-0 animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          🔄 Before vs After
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCompare(!showCompare)}
          className="rounded-full text-xs gap-1.5 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          {showCompare ? "Hide Compare" : "Compare View"}
        </Button>
      </div>

      {showCompare && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          <div className="rounded-2xl glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <GitCommit className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Raw commit subjects
              </span>
            </div>
            {raw.length === 0 ? (
              <p className="text-sm text-muted-foreground">No commits to show.</p>
            ) : (
              <ul className="space-y-2">
                {raw.map((c, i) => (
                  <li
                    key={`${c}-${i}`}
                    className="text-sm font-mono px-3 py-2 rounded-lg bg-secondary/50 text-muted-foreground border border-border/30"
                  >
                    <span className="text-muted-foreground/50 mr-2">$</span>
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Grouped from messages
              </span>
            </div>
            {structured.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No feat/fix/refactor-style subjects found in this sample. Try a repo with clearer prefixes.
              </p>
            ) : (
              <ul className="space-y-2">
                {structured.map((item, i) => (
                  <li
                    key={`${item.type}-${i}`}
                    className="text-sm px-3 py-2 rounded-lg bg-secondary/50 border border-border/30 flex items-center gap-2"
                  >
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        item.type === "Feature"
                          ? "bg-primary/10 text-primary"
                          : item.type === "Fix"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-accent/10 text-accent"
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BeforeAfterView;
