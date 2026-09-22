import { useState, useRef, useEffect } from 'react';
import { COUNTRY_CODES } from '@/lib/countryCodes';

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function CountryCodeSelect({ value, onChange }: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Try to match the specific country code if possible, default to first US match
  const selectedCountry = COUNTRY_CODES.find(c => c.code === value) || COUNTRY_CODES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center border-e border-gray-200" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 ps-1 pe-3 py-0.5 outline-none hover:bg-gray-50 focus:bg-gray-50 rounded-md transition-colors text-[15px] font-semibold text-gray-700"
      >
        <span className="text-base leading-none drop-shadow-sm">{selectedCountry.flag}</span>
        <span className="tracking-wide">{selectedCountry.code}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 ms-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] start-0 w-[260px] max-h-[320px] overflow-y-auto bg-white rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-gray-100 z-50 flex flex-col py-1 animate-in fade-in zoom-in-95 duration-100 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {COUNTRY_CODES.map((country, index) => (
            <button
              key={`${country.code}-${country.name}-${index}`}
              type="button"
              onClick={() => {
                onChange(country.code);
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full text-start outline-none ${value === country.code ? 'bg-[#0055FF]/5' : ''}`}
            >
              <span className="text-lg drop-shadow-sm">{country.flag}</span>
              <span className={`flex-1 text-[14px] truncate ${value === country.code ? 'font-bold text-[#0055FF]' : 'font-medium text-gray-700'}`}>
                {country.name}
              </span>
              <span className={`text-[13px] font-bold ${value === country.code ? 'text-[#0055FF]' : 'text-gray-400'}`}>
                {country.code}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
