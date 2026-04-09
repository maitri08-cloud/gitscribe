interface ViewSwitcherProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const views = ["Summary", "Story Mode", "Release Notes", "Portfolio View"];

const ViewSwitcher = ({ activeView, onViewChange }: ViewSwitcherProps) => {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/50 w-fit opacity-0 animate-fade-up" style={{ animationDelay: '0.1s' }}>
      {views.map((view) => (
        <button
          key={view}
          onClick={() => onViewChange(view)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
            activeView === view
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {view}
        </button>
      ))}
    </div>
  );
};

export default ViewSwitcher;
