import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const steps = [
  "Connecting to repository…",
  "Analyzing commit history…",
  "Generating insights…",
  "Building your story…",
];

interface LoadingTransitionProps {
  onComplete: () => void;
}

const LoadingTransition = ({ onComplete }: LoadingTransitionProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-8 opacity-0 animate-scale-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-20 animate-ping" />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent">
            <Loader2 className="w-7 h-7 text-primary-foreground animate-spin" />
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-lg font-medium text-foreground">{steps[step]}</p>
          <div className="flex justify-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i <= step ? 'w-8 bg-primary' : 'w-2 bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingTransition;
