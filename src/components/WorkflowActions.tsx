import { FileText, MessageSquare, Briefcase, Share2 } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { CommitLike, StoryLike } from "@/lib/repoNarrative";
import { buildChangelogMarkdown, buildStandup, buildPortfolioBullets } from "@/lib/repoNarrative";

type WorkflowActionsProps = {
  repoLabel: string;
  commits: CommitLike[];
  story: StoryLike | null;
};

const WorkflowActions = ({ repoLabel, commits, story }: WorkflowActionsProps) => {
  const releaseNotesText = useMemo(() => buildChangelogMarkdown(repoLabel, story), [repoLabel, story]);
  const standupData = useMemo(() => buildStandup(commits, story), [commits, story]);
  const standupText = useMemo(
    () =>
      `Yesterday:\n${standupData.yesterday.map((i) => `• ${i}`).join("\n")}\n\nToday:\n${standupData.today.map((i) => `• ${i}`).join("\n")}\n\nBlockers:\n${standupData.blockers.map((i) => `• ${i}`).join("\n")}`,
    [standupData]
  );
  const portfolioText = useMemo(() => {
    const bullets = buildPortfolioBullets(story, commits);
    return bullets.map((b) => `• ${b}`).join("\n");
  }, [story, commits]);

  const actions = [
    {
      icon: FileText,
      label: "Export to Release Notes",
      action: () => {
        navigator.clipboard.writeText(releaseNotesText);
        toast.success("Release notes copied to clipboard!");
      },
    },
    {
      icon: MessageSquare,
      label: "Copy for Standup",
      action: () => {
        navigator.clipboard.writeText(standupText);
        toast.success("Standup update copied to clipboard!");
      },
    },
    {
      icon: Briefcase,
      label: "Use in Portfolio",
      action: () => {
        navigator.clipboard.writeText(portfolioText || "• _(No highlights yet — analyze a repo.)_");
        toast.success("Portfolio highlights copied to clipboard!");
      },
    },
    {
      icon: Share2,
      label: "Share Report",
      action: () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Share link copied to clipboard!");
      },
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 opacity-0 animate-fade-up" style={{ animationDelay: "0.25s" }}>
      {actions.map((a) => (
        <Button
          key={a.label}
          variant="outline"
          size="sm"
          onClick={a.action}
          className="rounded-full text-xs gap-1.5 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
        >
          <a.icon className="w-3.5 h-3.5" />
          {a.label}
        </Button>
      ))}
    </div>
  );
};

export default WorkflowActions;
