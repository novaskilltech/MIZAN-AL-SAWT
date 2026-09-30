'use client';

import React, { useEffect } from 'react';
import { VocalScore } from '@/types/audio';
import { RotateCcw, ArrowRight, Home, CheckCircle2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScoreModalProps {
  score: VocalScore | null;
  onRetry: () => void;
  onNext: () => void;
  onHome: () => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  score,
  onRetry,
  onNext,
  onHome,
}) => {
  useEffect(() => {
    if (score && score.overallScore >= 85 && !score.stoppedEarly) {
      try {
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#48CAE4', '#E0A96D', '#F8F9FA'],
          disableForReducedMotion: true,
        });
      } catch {
        // Safe fallback if confetti unavailable
      }
    }
  }, [score]);

  if (!score) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg p-7 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
            {score.stoppedEarly ? (
              <ShieldCheck className="w-8 h-8 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-sky-400" />
            )}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {score.stoppedEarly ? 'Séance Interrompue' : 'Résultat de la séance'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {score.stoppedEarly ? 'Protection vocale respectée' : 'Analyse de ta maîtrise vocale'}
          </p>
        </div>

        {/* Scores Grid */}
        {!score.stoppedEarly ? (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
              <span className="text-xs text-slate-400 block mb-1">Précision</span>
              <span className="text-2xl font-bold text-sky-400">{score.accuracy}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
              <span className="text-xs text-slate-400 block mb-1">Stabilité</span>
              <span className="text-2xl font-bold text-emerald-400">{score.stability}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
              <span className="text-xs text-slate-400 block mb-1">Score global</span>
              <span className="text-2xl font-bold text-amber-400">{score.overallScore}%</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-sm mb-6 text-center leading-relaxed">
            Tu as choisi d’écouter ton corps et d’arrêter l’exercice. Reprends plus tard lorsque ta voix sera pleinement reposée.
          </div>
        )}

        {/* Feedback text */}
        <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/50 mb-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Retour Pédagogique</p>
          <p className="text-sm text-slate-300 leading-relaxed">{score.feedbackText}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 py-3 px-4 rounded-xl font-medium text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Recommencer</span>
          </button>
          {!score.stoppedEarly && (
            <button
              type="button"
              onClick={onNext}
              className="flex-1 py-3 px-4 rounded-xl font-medium text-sm bg-sky-600 hover:bg-sky-500 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-600/20"
            >
              <span>Exercice suivant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onHome}
            className="py-3 px-4 rounded-xl font-medium text-sm bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
