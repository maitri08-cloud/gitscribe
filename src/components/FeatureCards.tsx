import { Rocket, Bug, Settings, Brain } from "lucide-react";
import type { StoryLike } from "@/lib/repoNarrative";
import type { RepoAnalysis } from "@/types/repoAnalysis";

type FeatureCardsProps = {
  story: StoryLike | null;
  analysis: RepoAnalysis | null;
};

function confidenceLabel(score: number | undefined): "High" | "Medium" | "Low" {
  if (score == null) return "Medium";
  if (score >= 72) return "High";
  if (score >= 52) return "Medium";
  return "Low";
}

const FeatureCards = ({ story, analysis }: FeatureCardsProps) => {
  const rn = story?.releaseNotes;
  const features = rn?.features?.length ? rn.features : [];
  const fixes = rn?.fixes?.length ? rn.fixes : [];
  const improvements = rn?.improvements?.length ? rn.improvements : [];
  const confFeat = confidenceLabel(analysis?.qualityScore);
  const confFix = confidenceLabel(analysis?.qualityScore);
  const confImp =
    analysis?.qualityScore != null && analysis.qualityScore < 60 ? "Medium" : confidenceLabel(analysis?.qualityScore);

  const cards = [
    {
      icon: Rocket,
      title: "Features",
      color: "text-primary",
      bg: "bg-primary/10",
      confidence: features.length ? confFeat : "Low",
      items: features.length ? features : ["No feat/feature-style commits in this sample."],
    },
    {
      icon: Bug,
      title: "Bug Fixes",
      color: "text-destructive",
      bg: "bg-destructive/10",
      confidence: fixes.length ? confFix : "Low",
      items: fixes.length ? fixes : ["No fix/bug-style commits in this sample."],
    },
    {
      icon: Settings,
      title: "Improvements",
      color: "text-accent",
      bg: "bg-accent/10",
      confidence: improvements.length ? confImp : "Low",
      items: improvements.length ? improvements : ["No refactor/chore-style highlights in this sample."],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map((card, i) => (
        <div
          key={card.title}
          className="rounded-2xl p-6 glass-card hover-lift opacity-0 animate-slide-up"
          style={{ animationDelay: `${0.2 + i * 0.1}s` }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <h3 className="font-semibold text-foreground">{card.title}</h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                card.confidence === "High"
                  ? "bg-success/10 text-success"
                  : card.confidence === "Medium"
                    ? "bg-accent/10 text-accent"
                    : "bg-secondary/80 text-muted-foreground"
              }`}
            >
              <Brain className="w-2.5 h-2.5" />
              Heuristic confidence: {card.confidence}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary/80 text-muted-foreground">
              From commit subjects
            </span>
          </div>

          <ul className="space-y-3">
            {card.items.map((item, j) => (
              <li key={`${card.title}-${j}`} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${card.bg}`} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default FeatureCards;
