import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import HeroSection from "@/components/HeroSection";
import LoadingTransition from "@/components/LoadingTransition";
import DashboardTopBar from "@/components/DashboardTopBar";
import SummaryCard from "@/components/SummaryCard";
import FeatureCards from "@/components/FeatureCards";
import StoryTimeline from "@/components/StoryTimeline";
import ReleaseNotes from "@/components/ReleaseNotes";
import PortfolioView from "@/components/PortfolioView";
import CommitQualityScore from "@/components/CommitQualityScore";
import ViewSwitcher from "@/components/ViewSwitcher";
import ProductivityInsights from "@/components/ProductivityInsights";
import SmartInsights from "@/components/SmartInsights";
import NoiseIndicator from "@/components/NoiseIndicator";
import WorkflowActions from "@/components/WorkflowActions";
import RepoActivityChart from "@/components/RepoActivityChart";
import BeforeAfterView from "@/components/BeforeAfterView";
import CommitExplainer from "@/components/CommitExplainer";
import StandupGenerator from "@/components/StandupGenerator";
import SmartCommitWarnings from "@/components/SmartCommitWarnings";
import type { RepoAnalysis } from "@/types/repoAnalysis";
import { analyzeCommitsClientSide } from "@/lib/commitAnalysis";
import { buildAiSummaryParagraph, buildPortfolioBullets } from "@/lib/repoNarrative";
import type { CommitStoryPdfInput } from "@/lib/generatePdf";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppState = "hero" | "loading" | "dashboard";

type Commit = {
  sha: string;
  hash: string;
  author: string;
  date: string | null;
  message: string;
  url: string | null;
};

type StoryData = {
  story: string;
  summary: string;
  impact: string;
  projectType: string;
  releaseNotes: {
    features: string[];
    fixes: string[];
    improvements: string[];
  };
};

// ─── URL helpers ─────────────────────────────────────────────────────────────

