import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity } from "lucide-react";
import type { CommitLike } from "@/lib/repoNarrative";
import { buildWeeklyCommitActivity } from "@/lib/commitActivitySeries";

type RepoActivityChartProps = {
  commits: CommitLike[];
};

const RepoActivityChart = ({ commits }: RepoActivityChartProps) => {
  const data = useMemo(() => buildWeeklyCommitActivity(commits, 8), [commits]);

  if (!data.length) {
    return (
      <div className="rounded-2xl glass-card border border-border/40 px-4 py-6 flex flex-col justify-center min-h-[160px] opacity-0 animate-fade-up" style={{ animationDelay: "0.12s" }}>
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider">Commit activity</span>
        </div>
        <p className="text-sm text-muted-foreground">Analyze a repository to see commits over time.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass-card border border-border/40 px-3 pt-4 pb-2 min-h-[160px] flex flex-col opacity-0 animate-fade-up" style={{ animationDelay: "0.12s" }}>
      <div className="flex items-center gap-2 mb-1 px-1 text-muted-foreground">
        <Activity className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-wider">Commit activity by week</span>
      </div>
      <p className="text-[11px] text-muted-foreground/80 px-1 mb-2">Default branch sample · last weeks with commits</p>
      <div className="flex-1 w-full min-h-[120px] min-w-0">
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              width={28}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.25)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border border-border bg-popover px-2 py-1.5 text-xs shadow-md">
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="text-muted-foreground">{payload[0].value} commit{(payload[0].value as number) === 1 ? "" : "s"}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" name="Commits" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RepoActivityChart;
