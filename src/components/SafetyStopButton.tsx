'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface SafetyStopButtonProps {
  onStop: () => void;
  disabled?: boolean;
}

export const SafetyStopButton: React.FC<SafetyStopButtonProps> = ({ onStop, disabled }) => {
  return (
    <button
      type="button"
      onClick={onStop}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-amber-200 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/40 transition-all duration-150 active:scale-95 shadow-lg backdrop-blur-sm cursor-pointer disabled:opacity-50"
      title="Arrêter immédiatement la séance pour protéger ta voix"
    >
      <ShieldAlert className="w-4 h-4 text-amber-400" />
      <span>Je sens une gêne</span>
    </button>
  );
};
