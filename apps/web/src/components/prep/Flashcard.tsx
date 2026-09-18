'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, RotateCcw } from 'lucide-react';
import { MockPrepCard } from '@/lib/mockData';

interface FlashcardProps {
  cards: MockPrepCard[];
  initialIndex?: number;
}

export default function Flashcard({ cards, initialIndex = 0 }: FlashcardProps) {
  const [index, setIndex] = useState(initialIndex);
  const [flipped, setFlipped] = useState(false);
  const [order, setOrder] = useState<number[]>(cards.map((_, i) => i));

  const currentCard = cards[order[index]];
  const progress = cards.length > 0 ? (index + 1) / cards.length : 0;

  const handlePrev = () => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.max(0, i - 1)), 100);
  };

  const handleNext = () => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.min(cards.length - 1, i + 1)), 100);
  };

  const handleShuffle = useCallback(() => {
    const shuffled = [...order].sort(() => Math.random() - 0.5);
    setOrder(shuffled);
    setIndex(0);
    setFlipped(false);
  }, [order]);

  const handleReset = () => {
    setOrder(cards.map((_, i) => i));
    setIndex(0);
    setFlipped(false);
  };

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center h-60 text-text-secondary font-semibold">
        No cards available
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      {/* Progress bar */}
      <div className="w-full flex items-center gap-3">
        <span className="text-[13px] font-bold text-text-secondary whitespace-nowrap">
          {index + 1} / {cards.length}
        </span>
        <div className="flex-1 h-2 bg-background rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleShuffle}
            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-all"
            aria-label="Shuffle cards"
          >
            <Shuffle size={16} />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-all"
            aria-label="Reset cards"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setFlipped((f) => !f)}
        aria-label={flipped ? 'Showing answer — click to see question' : 'Click to reveal answer'}
        className={`
          relative w-full min-h-[240px] rounded-[24px] p-8 cursor-pointer
          flex flex-col justify-between overflow-hidden
          border transition-all duration-300
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
          ${flipped
            ? 'bg-primary border-primary/20 shadow-lg shadow-primary/20'
            : 'bg-surface border-border shadow-sm hover:shadow-md hover:border-primary/20'
          }
        `}
      >
        {/* Category badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <span
            className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
              flipped
                ? 'bg-white/20 text-white'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {flipped ? 'Answer' : currentCard.category}
          </span>
          <span className={`text-[12px] font-semibold ${flipped ? 'text-white/60' : 'text-text-secondary'}`}>
            {flipped ? 'Tap to see question' : 'Tap to reveal answer'}
          </span>
        </div>

        {/* Content */}
        <p
          className={`text-[16px] font-semibold leading-relaxed flex-1 ${
            flipped ? 'text-white' : 'text-text-primary'
          }`}
        >
          {flipped ? currentCard.answer : currentCard.question}
        </p>

        {/* Decorative circle */}
        <div
          className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full opacity-20 ${
            flipped ? 'bg-white' : 'bg-primary'
          }`}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={handlePrev}
          disabled={index === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[14px] bg-surface border border-border font-bold text-[15px] text-text-primary transition-all hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={index === cards.length - 1}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[14px] bg-primary text-white font-bold text-[15px] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
