/**
 * Derive dashboard copy from fetched commits + story payload (no demo placeholders).
 */

export type CommitLike = {
  hash: string;
  message: string;
  date: string | null;
  url?: string | null;
  sha?: string;
};

export type StoryReleaseNotes = {
  features: string[];
  fixes: string[];
  improvements: string[];
};

export type StoryLike = {
  story: string;
  summary: string;
  impact: string;
  projectType: string;
  releaseNotes: StoryReleaseNotes;
};

export type AnalysisLike = {
  qualityScore: number;
  metrics: { commitsAnalyzed: number; branchCount: number };
} | null;

export function firstLine(message: string): string {
  return (message || "").split("\n")[0].replace(/Co-authored-by:.*/gi, "").trim();
}

export function commitSpanDescription(commits: CommitLike[]): string {
  const ts = commits
    .map((c) => c.date)
    .filter(Boolean)
    .map((d) => new Date(d as string).getTime());
  if (!ts.length) return "the analyzed commit window";
  const min = Math.min(...ts);
  const max = Math.max(...ts);
  const days = Math.max(1, (max - min) / 86400000);
  if (days <= 1) return "about a day";
  if (days < 14) return `${Math.max(1, Math.round(days))} days`;
  if (days < 60) return `${Math.round(days / 7)} weeks`;
  if (days < 400) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} year(s)`;
}

export function buildAiSummaryParagraph(
  commits: CommitLike[],
  story: StoryLike | null,
  analysis: AnalysisLike
): string {
  const n = commits.length;
  if (!n) {
    return "No commits were returned for this repository. Try a public repo or check API access and rate limits.";
  }
  const span = commitSpanDescription(commits);
  const quality = analysis?.qualityScore;
  const qualityPhrase =
    quality == null
      ? "Review commit messages for clarity and consistency."
      : quality >= 75
        ? "Commit messages look relatively clear and consistent overall."
        : quality >= 55
          ? "Commit messages are mixed in length and structure; conventional commits would help."
          : "Many commits are short or vague; adopting Conventional Commits would improve traceability.";

  const themes: string[] = [];
  const rn = story?.releaseNotes;
  if (rn) {
    if (rn.features[0]) themes.push(rn.features[0]);
    if (rn.fixes[0]) themes.push(rn.fixes[0]);
    if (rn.improvements[0]) themes.push(rn.improvements[0]);
  }
  const themePhrase =
    themes.length > 0
      ? `Recent subjects include work such as: ${themes.slice(0, 3).join("; ")}.`
      : story?.summary
        ? story.summary
        : "Themes are inferred from commit message prefixes (feat, fix, refactor, etc.).";

  return `This repository has ${n} commit${n === 1 ? "" : "s"} in ${span} (default branch sample from GitHub). ${themePhrase} ${qualityPhrase} ${story?.impact ? `Impact narrative: ${story.impact}` : ""}`.trim();
}

export function isVagueMessage(message: string): boolean {
  const line = firstLine(message);
  const len = line.length;
  const lower = line.toLowerCase();
  if (!line) return true;
  if (len <= 12) return true;
  if (/^(fix|wip|update|misc|temp|tmp|test|asdf|debug|changes?|stuff|ok|done)\.?$/i.test(lower)) return true;
  if (/^(fix|update|wip|misc|tmp)\s*$/i.test(lower)) return true;
  return false;
}

export function vagueCommits(commits: CommitLike[]): CommitLike[] {
  return commits.filter((c) => isVagueMessage(c.message)).slice(0, 10);
}

export type WarningCommit = {
  hash: string;
  /** Short label for the collapsed row */
  message: string;
  /** Full first-line subject for editing */
  subjectFull: string;
  severity: "high" | "medium";
  sha?: string;
  url?: string | null;
};

export function commitsForWarnings(commits: CommitLike[]): WarningCommit[] {
  const out: WarningCommit[] = [];
  for (const c of commits) {
    const line = firstLine(c.message);
    if (!isVagueMessage(c.message) && line.length >= 25) continue;
    const severity: "high" | "medium" =
      line.length <= 10 || /^(fix|update|wip|\.+|asdf)\s*$/i.test(line) ? "high" : "medium";
    out.push({
      hash: c.hash,
      message: line.length > 72 ? `${line.slice(0, 69)}...` : line,
      subjectFull: line,
      severity,
      sha: c.sha,
      url: c.url ?? null,
    });
    if (out.length >= 8) break;
  }
  return out;
}

export type InsightItem = {
  type: "Warning" | "Suggestion" | "Positive" | "Info";
  title: string;
  desc: string;
};

export function buildSmartInsights(
  commits: CommitLike[],
  story: StoryLike | null,
  analysis: AnalysisLike
): InsightItem[] {
  const items: InsightItem[] = [];
  const vague = commits.filter((c) => isVagueMessage(c.message));
  if (vague.length >= 2) {
    items.push({
      type: "Warning",
      title: "Inconsistent or vague commit messages",
      desc: `${vague.length} commit${vague.length === 1 ? "" : "s"} look very short or generic (e.g. "fix", "wip", "update"). Conventional Commits (feat:, fix:, etc.) improve history and automation.`,
    });
  }

  const feat = commits.filter((c) => /^(feat|feature|add|new)\b/i.test(firstLine(c.message)));
  const withDates = feat.filter((c) => c.date);
  if (withDates.length >= 4) {
    const times = withDates.map((c) => new Date(c.date as string).getTime());
    const spreadDays = (Math.max(...times) - Math.min(...times)) / 86400000;
    if (spreadDays >= 21) {
      items.push({
        type: "Suggestion",
        title: "Feature work is spread across time",
        desc: `Feature-style commits span roughly ${Math.round(spreadDays)} days. Grouping related changes (or using stacked PRs) can make review and release notes easier.`,
      });
    }
  }

  const q = analysis?.qualityScore;
  if (q != null && q >= 72) {
    items.push({
      type: "Positive",
      title: "Solid commit message signals",
      desc: `Estimated quality score is ${q}%, based on length, conventional prefixes, and merge-commit ratio on the fetched history.`,
    });
  } else if (q != null && q < 55) {
    items.push({
      type: "Suggestion",
      title: "Room to improve commit hygiene",
      desc: `Score is ${q}%. Longer subjects, scopes, and prefixes (feat/fix/docs) would strengthen auditability.`,
    });
  }

  if (story?.story && items.length < 3) {
    items.push({
      type: "Info",
      title: "Activity overview",
      desc: story.story,
    });
  }

  if (!items.length) {
    items.push({
      type: "Info",
      title: "Repository snapshot",
      desc: `${commits.length} commits analyzed. Keep using descriptive messages to get richer insights over time.`,
    });
  }

  return items.slice(0, 5);
}

export function explainCommit(commit: CommitLike): { explanation: string; impact: string } {
  const subj = firstLine(commit.message);
  const lower = subj.toLowerCase();
  let explanation = `Commit subject: "${subj}". Interpretation is based on the message only; open the commit on GitHub for the full diff.`;
  if (/^(feat|feature|add|new)\b/i.test(lower)) {
    explanation = `Feature-style change: ${subj}. Typically adds or extends user-facing or API behavior.`;
  } else if (/^(fix|bug|hotfix|patch)\b/i.test(lower)) {
    explanation = `Fix-style change: ${subj}. Likely addresses a bug, regression, or incorrect behavior.`;
  } else if (/^(refactor|perf)\b/i.test(lower)) {
    explanation = `Refactor/performance work: ${subj}. Often improves structure or speed without changing external behavior.`;
  } else if (/^(chore|ci|build|deps)\b/i.test(lower)) {
    explanation = `Tooling or maintenance: ${subj}. Often covers CI, dependencies, or build configuration.`;
  } else if (/^docs?\b/i.test(lower)) {
    explanation = `Documentation update: ${subj}.`;
  } else if (/^merge\b/i.test(lower)) {
    explanation = `Merge commit integrating another branch or pull request.`;
  }
  const impact =
    "Useful for release notes, code review context, and correlating changes with issues or deployments when linked in the message.";
  return { explanation, impact };
}

export function pickExplainerCommits(commits: CommitLike[], limit = 4): CommitLike[] {
  const dated = [...commits].filter((c) => c.date).sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
  const pool = dated.length ? dated : [...commits];
  const scored = pool.map((c) => {
    const line = firstLine(c.message);
    let score = line.length;
    if (/^(feat|fix|refactor|perf|docs)\b/i.test(line)) score += 30;
    if (/^merge\b/i.test(line)) score -= 20;
    return { c, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.c);
}

export function buildChangelogMarkdown(repoLabel: string, story: StoryLike | null): string {
  const date = new Date().toISOString().slice(0, 10);
  const rn = story?.releaseNotes;
  const feat = rn?.features?.length ? rn.features : ["_No feat-style commits detected in sample._"];
  const fix = rn?.fixes?.length ? rn.fixes : ["_No fix-style commits detected in sample._"];
  const imp = rn?.improvements?.length ? rn.improvements : ["_No refactor/other bucket highlights in sample._"];

  const lines = [
    `## Unreleased — ${repoLabel} (${date})`,
    ``,
    `_Generated from commit message categories in the fetched GitHub history._`,
    ``,
    `### 🚀 Features`,
    ...feat.map((t) => `- ${t}`),
    ``,
    `### 🐛 Bug Fixes`,
    ...fix.map((t) => `- ${t}`),
    ``,
    `### ⚡ Improvements`,
    ...imp.map((t) => `- ${t}`),
    ``,
  ];
  return lines.join("\n");
}