function parseGitHubRepoInput(input: string): { owner: string; repo: string } {
  const trimmed = input.trim();

  // Accept "owner/repo"
  const ownerRepo = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (ownerRepo) return { owner: ownerRepo[1], repo: ownerRepo[2] };

  // Accept GitHub URL variants
  const match = trimmed.match(/^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/#?]+)/);
  if (match) return { owner: match[1], repo: match[2].replace(/\.git$/, "") };

  throw new Error("Invalid GitHub repo. Use https://github.com/owner/repo or owner/repo");
}

// ─── Component ────────────────────────────────────────────────────────────────

const Index = () => {
  const [state, setState] = useState<AppState>("hero");
  const [repoUrl, setRepoUrl] = useState("");
  const [activeView, setActiveView] = useState("Summary");
  const [isDark, setIsDark] = useState(false);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  /** Short-hash → improved subject; session-only, does not rewrite Git. */
  const [commitCorrections, setCommitCorrections] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  // Track whether the fetch finished so we can go to dashboard after loading animation
  const dataReadyRef = useRef(false);

  // Dark mode setup
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
    if (prefersDark) document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  // ── Fetch commits from backend ──────────────────────────────────────────
  // The Vite dev-server proxy forwards /api/* → http://localhost:5000
  const handleGenerate = async (url: string) => {
    try {
      setError("");
      setRepoUrl(url);
      dataReadyRef.current = false;
      setState("loading");

      const { owner, repo } = parseGitHubRepoInput(url);

      const response = await fetch(
        `/api/commits?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || `HTTP ${response.status}: Failed to fetch commits`);
      }

      const data = await response.json();

      const nextCommits = Array.isArray(data?.commits) ? data.commits : [];
      setCommits(nextCommits);
      setStoryData(data?.story ?? null);
      // Prefer server `analysis` (includes real branch count). If missing — e.g. old
      // backend still running — derive the same metrics from commits in the browser.
      setAnalysis(
        data?.analysis ?? (nextCommits.length > 0 ? analyzeCommitsClientSide(nextCommits) : null)
      );

      // Signal that data is ready – the LoadingTransition's onComplete will
      // fire after its animation, and we check this flag there.
      dataReadyRef.current = true;
    } catch (err) {
      console.error("[GitScribe] Error fetching commits:", err);
      setError(err instanceof Error ? err.message : "Failed to load commits. Please try again.");
      setState("hero");
    }
  };

  // Called when the loading animation finishes
  const handleLoadingComplete = useCallback(() => {
    // Only move to dashboard if the fetch actually succeeded
    if (dataReadyRef.current) {
      setState("dashboard");
    }
  }, []);

  const handleBack = () => {
    setState("hero");
    setActiveView("Summary");
    setCommits([]);
    setStoryData(null);
    setAnalysis(null);
    setCommitCorrections({});
    setError("");
    dataReadyRef.current = false;
  };

  const repoName = repoUrl.split("/").filter(Boolean).slice(-2).join("/") || "user/repo";

  const pdfInput = useMemo<CommitStoryPdfInput | null>(() => {
    if (!commits.length && !storyData) return null;
    const rn = storyData?.releaseNotes;
    return {
      repoName,
      summaryParagraph: buildAiSummaryParagraph(commits, storyData, analysis),
      features: rn?.features ?? [],
      fixes: rn?.fixes ?? [],
      improvements: rn?.improvements ?? [],
      portfolioBullets: buildPortfolioBullets(storyData, commits),
    };
  }, [repoName, commits, storyData, analysis]);

  // ── HERO ─────────────────────────────────────────────────────────────────
  if (state === "hero") {
    return (
      <>
        <HeroSection onGenerate={handleGenerate} />
        {error && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-destructive text-destructive-foreground px-6 py-3 rounded-lg shadow-lg text-sm max-w-md text-center">
            {error}
          </div>
        )}
      </>
    );
  }

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (state === "loading") {
    return <LoadingTransition onComplete={handleLoadingComplete} />;
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <DashboardTopBar
        repoName={repoName}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onBack={handleBack}
        pdfInput={pdfInput}
      />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Story banner (from storyGenerator) */}
        {storyData && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-2">
            <p className="text-sm font-medium text-primary">{storyData.projectType}</p>
            <p className="text-base text-foreground">{storyData.story}</p>
            <p className="text-sm text-muted-foreground">{storyData.summary}</p>
          </div>
        )}

        {/* Productivity Insights */}
        <ProductivityInsights analysis={analysis} />

        {/* View Switcher + activity chart (fills gap) + Quality Score */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
          <div className="shrink-0">
            <ViewSwitcher activeView={activeView} onViewChange={setActiveView} />
          </div>
          <div className="flex-1 min-w-0">
            <RepoActivityChart commits={commits} />
          </div>
          <div className="shrink-0 lg:w-48">
            <CommitQualityScore score={analysis?.qualityScore ?? null} />
          </div>
        </div>

        {/* Noise Indicator */}
        <NoiseIndicator noise={analysis?.noise ?? null} />

        {/* Workflow Actions */}
        <WorkflowActions repoLabel={repoName} commits={commits} story={storyData} />

        {/* Commits list */}
        <div className="bg-card p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              Recent Commits
              {commits.length > 0 && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  ({commits.length} fetched)
                </span>
              )}
            </h3>
            {repoUrl && (
              <a
                href={
                  repoUrl.startsWith("http")
                    ? repoUrl
                    : `https://github.com/${repoUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                View on GitHub ↗
              </a>
            )}
          </div>

          {commits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No commits available</p>
          ) : (
            commits.slice(0, 10).map((commit, i) => {
              const clean = (commit.message || "")
                .split("\n")[0]
                .replace(/#/g, "")
                .replace(/Co-authored-by:.*/g, "")
                .trim();

              return (
                <div
                  key={commit.sha || i}
                  className="p-3 border rounded-lg mb-2 bg-muted/30 hover:bg-muted/50 transition"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    {commit.url ? (
                      <a
                        href={commit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-foreground hover:text-primary hover:underline truncate"
                      >
                        {clean}
                      </a>
                    ) : (
                      <p className="text-sm text-foreground truncate">{clean}</p>
                    )}
                    <span className="text-xs text-muted-foreground font-mono shrink-0">
                      {commit.hash}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {commit.author}
                    {commit.date
                      ? ` • ${new Date(commit.date).toLocaleString()}`
                      : ""}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Main Content */}
        <div key={activeView} className="space-y-8">
          {activeView === "Summary" && (
            <>
              <SummaryCard commits={commits} story={storyData} analysis={analysis} />
              <BeforeAfterView commits={commits} story={storyData} />
              <FeatureCards story={storyData} analysis={analysis} />
              <CommitExplainer commits={commits} />
              <SmartCommitWarnings
                commits={commits}
                corrections={commitCorrections}
                onCorrectionSave={(hash, text) =>
                  setCommitCorrections((prev) => ({ ...prev, [hash]: text }))
                }
                onCorrectionClear={(hash) =>
                  setCommitCorrections((prev) => {
                    const next = { ...prev };
                    delete next[hash];
                    return next;
                  })
                }
              />
              <SmartInsights commits={commits} story={storyData} analysis={analysis} />
              <StandupGenerator commits={commits} story={storyData} />
            </>
          )}

          {activeView === "Story Mode" && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-8">
                Development Timeline
              </h2>
              <StoryTimeline key={repoUrl} events={analysis?.timeline ?? null} />
            </div>
          )}

          {activeView === "Release Notes" && <ReleaseNotes repoLabel={repoName} story={storyData} />}
          {activeView === "Portfolio View" && <PortfolioView story={storyData} commits={commits} />}
        </div>
      </main>
    </div>
  );
};

export default Index;
