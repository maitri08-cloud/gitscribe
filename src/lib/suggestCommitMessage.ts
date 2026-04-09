import { firstLine } from "@/lib/repoNarrative";

/** Heuristic improved one-line subject (does not call external AI). */
export function suggestCommitRewrite(fullMessage: string): string {
  const line = firstLine(fullMessage).trim();
  const lower = line.toLowerCase();

  if (lower === "fix" || lower === "fix.") return "fix: describe the bug or regression you resolved";
  if (lower === "update" || lower === "updates") return "chore: specify module, dependency, or UI area you updated";
  if (lower === "wip" || lower === "wip.") return "chore: WIP — summarize the feature or fix in progress";
  if (/^misc/i.test(lower)) return "chore: replace generic subject with a concrete summary of changes";
  if (/^test$/i.test(lower)) return "test: describe scenario or component covered";
  if (/^debug$/i.test(lower)) return "chore: describe debugging or instrumentation change";
  if (line.length <= 6) return `${line}: add scope and outcome (e.g. feat(api): add user lookup)`;
  if (line.length < 20)
    return `${line} — expand with area affected or ticket (e.g. fix(auth): handle expired session)`;

  if (!/^(feat|fix|docs|chore|refactor|perf|test|build|style)(\([^)]*\))?!?:/i.test(line)) {
    const cleaned = line.replace(/^(feat|fix|chore|docs)\s+/i, "");
    return `chore: ${cleaned}`;
  }

  return `${line} — add reviewer context (why/what changed)`;
}
