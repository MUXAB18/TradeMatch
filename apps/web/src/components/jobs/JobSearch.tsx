import { Search, MapPin } from 'lucide-react';

interface JobSearchProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  locationQuery: string;
  onLocationChange: (val: string) => void;
  onSearchSubmit: () => void;
}

export default function JobSearch({
  searchQuery,
  onSearchChange,
  locationQuery,
  onLocationChange,
  onSearchSubmit,
}: JobSearchProps) {
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row bg-surface border border-border md:rounded-full rounded-2xl shadow-sm overflow-hidden focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
        
        {/* Keyword Search */}
        <div className="flex-1 relative flex items-center border-b md:border-b-0 md:border-r border-border group">
          <div className="pl-5 pr-2 text-text-secondary group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search jobs, skills, companies..."
            className="w-full py-4 pr-5 bg-transparent text-[16px] text-text-primary placeholder:text-text-placeholder focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
          />
        </div>

        {/* Location Search */}
        <div className="flex-1 relative flex items-center group">
          <div className="pl-5 pr-2 text-text-secondary group-focus-within:text-primary transition-colors">
            <MapPin size={20} />
          </div>
          <input
            type="text"
            value={locationQuery}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="City, state, or Remote"
            className="w-full py-4 pr-5 bg-transparent text-[16px] text-text-primary placeholder:text-text-placeholder focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
          />
        </div>

        {/* Search Button */}
        <div className="p-2 shrink-0 md:w-auto w-full">
          <button
            onClick={onSearchSubmit}
            className="w-full md:w-auto bg-primary text-white font-bold text-[15px] px-8 py-3 rounded-xl md:rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Search
          </button>
        </div>
      </div>
      
      {/* Popular Searches */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-semibold text-text-secondary mr-2">Popular:</span>
        {['Software Engineer', 'React', 'Next.js', 'Remote', 'Intern'].map((term) => (
          <button
            key={term}
            onClick={() => {
              onSearchChange(term);
              onSearchSubmit();
            }}
            className="text-[13px] font-medium text-text-primary bg-background border border-border px-3 py-1.5 rounded-full hover:border-primary hover:text-primary transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
