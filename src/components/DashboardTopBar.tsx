import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Download, Copy, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateCommitStoryPdf, type CommitStoryPdfInput } from "@/lib/generatePdf";

interface DashboardTopBarProps {
  repoName: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onBack: () => void;
  pdfInput: CommitStoryPdfInput | null;
}

const DashboardTopBar = ({ repoName, isDark, onToggleTheme, onBack, pdfInput }: DashboardTopBarProps) => {
  const [generating, setGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    setGenerating(true);
    toast("Generating PDF…");
    // Small delay so UI updates
    await new Promise((r) => setTimeout(r, 100));
    try {
      if (!pdfInput) {
        toast.error("Nothing to export yet.");
        return;
      }
      generateCommitStoryPdf(pdfInput);
      toast.success("PDF downloaded!");
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="font-semibold text-foreground">{repoName}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onToggleTheme} className="text-muted-foreground hover:text-foreground">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleDownloadPdf}
            disabled={generating || !pdfInput}
            title={pdfInput ? "Download PDF report" : "Load a repository first"}
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardTopBar;
