import type { CommitLike } from "@/lib/repoNarrative";

export type ActivityPoint = { label: string; count: number };

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Last N weeks of commit counts for charts (chronological). */
export function buildWeeklyCommitActivity(commits: CommitLike[], maxWeeks = 8): ActivityPoint[] {
  const dated = commits.filter((c) => c.date);
  if (!dated.length) {
    if (!commits.length) return [];
    return [{ label: "Sample", count: commits.length }];
  }

  const byWeek = new Map<number, number>();
  for (const c of dated) {
    const t = startOfWeek(new Date(c.date as string)).getTime();
    byWeek.set(t, (byWeek.get(t) || 0) + 1);
  }

  const sorted = [...byWeek.entries()].sort((a, b) => a[0] - b[0]);
  const slice = sorted.slice(-maxWeeks);
  return slice.map(([ts, count]) => ({
    label: new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count,
  }));
}
