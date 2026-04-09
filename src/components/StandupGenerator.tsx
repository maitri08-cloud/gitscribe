import { useState, useMemo } from "react";
import { Calendar, Copy, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { CommitLike, StoryLike } from "@/lib/repoNarrative";
import { buildStandup } from "@/lib/repoNarrative";

type StandupGeneratorProps = {
  commits: CommitLike[];
  story: StoryLike | null;
};

const StandupGenerator = ({ commits, story }: StandupGeneratorProps) => {
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const standupData = useMemo(() => buildStandup(commits, story), [commits, story]);

  const standupText = `**Yesterday:**\n${standupData.yesterday.map((i) => `• ${i}`).join("\n")}\n\n**Today:**\n${standupData.today.map((i) => `• ${i}`).join("\n")}\n\n**Blockers:**\n${standupData.blockers.map((i) => `• ${i}`).join("\n")}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(standupText);
    setCopied(true);
    toast.success("Standup copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 opacity-0 animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          📋 Auto Standup
        </h3>
        {!generated && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGenerated(true)}
            className="rounded-full text-xs gap-1.5 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            Generate from repo
          </Button>
        )}
      </div>

      {generated && (
        <div className="rounded-2xl glass-card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="rounded-full text-xs gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            Draft from recent commit subjects and categorized themes — edit before sharing.
          </p>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Recent work (from history)</p>
              <ul className="space-y-1.5">
                {standupData.yesterday.map((item, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Suggested focus</p>
              <ul className="space-y-1.5">
                {standupData.today.map((item, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Blockers</p>
              <ul className="space-y-1.5">
                {standupData.blockers.map((item, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandupGenerator;
