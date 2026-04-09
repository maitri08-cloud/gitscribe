export type RepoAnalysis = {
  metrics: {
    commitsAnalyzed: number;
    branchCount: number;
    branchLabelSuffix: string;
    featuresIdentified: number;
    issuesResolved: number;
    timeSavedHours: number;
  };
  qualityScore: number;
  noise: {
    lowSignalCount: number;
    mergeDuplicateCount: number;
    irrelevantCount: number;
  };
  timeline: Array<{ time: string; phase: string; description: string }>;
};
