'use client';

import React, { useState } from 'react';
import { Mic, CheckCircle2, AlertTriangle, X, Volume2 } from 'lucide-react';
import { MicrophoneManager } from '@/lib/audio/microphone';
import { MicStatus } from '@/types/audio';

interface MicCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalibrated: (status: MicStatus) => void;
  micManager: MicrophoneManager;
}

export const MicCalibrationModal: React.FC<MicCalibrationModalProps> = ({
  isOpen,
  onClose,
  onCalibrated,
  micManager,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<MicStatus | null>(null);

  if (!isOpen) return null;

  const runTest = async () => {
    setIsTesting(true);
    setProgress(0);
    setResult(null);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 4;
      });
    }, 120);

    const status = await micManager.calibrate(3000);
    clearInterval(interval);
    setProgress(100);
    setIsTesting(false);
    setResult(status);
    onCalibrated(status);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-wide">Test du Microphone</h3>
            <p className="text-xs text-slate-400">Calibration rapide avant de commencer</p>
          </div>
        </div>

        <div className="my-5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <p className="text-sm text-slate-300 mb-2">
            Appuie sur <strong>Tester</strong> puis prononce calmement :
          </p>
          <p className="text-xl font-medium text-center text-amber-300 py-3 tracking-widest font-mono">
            « Aaaaa »
          </p>
          <p className="text-xs text-center text-slate-400">
            Pendant environ 3 secondes à ton volume habituel de récitation.
          </p>
        </div>

        {/* Progress bar */}
        {isTesting && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-sky-400 mb-1">
              <span>Écoute en cours...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Result message */}
        {result && (
          <div
            className={`p-3.5 rounded-2xl mb-4 text-xs flex items-start gap-2.5 border ${
              result.isCalibrated
                ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-800/40 text-amber-300'
            }`}
          >
            {result.isCalibrated ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
            )}
            <div>
              <p className="font-medium">{result.message}</p>
              <p className="mt-1 text-slate-400">
                Niveau : {result.rms} • Bruit résiduel : {result.noiseFloor}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={runTest}
            disabled={isTesting}
            className="flex-1 py-3 px-4 rounded-xl font-medium text-sm bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-lg active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>{result ? 'Refaire le test' : 'Tester le micro'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 rounded-xl font-medium text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
          >
            Terminer
          </button>
        </div>
      </div>
    </div>
  );
};
