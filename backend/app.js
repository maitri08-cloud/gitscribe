const express = require("express");
const cors = require("cors");
const axios = require("axios");
const generateStoryAI = require("./storyGenerator");
const { analyzeCommits } = require("./commitAnalysis");

// Load .env from backend folder
try {
  require("dotenv").config();
} catch {
  // dotenv is optional
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseRepoInput({ owner, repo, url }) {
  if (owner && repo) return { owner, repo };
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();

  // "owner/repo" shorthand
  const ownerRepoMatch = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (ownerRepoMatch) return { owner: ownerRepoMatch[1], repo: ownerRepoMatch[2] };

  // Full GitHub URL
  const githubUrlMatch = trimmed.match(
    /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/#?]+)/
  );
  if (!githubUrlMatch) return null;

  return {
    owner: githubUrlMatch[1],
    repo: githubUrlMatch[2].replace(/\.git$/, ""),
  };
}

function buildGitHubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "GitScribe",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

const MAX_COMMIT_PAGES = 5;

async function fetchCommitPages(owner, repo, headers) {
  const all = [];
  for (let page = 1; page <= MAX_COMMIT_PAGES; page++) {
    const { data } = await axios.get(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits`,
      {
        headers,
        params: { per_page: 100, page },
      }
    );
    if (!Array.isArray(data) || data.length === 0) break;
    all.push(...data);
    if (data.length < 100) break;
  }
  return all;
}

async function fetchBranchInfo(owner, repo, headers) {
  try {
    const { data } = await axios.get(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches`,
      { headers, params: { per_page: 100 } }
    );
    if (!Array.isArray(data)) return { count: 1, truncated: false };
    return { count: data.length, truncated: data.length === 100 };
  } catch {
    return { count: 1, truncated: false };
  }
}

function mapGithubCommits(data) {
  return data.map((c) => ({
    sha: c.sha,
    hash: c.sha.slice(0, 7),
    author: c?.commit?.author?.name ?? c?.author?.login ?? "Unknown",
    date: c?.commit?.author?.date ?? null,
    message: c?.commit?.message ?? "",
    url: c?.html_url ?? null,
  }));
}

function categoriseCommits(commits) {
  const feature = [];
  const bugfix = [];
  const refactor = [];
  const others = [];

  for (const c of commits) {
    const msg = (c.message || "").split("\n")[0].toLowerCase();
    if (/^(feat|feature|add|new)/.test(msg)) feature.push(c.message);
    else if (/^(fix|bug|hotfix|patch)/.test(msg)) bugfix.push(c.message);
    else if (/^(refactor|perf|chore|clean)/.test(msg)) refactor.push(c.message);
    else others.push(c.message);
  }

  return { feature, bugfix, refactor, others };
}

// ─── Express App ─────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.send("GitScribe backend is running"));

// GET /api/commits
app.get("/api/commits", async (req, res) => {
  try {
    const parsed = parseRepoInput({
      owner: req.query.owner,
      repo: req.query.repo,
      url: req.query.url,
    });

    if (!parsed) {
      return res.status(400).json({
        error:
          "Missing or invalid repo input. Provide owner+repo or url=https://github.com/owner/repo",
      });
    }

    const { owner, repo } = parsed;
    const headers = buildGitHubHeaders();

    const [rawCommits, branchInfo] = await Promise.all([
      fetchCommitPages(owner, repo, headers),
      fetchBranchInfo(owner, repo, headers),
    ]);

    const commits = mapGithubCommits(rawCommits);

    const categorised = categoriseCommits(commits);
    const story = generateStoryAI(categorised);
    const analysis = analyzeCommits(commits, branchInfo);

    return res.json({ owner, repo, commits, story, analysis });
  } catch (error) {
    const status = error?.response?.status;
    const ghMessage =
      error?.response?.data?.message || error?.message || "Failed to fetch commits";

    console.error("[GitScribe] GitHub fetch failed:", status, ghMessage);

    if (status === 404)
      return res.status(404).json({ error: "Repository not found. Check owner/repo name." });
    if (status === 401)
      return res.status(401).json({
        error: "Invalid GitHub token. Fix GITHUB_TOKEN in backend/.env or remove it.",
      });
    if (status === 403)
      return res.status(403).json({
        error: "GitHub API rate limit exceeded. Add a GITHUB_TOKEN in backend/.env.",
      });

    return res.status(500).json({ error: "Failed to fetch GitHub commits." });
  }
});

// GET /api/repo  (metadata: stars, forks, description, etc.)
app.get("/api/repo", async (req, res) => {
  try {
    const parsed = parseRepoInput({
      owner: req.query.owner,
      repo: req.query.repo,
      url: req.query.url,
    });

    if (!parsed)
      return res.status(400).json({ error: "Missing or invalid repo input." });

    const { owner, repo } = parsed;
    const response = await axios.get(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      { headers: buildGitHubHeaders() }
    );

    const d = response.data;
    return res.json({
      owner,
      repo,
      fullName: d.full_name,
      description: d.description,
      stars: d.stargazers_count,
      forks: d.forks_count,
      openIssues: d.open_issues_count,
      language: d.language,
      homepage: d.homepage,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      defaultBranch: d.default_branch,
    });
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404)
      return res.status(404).json({ error: "Repository not found." });
    return res.status(500).json({ error: "Failed to fetch repository info." });
  }
});

module.exports = { app };
