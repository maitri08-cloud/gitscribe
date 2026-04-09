import { Clock, GitCommit, Layers, CheckCircle } from "lucide-react";
import type { RepoAnalysis } from "@/types/repoAnalysis";

type ProductivityInsightsProps = {
  analysis: RepoAnalysis | null;
};

function formatTimeSaved(hours: number): string {
  if (hours < 1) return `~${Math.max(1, Math.round(hours * 60))} min`;
  const rounded = hours >= 10 ? Math.round(hours) : Math.round(hours * 10) / 10;
  return `~${rounded} hour${rounded === 1 ? "" : "s"}`;
}

const ProductivityInsights = ({ analysis }: ProductivityInsightsProps) => {
  const m = analysis?.metrics;
  const metrics = [
    {
      icon: Clock,
      label: "Time Saved",
      value: m ? formatTimeSaved(m.timeSavedHours) : "—",
      desc: m ? "estimated documentation effort" : "fetch a repo to analyze",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: GitCommit,
      label: "Commits Analyzed",
      value: m ? String(m.commitsAnalyzed) : "—",
      desc: m
        ? `across ${m.branchCount}${m.branchLabelSuffix} branch${m.branchCount === 1 ? "" : "es"}`
        : "default branch history",
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Layers,
      label: "Features Identified",
      value: m ? String(m.featuresIdentified) : "—",
      desc: m ? "from feat / feature-style commits" : "heuristic grouping",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: CheckCircle,
      label: "Issues Resolved",
      value: m ? String(m.issuesResolved) : "—",
      desc: m ? "fix / bug-style commits" : "heuristic count",
      color: "text-success",
      bg: "bg-success/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-0 animate-slide-up" style={{ animationDelay: "0.05s" }}>
      {metrics.map((row) => (
        <div key={row.label} className="rounded-2xl p-5 glass-card hover-lift">
          <div className={`p-2 rounded-lg ${row.bg} w-fit mb-3`}>
            <row.icon className={`w-4 h-4 ${row.color}`} />
          </div>
          <div className="text-2xl font-bold text-foreground">{row.value}</div>
          <div className="text-sm font-medium text-foreground mt-1">{row.label}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{row.desc}</div>
        </div>
      ))}
    </div>
  );
};

export default ProductivityInsights;