export function buildPortfolioBullets(story: StoryLike | null, commits: CommitLike[]): string[] {
  const bullets: string[] = [];
  if (story?.releaseNotes) {
    const { features, fixes, improvements } = story.releaseNotes;
    const add = (arr: string[], prefix: string) => {
      for (const raw of arr) {
        const t = raw.trim();
        if (!t) continue;
        const cap = t.charAt(0).toUpperCase() + t.slice(1);
        bullets.push(`${prefix}: ${cap}`);
      }
    };
    add(features, "Shipped feature work");
    add(fixes, "Resolved issues");
    add(improvements, "Improved codebase");
  }
  const n = commits.length;
  if (story?.impact && bullets.length < 6) bullets.push(`Project impact (from history): ${story.impact}`);
  if (bullets.length < 4 && n > 0) {
    bullets.push(`Contributed across ${n} analyzed commit${n === 1 ? "" : "s"} on the default branch sample.`);
  }
  const seen = new Set<string>();
  return bullets.filter((b) => (seen.has(b) ? false : (seen.add(b), true))).slice(0, 10);
}

export function buildStandup(
  commits: CommitLike[],
  story: StoryLike | null
): { yesterday: string[]; today: string[]; blockers: string[] } {
  const sorted = [...commits]
    .filter((c) => c.date)
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
  const recent = sorted.slice(0, 5);
  const yesterday = recent.map((c) => firstLine(c.message).slice(0, 160)).filter(Boolean);
  const today: string[] = [];
  if (story?.releaseNotes) {
    const f = story.releaseNotes.features[0];
    const x = story.releaseNotes.fixes[0];
    if (f) today.push(`Follow up on feature thread: ${f.slice(0, 100)}`);
    if (x) today.push(`Verify fixes around: ${x.slice(0, 100)}`);
  }
  if (today.length < 2) {
    today.push("Review open PRs and align on next milestone.");
    today.push("Add tests or docs for recent changes as needed.");
  }
  return {
    yesterday: yesterday.length ? yesterday : ["_(No dated commits in sample — paste a repo with history.)_"],
    today: today.slice(0, 4),
    blockers: ["_None detected from git history — add your real blockers manually._"],
  };
}

export type StructuredLine = { type: "Feature" | "Fix" | "Improvement"; text: string };

export function structuredFromStory(story: StoryLike | null): StructuredLine[] {
  if (!story?.releaseNotes) return [];
  const out: StructuredLine[] = [];
  for (const t of story.releaseNotes.features) {
    if (t.trim()) out.push({ type: "Feature", text: t.trim() });
  }
  for (const t of story.releaseNotes.fixes) {
    if (t.trim()) out.push({ type: "Fix", text: t.trim() });
  }
  for (const t of story.releaseNotes.improvements) {
    if (t.trim()) out.push({ type: "Improvement", text: t.trim() });
  }
  return out.slice(0, 16);
}

export function rawMessagesForCompare(commits: CommitLike[]): string[] {
  const vague = vagueCommits(commits);
  const lines = vague.length >= 4 ? vague : commits;
  return lines
    .slice(0, 8)
    .map((c) => firstLine(c.message))
    .filter(Boolean);
}
