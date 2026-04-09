import { useEffect, useState } from "react";

type CommitQualityScoreProps = {
  score: number | null;
};

const CommitQualityScore = ({ score }: CommitQualityScoreProps) => {
  const [progress, setProgress] = useState(0);
  const target = score ?? 0;
  const circumference = 2 * Math.PI * 54;

  useEffect(() => {
    setProgress(0);
    if (score === null) return;
    const timer = setTimeout(() => setProgress(target), 300);
    return () => clearTimeout(timer);
  }, [score, target]);

  const offset = circumference - (progress / 100) * circumference;
  const showPlaceholder = score === null;

  return (
    <div className="rounded-2xl glass-card p-8 flex flex-col items-center justify-center opacity-0 animate-scale-up" style={{ animationDelay: "0.3s" }}>
      <div className="relative w-36 h-36 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-foreground">
            {showPlaceholder ? "—" : `${progress}%`}
          </span>
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground text-center">Commit Quality Score</p>
      <p className="text-xs text-muted-foreground/80 text-center mt-1 max-w-[12rem]">
        From message length, conventional commits, and merge ratio
      </p>
    </div>
  );
};

export default CommitQualityScore;
