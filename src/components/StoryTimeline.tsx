import { useEffect, useRef, useState } from "react";

export type TimelineEvent = {
  time: string;
  phase: string;
  description: string;
};

type StoryTimelineProps = {
  events: TimelineEvent[] | null;
};

const StoryTimeline = ({ events }: StoryTimelineProps) => {
  const list = events?.length ? events : [];
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setVisibleItems((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.3 }
    );
    refs.current.forEach((ref) => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, [list.length]);

  if (!list.length) {
    return (
      <p className="text-sm text-muted-foreground py-8">
        No timeline yet. Paste a GitHub repository and open Story Mode after the analysis finishes.
      </p>
    );
  }

  return (
    <div className="relative py-4">
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-12">
        {list.map((event, i) => {
          const isLeft = i % 2 === 0;
          const isVisible = visibleItems.has(i);
          return (
            <div
              key={`${event.time}-${i}`}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-index={i}
              className={`relative flex items-start gap-6 md:gap-0 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                <div
                  className={`w-3 h-3 rounded-full border-2 border-primary transition-colors duration-500 ${
                    isVisible ? "bg-primary" : "bg-background"
                  }`}
                />
              </div>

              <div className={`ml-14 md:ml-0 md:w-1/2 ${isLeft ? "md:pr-12 md:text-right" : "md:pl-12 md:ml-auto"}`}>
                <div className="glass-card rounded-xl p-5 hover-lift">
                  <span className="text-xs font-medium text-primary mb-1 block">{event.time}</span>
                  <h3 className="font-semibold text-foreground mb-2">{event.phase}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoryTimeline;
