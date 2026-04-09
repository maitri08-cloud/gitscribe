import { Filter, Copy, EyeOff } from "lucide-react";
import type { RepoAnalysis } from "@/types/repoAnalysis";

type NoiseIndicatorProps = {
  noise: RepoAnalysis["noise"] | null;
};

const NoiseIndicator = ({ noise }: NoiseIndicatorProps) => {
  const filters = noise
    ? [
        {
          icon: Filter,
          label: "Low-signal commits",
          detail: `${noise.lowSignalCount} very short or placeholder-style messages`,
        },
        {
          icon: Copy,
          label: "Merge commits",
          detail: `${noise.mergeDuplicateCount} merge / integration commits`,
        },
        {
          icon: EyeOff,
          label: "Chore / tooling commits",
          detail: `${noise.irrelevantCount} chore, CI, or dependency-style messages`,
        },
      ]
    : [
        { icon: Filter, label: "Noise signals", detail: "Analyze a repository to see breakdown" },
        { icon: Copy, label: "Merge commits", detail: "—" },
        { icon: EyeOff, label: "Chore / tooling", detail: "—" },
      ];

  return (
    <div className="flex flex-wrap gap-3 opacity-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
      {filters.map((f) => (
        <div
          key={f.label}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 text-xs text-muted-foreground"
        >
          <f.icon className="w-3 h-3" />
          <span className="font-medium text-foreground">{f.label}</span>
          <span className="text-muted-foreground">· {f.detail}</span>
        </div>
      ))}
    </div>
  );
};

export default NoiseIndicator;
