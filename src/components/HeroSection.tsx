import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, GitBranch, GitCommit, GitMerge } from "lucide-react";
import gitLogo from "@/assets/git-logo.png";

interface HeroSectionProps {
  onGenerate: (url: string) => void;
}

const HeroSection = ({ onGenerate }: HeroSectionProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onGenerate(url.trim());
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 animate-gradient" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-[100px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-[120px] animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] animate-pulse-glow" />


      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Animated Logo */}
        <div
          className="mx-auto mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.05s' }}
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse-glow" />
            <img
              src={gitLogo}
              alt="GitScribe Logo"
              width={512}
              height={512}
              className="relative w-20 h-20 md:w-24 md:h-24 drop-shadow-lg animate-float"
            />
          </div>
        </div>

        {/* Brand name */}
        <div
          className="opacity-0 animate-fade-up mb-4"
          style={{ animationDelay: '0.15s' }}
        >
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary/70">
            GitScribe
          </span>
        </div>

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm text-muted-foreground mb-8 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.25s' }}
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>AI-Powered Git Analytics</span>
        </div>

        {/* Title */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.35s' }}
        >
          Turn Git History
          <br />
          <span className="gradient-text">into Stories</span>
        </h1>

        {/* Spacer */}
        <div className="mb-12" />

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="opacity-0 animate-fade-up"
          style={{ animationDelay: '0.65s' }}
        >
          <div className="relative flex items-center max-w-xl mx-auto">
            <div className="absolute left-4 text-muted-foreground">
              <GitBranch className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your GitHub repo URL…"
              className="w-full h-14 pl-12 pr-44 rounded-full bg-card border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
            />
            <div className="absolute right-1.5">
              <Button type="submit" variant="hero" size="lg" className="h-11 px-6 gap-2">
                Generate Story
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>

        {/* Social proof */}
        <div
          className="mt-8 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.8s' }}
        >
          <p className="text-xs text-muted-foreground mb-3">
            Works with any public GitHub repository
          </p>
          <div className="flex items-center justify-center gap-6 text-muted-foreground/40">
            <div className="flex items-center gap-1.5 text-xs">
              <GitCommit className="w-3.5 h-3.5" />
              <span>Smart Analysis</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5 text-xs">
              <GitMerge className="w-3.5 h-3.5" />
              <span>PDF Export</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5 text-xs">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Portfolio Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
