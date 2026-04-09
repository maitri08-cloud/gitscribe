import { AlertTriangle, Lightbulb, TrendingUp, Info } from "lucide-react";
import type { CommitLike, StoryLike, AnalysisLike } from "@/lib/repoNarrative";
import { buildSmartInsights } from "@/lib/repoNarrative";

type SmartInsightsProps = {
  commits: CommitLike[];
  story: StoryLike | null;
  analysis: AnalysisLike;
};

const iconMap = {
  Warning: AlertTriangle,
  Suggestion: Lightbulb,
  Positive: TrendingUp,
  Info: Info,
};

const colorMap = {
  Warning: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
  Suggestion: { color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
  Positive: { color: "text-success", bg: "bg-success/10", border: "border-success/20" },
  Info: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
};

const SmartInsights = ({ commits, story, analysis }: SmartInsightsProps) => {
  const insights = buildSmartInsights(commits, story, analysis);

  return (
    <div className="space-y-3 opacity-0 animate-slide-up" style={{ animationDelay: "0.15s" }}>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        🧠 Smart Insights
      </h3>
      {insights.map((insight) => {
        const Icon = iconMap[insight.type];
        const styles = colorMap[insight.type];
        return (
          <div
            key={insight.title}
            className={`rounded-xl p-4 glass-card border ${styles.border} flex items-start gap-3`}
          >
            <div className={`p-1.5 rounded-lg ${styles.bg} mt-0.5`}>
              <Icon className={`w-4 h-4 ${styles.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold uppercase ${styles.color}`}>{insight.type}</span>
              </div>
              <p className="text-sm font-medium text-foreground">{insight.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SmartInsights;
