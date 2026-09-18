'use client';

interface PremiumSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  activeColor?: string;
}

export default function PremiumSwitch({
  value,
  onValueChange,
  activeColor = '#007AFF',
}: PremiumSwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onValueChange(!value)}
      className={`
        relative w-[51px] h-[31px] rounded-full transition-colors duration-300 shadow-sm shrink-0
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        ${value ? '' : 'bg-[#E5E5EA] dark:bg-[#39393D]'}
      `}
      style={value ? { backgroundColor: activeColor } : {}}
    >
      <span
        className={`
          absolute top-[2px] left-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-md
          transition-transform duration-300 ease-out
          ${value ? 'translate-x-[20px]' : 'translate-x-0'}
        `}
      />
    </button>
  );
}
