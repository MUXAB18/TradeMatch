export type JobTab = 'all' | 'recommended' | 'saved';

interface JobsTabsProps {
  activeTab: JobTab;
  onTabChange: (tab: JobTab) => void;
}

const TABS: { id: JobTab; label: string }[] = [
  { id: 'all', label: 'All Jobs' },
  { id: 'recommended', label: 'Recommended' },
  { id: 'saved', label: 'Saved Jobs' },
];

export default function JobsTabs({ activeTab, onTabChange }: JobsTabsProps) {
  return (
    <div className="w-full border-b border-border mt-8 flex overflow-x-auto hide-scrollbar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            relative px-6 py-4 text-[15px] font-bold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
            ${
              activeTab === tab.id
                ? 'text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }
          `}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
}
