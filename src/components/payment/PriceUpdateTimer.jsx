'use client';

import { useState, useEffect } from 'react';

export default function PriceUpdateTimer({ onUpdate, interval = 120 }) {
  const [timeLeft, setTimeLeft] = useState(interval);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onUpdate?.();
          return interval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interval, onUpdate]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center justify-center gap-2 text-sm">
      <div className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2">
        <svg className="h-5 w-5 text-cyan-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-mono text-cyan-300">
          Precio se actualiza en {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
