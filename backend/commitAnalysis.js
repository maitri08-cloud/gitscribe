/**
 * Derive dashboard metrics, quality score, noise breakdown, and timeline
 * from raw commit payloads (same shape as app.js maps from GitHub).
 */

const MERGE = /^merge /i;
const CONFIG =
  /^(chore|bump|ci(\(|:)|build\(|eslint|prettier|renovate|dependabot|style:|lint|format|release v|\[bot\])/i;

function firstLine(message) {
  return (message || "").split("\n")[0].trim();
}

function classifyNoise(message) {
  const line = firstLine(message);
  const lower = line.toLowerCase();
  if (MERGE.test(lower)) return "merge";
  if (CONFIG.test(lower) || /^bump\s/i.test(lower)) return "config";
  if (line.length < 12) return "lowSignal";
  if (/^(wip|asdf|test\.?|tmp|debug|xxx|\.?)\s*$/i.test(line)) return "lowSignal";
  return "none";
}

function categoriseCommitStyle(message) {
  const msg = firstLine(message).toLowerCase();
  if (/^(feat|feature|add|new)/.test(msg)) return "feature";
  if (/^(fix|bug|hotfix|patch)/.test(msg)) return "bugfix";
  if (/^(refactor|perf|chore|clean)/.test(msg)) return "refactor";
  return "others";
}

function computeQualityScore(commits) {
  if (!commits.length) return 0;

  let score = 52;
  let totalLen = 0;
  let conventional = 0;
  let mergeN = 0;

  for (const c of commits) {
    const fl = firstLine(c.message);
    totalLen += fl.length;
    const noise = classifyNoise(c.message);
    if (noise === "merge") mergeN++;
    const ft = fl.toLowerCase();
    if (/^(feat|fix|docs|refactor|perf|chore|test|build|style)(\([^)]*\))?!?:/.test(ft)) {
      conventional++;
    }
  }

  const n = commits.length;
  const avgLen = totalLen / n;
  const mergeRatio = mergeN / n;
  const convRatio = conventional / n;

  if (avgLen > 38) score += 14;
  else if (avgLen > 24) score += 8;
  else if (avgLen > 16) score += 4;
  if (avgLen < 14) score -= 10;

  if (convRatio > 0.45) score += 16;
  else if (convRatio > 0.25) score += 10;
  else if (convRatio > 0.12) score += 5;

  if (mergeRatio > 0.55) score -= 14;
  else if (mergeRatio > 0.38) score -= 8;

  return Math.round(Math.min(96, Math.max(36, score)));
}

function formatPeriod(start, end) {
  const opts = { month: "short", day: "numeric", year: "numeric" };
  const s = start.toLocaleDateString("en-US", opts);
  const e = end.toLocaleDateString("en-US", opts);
  if (s === e) return s;
  return `${s} – ${e}`;
}

function cleanSnippet(message) {
  return firstLine(message)
    .replace(/^(feat|fix|chore|docs|refactor|perf)(\([^)]*\))?!?:\s*/i, "")
    .replace(/#/g, "")
    .trim()
    .slice(0, 72);
}

function dominantPhase(commitsInBucket) {
  let feat = 0;
  let fix = 0;
  let ref = 0;
  for (const c of commitsInBucket) {
    const t = categoriseCommitStyle(c.message);
    if (t === "feature") feat++;
    else if (t === "bugfix") fix++;
    else if (t === "refactor") ref++;
  }
  const max = Math.max(feat, fix, ref, 1);
  if (feat === max && feat > 0) return "Feature development";
  if (fix === max && fix > 0) return "Stability & fixes";
  if (ref === max && ref > 0) return "Refactoring & maintenance";
  return "Active development";
}

function buildTimeline(commits) {
  const dated = commits
    .filter((c) => c.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (!dated.length) {
    return [
      {
        time: "Recent",
        phase: "Repository activity",
        description:
          commits.length > 0
            ? `${commits.length} commits analyzed; commit dates were not available for timeline grouping.`
            : "No commits available to build a timeline.",
      },
    ];
  }

  const start = new Date(dated[0].date);
  const end = new Date(dated[dated.length - 1].date);
  const spanMs = Math.max(1, end.getTime() - start.getTime());
  const spanDays = spanMs / 86400000;

  let numBuckets = Math.min(6, Math.max(2, Math.ceil(spanDays / 21)));
  if (spanDays < 10) numBuckets = Math.min(3, Math.max(2, dated.length > 5 ? 2 : 1));
  if (numBuckets < 1) numBuckets = 1;

  const buckets = Array.from({ length: numBuckets }, () => /** @type {typeof commits} */ ([]));

  for (const c of dated) {
    const t = new Date(c.date).getTime();
    const frac = (t - start.getTime()) / spanMs;
    const idx = Math.min(numBuckets - 1, Math.floor(frac * numBuckets));
    buckets[idx].push(c);
  }

  const events = [];
  for (const bucket of buckets) {
    if (!bucket.length) continue;
    const bStart = new Date(bucket[0].date);
    const bEnd = new Date(bucket[bucket.length - 1].date);
    const phase = dominantPhase(bucket);
    const snippets = bucket
      .slice(0, 3)
      .map((c) => cleanSnippet(c.message))
      .filter(Boolean);
    const desc =
      snippets.length > 0
        ? `${bucket.length} commits — highlights: ${snippets.join("; ")}.`
        : `${bucket.length} commits in this period.`;

    events.push({
      time: formatPeriod(bStart, bEnd),
      phase,
      description: desc.length > 280 ? `${desc.slice(0, 277)}...` : desc,
    });
  }

  if (!events.length) {
    return [
      {
        time: "—",
        phase: "Activity",
        description: "Could not group commits into timeline phases.",
      },
    ];
  }

  return events;
}

/**
 * @param {Array<{ message: string, date?: string | null }>} commits
 * @param {{ count: number, truncated?: boolean }} branchInfo
 */
function analyzeCommits(commits, branchInfo = { count: 1 }) {
  const lowSignalCount = commits.filter((c) => classifyNoise(c.message) === "lowSignal").length;
  const mergeDuplicateCount = commits.filter((c) => classifyNoise(c.message) === "merge").length;
  const irrelevantCount = commits.filter((c) => classifyNoise(c.message) === "config").length;

  let featuresIdentified = 0;
  let issuesResolved = 0;
  for (const c of commits) {
    const t = categoriseCommitStyle(c.message);
    if (t === "feature") featuresIdentified++;
    if (t === "bugfix") issuesResolved++;
  }

  const n = commits.length;
  const docMinutesPerCommit = 3.5;
  const timeSavedHours = Math.max(0.25, Math.round(((n * docMinutesPerCommit) / 60) * 10) / 10);

  const branchCount = Math.max(1, branchInfo.count || 1);
  const branchLabelSuffix = branchInfo.truncated ? "+" : "";

  return {
    metrics: {
      commitsAnalyzed: n,
      branchCount,
      branchLabelSuffix,
      featuresIdentified,
      issuesResolved,
      timeSavedHours,
    },
    qualityScore: computeQualityScore(commits),
    noise: {
      lowSignalCount,
      mergeDuplicateCount,
      irrelevantCount,
    },
    timeline: buildTimeline(commits),
  };
}

module.exports = { analyzeCommits, classifyNoise, categoriseCommitStyle };
