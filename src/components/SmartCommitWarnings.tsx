import { useState, useCallback } from "react";
import {
  AlertTriangle,
  XCircle,
  CheckCircle,
  ChevronDown,
  Copy,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import type { WarningCommit, CommitLike } from "@/lib/repoNarrative";
import { commitsForWarnings } from "@/lib/repoNarrative";
import { suggestCommitRewrite } from "@/lib/suggestCommitMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SmartCommitWarningsProps = {
  commits: CommitLike[];
  corrections: Record<string, string>;
  onCorrectionSave: (hash: string, correctedSubject: string) => void;
  onCorrectionClear: (hash: string) => void;
};

const SmartCommitWarnings = ({
  commits,
  corrections,
  onCorrectionSave,
  onCorrectionClear,
}: SmartCommitWarningsProps) => {
  const badCommits = commitsForWarnings(commits);
  const [openHash, setOpenHash] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const handleOpenChange = useCallback((hash: string, open: boolean, c: WarningCommit) => {
    if (open) {
      setDrafts((prev) => {
        if (prev[hash] !== undefined) return prev;
        return { ...prev, [hash]: corrections[hash] ?? suggestCommitRewrite(c.subjectFull) };
      });
      setOpenHash(hash);
    } else {
      setOpenHash((cur) => (cur === hash ? null : cur));
    }
  }, [corrections]);

  const correctedCount = Object.keys(corrections).length;

  if (!badCommits.length) {
    return (
      <div className="space-y-3 opacity-0 animate-slide-up" style={{ animationDelay: "0.35s" }}>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Commit Warnings
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-semibold">0 issues</span>
        </div>
        <div className="rounded-2xl glass-card p-5 border border-success/20 flex items-start gap-3">
          <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            No very short or empty subjects stood out in this sample. Keep using clear, scoped commit messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 opacity-0 animate-slide-up" style={{ animationDelay: "0.35s" }}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Commit Warnings
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/10 text-warning font-semibold">
          {badCommits.length} issue{badCommits.length === 1 ? "" : "s"}
        </span>
        {correctedCount > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {correctedCount} corrected in session
          </span>
        )}
      </div>

      <div className="rounded-2xl glass-card p-5 border border-warning/20">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
          <span className="text-xs font-medium text-warning">Low-signal subjects — expand a row to rewrite here</span>
        </div>

        <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
          Edits are saved in this browser session only. This app cannot change Git history; use your corrected line when
          you amend on GitHub or locally.
        </p>

        <div className="space-y-2">
          {badCommits.map((commit) => {
            const isOpen = openHash === commit.hash;
            const saved = corrections[commit.hash];
            const lineValue =
              drafts[commit.hash] ?? saved ?? suggestCommitRewrite(commit.subjectFull);

            return (
              <Collapsible
                key={commit.hash}
                open={isOpen}
                onOpenChange={(open) => handleOpenChange(commit.hash, open, commit)}
              >
                <div
                  className={cn(
                    "rounded-lg border border-border/50 bg-secondary/40 overflow-hidden transition-colors",
                    isOpen && "ring-1 ring-primary/25 border-primary/30"
                  )}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary/70 transition-colors"
                    >
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-muted-foreground shrink-0 transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                      {saved ? (
                        <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                      ) : (
                        <XCircle
                          className={`w-3.5 h-3.5 shrink-0 ${commit.severity === "high" ? "text-destructive" : "text-warning"}`}
                        />
                      )}
                      <code className="text-xs font-mono text-muted-foreground shrink-0">{commit.hash}</code>
                      <div className="flex-1 min-w-0">
                        {saved ? (
                          <>
                            <p className="text-xs font-mono text-muted-foreground line-through truncate">{commit.message}</p>
                            <p className="text-sm font-mono text-success truncate">{saved}</p>
                          </>
                        ) : (
                          <span className="text-sm font-mono text-foreground truncate">{commit.message}</span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0",
                          commit.severity === "high"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-warning/10 text-warning"
                        )}
                      >
                        {commit.severity}
                      </span>
                    </button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-3 pb-3 pt-0 space-y-3 border-t border-border/40 bg-background/40">
                      <div>
                        <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Flagged subject</p>
                        <p className="text-sm font-mono leading-relaxed rounded-md px-2 py-1.5 bg-destructive/10 border border-destructive/25 text-foreground ring-1 ring-destructive/20">
                          {commit.subjectFull}
                        </p>
                      </div>

                      <div>
                        <label htmlFor={`fix-${commit.hash}`} className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5 block">
                          Corrected subject (edit like a code fix)
                        </label>
                        <Textarea
                          id={`fix-${commit.hash}`}
                          value={lineValue}
                          onChange={(e) => setDrafts((d) => ({ ...d, [commit.hash]: e.target.value }))}
                          rows={3}
                          className="font-mono text-sm resize-y min-h-[72px]"
                          spellCheck
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            const text = lineValue.trim();
                            if (!text) {
                              toast.error("Write a subject first.");
                              return;
                            }
                            onCorrectionSave(commit.hash, text);
                            toast.success("Saved for this session — copy or use when amending on Git.");
                          }}
                        >
                          Save correction
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1"
                          onClick={() => {
                            const text = lineValue.trim();
                            if (!text) return;
                            navigator.clipboard.writeText(text);
                            toast.success("Copied corrected subject");
                          }}
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs gap-1"
                          onClick={() => {
                            const next = suggestCommitRewrite(commit.subjectFull);
                            setDrafts((d) => ({ ...d, [commit.hash]: next }));
                            toast.message("Suggestion reset");
                          }}
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset suggestion
                        </Button>
                        {saved && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground"
                            onClick={() => {
                              onCorrectionClear(commit.hash);
                              setDrafts((d) => {
                                const next = { ...d };
                                delete next[commit.hash];
                                return next;
                              });
                              toast.message("Cleared local correction");
                            }}
                          >
                            Clear save
                          </Button>
                        )}
                        {commit.url && (
                          <Button type="button" variant="outline" size="sm" className="text-xs gap-1 ml-auto" asChild>
                            <a href={commit.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3" />
                              View on GitHub
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Tip:{" "}
          <span className="text-primary font-medium">Conventional Commits</span> (feat/fix/docs/chore) improve tooling and
          changelogs.
        </p>
      </div>
    </div>
  );
};

export default SmartCommitWarnings;
