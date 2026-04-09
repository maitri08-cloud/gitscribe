import { Sparkles } from "lucide-react";
import type { CommitLike, StoryLike, AnalysisLike } from "@/lib/repoNarrative";
import { buildAiSummaryParagraph } from "@/lib/repoNarrative";

type SummaryCardProps = {
  commits: CommitLike[];
  story: StoryLike | null;
  analysis: AnalysisLike;
};

const SummaryCard = ({ commits, story, analysis }: SummaryCardProps) => {
  const text = buildAiSummaryParagraph(commits, story, analysis);

  return (
    <div className="relative rounded-2xl p-8 glass-card gradient-border hover-lift overflow-hidden opacity-0 animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">AI Summary</h2>
        </div>
        <p className="text-lg leading-relaxed text-foreground">{text}</p>
      </div>
    </div>
  );
};

export default SummaryCard;
