'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ExerciseConfig, PitchResult, VocalScore, UserPreferences } from '@/types/audio';
import { MicrophoneManager } from '@/lib/audio/microphone';
import { ToneGenerator } from '@/lib/audio/toneGenerator';
import { buildAbsoluteCurve, getTargetFrequencyAtTime } from '@/lib/audio/exercises';
import { calculateVocalScore, EvaluationSample } from '@/lib/audio/scoring';
import { calculateCentsDifference, getIntuitiveFeedback } from '@/lib/audio/pitchDetection';
import { LocalStorageManager } from '@/lib/storage';
import { PitchCanvas } from './PitchCanvas';
import { SafetyStopButton } from './SafetyStopButton';
import { ScoreModal } from './ScoreModal';
import { Play, Square, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

interface ExerciseRunnerProps {
  exercise: ExerciseConfig;
  preferences: UserPreferences;
  onBack: () => void;
  onNextExercise: () => void;
}

export const ExerciseRunner: React.FC<ExerciseRunnerProps> = ({
  exercise,
  preferences,
  onBack,
  onNextExercise,
}) => {
  // Audio services
  const micManagerRef = useRef<MicrophoneManager | null>(null);
  const toneGenRef = useRef<ToneGenerator | null>(null);

  // Exercise execution states
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'countdown' | 'active' | 'completed'>('idle');
  const [countdown, setCountdown] = useState(3);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [currentPitch, setCurrentPitch] = useState(0);
  const [isVoiced, setIsVoiced] = useState(false);
  const [centsDiff, setCentsDiff] = useState(0);
  const [recordedHistory, setRecordedHistory] = useState<
    Array<{ timeMs: number; freq: number; isVoiced: boolean }>
  >([]);
  const [sessionScore, setSessionScore] = useState<VocalScore | null>(null);
  const [audioMuted, setAudioMuted] = useState(!preferences.audioFeedback);

  // References for live loop
  const samplesRef = useRef<EvaluationSample[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerFrameRef = useRef<number | null>(null);

  // Build target curve adapted to user's comfortable base frequency
  const absoluteCurve = buildAbsoluteCurve(exercise.points, preferences.baseFrequency);
  const currentTargetFreq = getTargetFrequencyAtTime(absoluteCurve, elapsedMs);

  // Initialize audio managers
  useEffect(() => {
    micManagerRef.current = new MicrophoneManager();
    toneGenRef.current = new ToneGenerator();

    return () => {
      if (timerFrameRef.current !== null) {
        cancelAnimationFrame(timerFrameRef.current);
      }
      micManagerRef.current?.dispose();
      toneGenRef.current?.dispose();
    };
  }, []);

  // Stop everything safely
  const stopExercise = useCallback((stoppedEarly: boolean = false) => {
    if (timerFrameRef.current !== null) {
      cancelAnimationFrame(timerFrameRef.current);
      timerFrameRef.current = null;
    }

    micManagerRef.current?.stopAnalysis();
    toneGenRef.current?.stopTone();

    setIsRunning(false);
    setPhase(stoppedEarly ? 'idle' : 'completed');

    // Compute and record score
    const score = calculateVocalScore(
      exercise.id,
      samplesRef.current,
      exercise.durationMs,
      stoppedEarly
    );
    LocalStorageManager.saveScore(score);
    setSessionScore(score);
  }, [exercise.durationMs, exercise.id]);

  // Main exercise tick loop
  const tick = useCallback(() => {
    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    setElapsedMs(elapsed);

    // Modulate audio reference tone if audio guide is enabled
    if (!audioMuted && toneGenRef.current) {
      const targetHz = getTargetFrequencyAtTime(absoluteCurve, elapsed);
      toneGenRef.current.rampFrequency(targetHz, 0.05);
    }

    if (elapsed >= exercise.durationMs) {
      stopExercise(false);
    } else {
      timerFrameRef.current = requestAnimationFrame(tick);
    }
  }, [absoluteCurve, audioMuted, exercise.durationMs, stopExercise]);

  // Start exercise flow
  const startExercise = async () => {
    setSessionScore(null);
    samplesRef.current = [];
    setRecordedHistory([]);
    setElapsedMs(0);
    setCurrentPitch(0);
    setIsVoiced(false);

    // Initial countdown (3..2..1.. Parle)
    setPhase('countdown');
    setCountdown(3);

    const initMic = await micManagerRef.current?.initialize();
    if (!initMic?.success) {
      alert(initMic?.error || 'Erreur microphone. Veuillez vérifier les permissions.');
      setPhase('idle');
      return;
    }

    // Play starting reference note briefly during countdown to cue pitch
    if (!audioMuted && toneGenRef.current) {
      const initialFreq = absoluteCurve[0].freq;
      await toneGenRef.current.playTone(initialFreq, 2.5);
    }

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setPhase('active');
        setIsRunning(true);
        startTimeRef.current = performance.now();

        // Start microphone listener
        micManagerRef.current?.startAnalysis((res: PitchResult) => {
          const currentTime = performance.now() - startTimeRef.current;
          const target = getTargetFrequencyAtTime(absoluteCurve, currentTime);

          setCurrentPitch(res.frequency);
          setIsVoiced(res.isVoiced);

          if (res.isVoiced && res.frequency > 0) {
            const diff = calculateCentsDifference(res.frequency, target);
            setCentsDiff(diff);
            samplesRef.current.push({
              timeMs: currentTime,
              detectedFreq: res.frequency,
              targetFreq: target,
              isVoiced: true,
            });
            setRecordedHistory((prev) => [
              ...prev,
              { timeMs: currentTime, freq: res.frequency, isVoiced: true },
            ]);
          } else {
            samplesRef.current.push({
              timeMs: currentTime,
              detectedFreq: 0,
              targetFreq: target,
              isVoiced: false,
            });
          }
        });

        // Trigger tick loop
        timerFrameRef.current = requestAnimationFrame(tick);
      }
    }, 900);
  };

  const feedback = getIntuitiveFeedback(centsDiff);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            stopExercise(false);
            onBack();
          }}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exercices</span>
        </button>

        <div className="text-center">
          <span className="text-xs text-amber-400 font-medium tracking-wide">
            {exercise.subtitle}
          </span>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center justify-center gap-2">
            <span>{exercise.title}</span>
            <span className="font-arabic text-slate-400 text-lg">{exercise.titleAr}</span>
          </h1>
        </div>

        {/* Audio guide toggle */}
        <button
          type="button"
          onClick={() => setAudioMuted((m) => !m)}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            !audioMuted
              ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
          title={!audioMuted ? 'Désactiver le guide sonore' : 'Activer le guide sonore'}
        >
          {!audioMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Canvas Visualizer */}
      <div className="relative">
        <PitchCanvas
          targetCurve={absoluteCurve}
          currentPitch={currentPitch}
          isVoiced={isVoiced}
          elapsedMs={elapsedMs}
          totalDurationMs={exercise.durationMs}
          targetFreq={currentTargetFreq}
          recordedHistory={recordedHistory}
          minFreqDisplay={Math.round(preferences.baseFrequency * 0.7)}
          maxFreqDisplay={Math.round(preferences.baseFrequency * 1.6)}
        />

        {/* Countdown Overlay */}
        {phase === 'countdown' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl backdrop-blur-xs">
            <span className="text-xs text-sky-400 font-medium uppercase tracking-widest mb-1">
              Écoute puis prépare ta voix
            </span>
            <span className="text-6xl font-black text-amber-400 font-mono animate-pulse">
              {countdown}
            </span>
          </div>
        )}

        {/* Intuitive Feedback Badge (Section 14 of CDC) */}
        {phase === 'active' && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {isVoiced ? (
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-slate-700/60 shadow-lg ${feedback.color} bg-slate-900/80`}
              >
                <span>{feedback.text}</span>
                {preferences.expertMode && (
                  <span className="ml-2 font-mono text-[10px] text-slate-400">
                    {currentPitch} Hz ({centsDiff > 0 ? `+${centsDiff}` : centsDiff}¢)
                  </span>
                )}
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-400 bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                En attente de voix...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-sm">
        {/* Safety Stop Button (CDC Section 37) */}
        <SafetyStopButton
          onStop={() => stopExercise(true)}
          disabled={!isRunning && phase !== 'countdown'}
        />

        {/* Main Action (Start / Stop) */}
        <div className="flex items-center gap-3">
          {!isRunning && phase !== 'countdown' ? (
            <button
              type="button"
              onClick={startExercise}
              className="py-3 px-6 rounded-xl font-medium text-sm bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-lg shadow-sky-600/20 active:scale-98 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Démarrer l’exercice</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => stopExercise(false)}
              className="py-3 px-6 rounded-xl font-medium text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-98 flex items-center gap-2 cursor-pointer"
            >
              <Square className="w-4 h-4" />
              <span>Arrêter</span>
            </button>
          )}
        </div>

        {/* Status indicator */}
        <div className="text-right text-xs text-slate-400">
          <span>Durée : {Math.round(exercise.durationMs / 1000)}s</span>
        </div>
      </div>

      {/* Score Modal */}
      <ScoreModal
        score={sessionScore}
        onRetry={startExercise}
        onNext={onNextExercise}
        onHome={onBack}
      />
    </div>
  );
};
