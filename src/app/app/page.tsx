'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BASELINE_EXERCISES } from '@/lib/audio/exercises';
import { ExerciseConfig, UserPreferences, MicStatus } from '@/types/audio';
import { LocalStorageManager } from '@/lib/storage';
import { MicrophoneManager } from '@/lib/audio/microphone';
import { ExerciseRunner } from '@/components/ExerciseRunner';
import { MicCalibrationModal } from '@/components/MicCalibrationModal';
import { SettingsModal } from '@/components/SettingsModal';
import { Logo } from '@/components/Logo';
import {
  Sparkles,
  Sliders,
  Mic,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  Volume2,
  ArrowLeft,
} from 'lucide-react';

export default function TrainingStudio() {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseConfig | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    LocalStorageManager.getPreferences()
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [stats, setStats] = useState({
    avgAccuracy: 0,
    avgStability: 0,
    sessionCount: 0,
  });

  const micManagerRef = useRef<MicrophoneManager | null>(null);

  useEffect(() => {
    micManagerRef.current = new MicrophoneManager();
    const scores = LocalStorageManager.getScores();
    if (scores.length > 0) {
      const validScores = scores.filter((s) => !s.stoppedEarly && s.accuracy > 0);
      if (validScores.length > 0) {
        const totalAcc = validScores.reduce((acc, s) => acc + s.accuracy, 0);
        const totalStab = validScores.reduce((acc, s) => acc + s.stability, 0);
        setStats({
          avgAccuracy: Math.round(totalAcc / validScores.length),
          avgStability: Math.round(totalStab / validScores.length),
          sessionCount: scores.length,
        });
      }
    }

    return () => {
      micManagerRef.current?.dispose();
    };
  }, [selectedExercise]);

  const handleUpdatePreferences = (prefs: Partial<UserPreferences>) => {
    const updated = LocalStorageManager.savePreferences(prefs);
    setPreferences(updated);
  };

  const handleNextExercise = () => {
    if (!selectedExercise) return;
    const currentIndex = BASELINE_EXERCISES.findIndex((e) => e.id === selectedExercise.id);
    const nextIndex = (currentIndex + 1) % BASELINE_EXERCISES.length;
    setSelectedExercise(BASELINE_EXERCISES[nextIndex]);
  };

  return (
    <main className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0B132B]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors pr-2 border-r border-slate-800"
              title="Retour à l'accueil"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Accueil</span>
            </Link>
            <Logo size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCalibrationOpen(true)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
              title="Tester le microphone"
            >
              <Mic className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Calibration</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
              title="Paramètres et Historique"
            >
              <Sliders className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {selectedExercise ? (
          <ExerciseRunner
            exercise={selectedExercise}
            preferences={preferences}
            onBack={() => setSelectedExercise(null)}
            onNextExercise={handleNextExercise}
          />
        ) : (
          <div className="space-y-10">
            {/* Daily Session Card */}
            <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0D1B3E] via-[#0B132B] to-[#080E21] border border-slate-800 shadow-2xl">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Entraînement quotidien recommandé • {preferences.dailyGoalMinutes} min</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                  Développe la maîtrise de ta voix sans forcer.
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Le miroir vocal analyse la hauteur de ta voix en temps réel pour aligner ce que ton oreille intérieure imagine et ce que ton souffle produit réellement.
                </p>

                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedExercise(BASELINE_EXERCISES[0])}
                    className="py-3 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition-all shadow-lg shadow-sky-600/30 active:scale-98 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Commencer la séance</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCalibrationOpen(true)}
                    className="py-3 px-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 font-medium text-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-sky-400" />
                    <span>Calibrer mon micro</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#0B132B]/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                  <span>Précision moyenne</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {stats.avgAccuracy > 0 ? `${stats.avgAccuracy}%` : '—'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B132B]/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Stabilité vocale</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {stats.avgStability > 0 ? `${stats.avgStability}%` : '—'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B132B]/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Séances effectuées</span>
                </div>
                <div className="text-xl font-bold text-white">{stats.sessionCount}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B132B]/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tessiture de base</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  {preferences.baseFrequency} Hz
                </div>
              </div>
            </div>

            {/* Exercise Selection Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Exercices Fondamentaux
                  </h2>
                  <p className="text-xs text-slate-400">
                    Progression adaptée à ton registre vocal naturel
                  </p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-sky-950/60 border border-sky-800/40 text-sky-400">
                  Niveau 1 — Contrôle
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BASELINE_EXERCISES.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => setSelectedExercise(ex)}
                    className="p-5 rounded-2xl bg-[#0B132B]/60 hover:bg-[#0E1A3D] border border-slate-800 hover:border-sky-500/50 transition-all duration-200 text-left group shadow-lg cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
                          {ex.subtitle}
                        </span>
                        <span className="text-sm font-arabic text-slate-400 group-hover:text-amber-300 transition-colors">
                          {ex.titleAr}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                        {ex.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ex.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 group-hover:text-sky-400 transition-colors">
                      <span>Durée : {Math.round(ex.durationMs / 1000)}s</span>
                      <div className="flex items-center gap-1 font-medium">
                        <span>Lancer</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Religious Safeguard Notice */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/30 text-xs text-amber-200/90 leading-relaxed text-center">
              <span className="font-semibold block mb-0.5 text-amber-300">
                Garde-fou fondamental (Tajwīd &gt; Mélodie)
              </span>
              L’embellissement de la voix accompagne la récitation. Il ne doit en aucun cas altérer
              les règles de Tajwīd, ni déformer la prononciation des lettres.
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500 bg-[#070D1E]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ميزان الصوت — Mīzān al-Ṣawt • Studio Vocal v0.1</span>
          <span className="text-slate-600">
            Traitement audio 100% local • Confidentialité garantie
          </span>
        </div>
      </footer>

      {/* Modals */}
      {micManagerRef.current && (
        <MicCalibrationModal
          isOpen={isCalibrationOpen}
          onClose={() => setIsCalibrationOpen(false)}
          onCalibrated={(status: MicStatus) => {
            console.log('Calibrated mic status', status);
          }}
          micManager={micManagerRef.current}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        onOpenCalibration={() => setIsCalibrationOpen(true)}
      />
    </main>
  );
}
