'use client';

import React, { useState, useRef } from 'react';
import { UserPreferences, VocalScore } from '@/types/audio';
import { LocalStorageManager } from '@/lib/storage';
import { X, Download, Upload, Trash2, Settings, History, Sliders, Volume2, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onOpenCalibration: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onOpenCalibration,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  const [scores] = useState<VocalScore[]>(() => LocalStorageManager.getScores());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && LocalStorageManager.importDataFromJSON(content)) {
        alert('Sauvegarde restaurée avec succès !');
        window.location.reload();
      } else {
        alert('Fichier de sauvegarde invalide.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'settings' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Paramètres</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'history' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Historique ({scores.length})</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          {activeTab === 'settings' ? (
            <>
              {/* Vocal Range Base Frequency */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold">Tessiture Confortable (Centre vocal)</span>
                  </div>
                  <span className="text-sm font-bold text-sky-400 font-mono">
                    {preferences.baseFrequency} Hz
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Ajuste la hauteur médiane de ta voix pour que tous les exercices s’adaptent à ton registre naturel.
                </p>
                <input
                  type="range"
                  min="90"
                  max="260"
                  step="5"
                  value={preferences.baseFrequency}
                  onChange={(e) => onUpdatePreferences({ baseFrequency: Number(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>90 Hz (Grave profond)</span>
                  <span>145 Hz (Médium naturel)</span>
                  <span>260 Hz (Clair / Aigu)</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-sky-400" />
                    <div>
                      <p className="text-sm font-medium">Guide sonore de référence</p>
                      <p className="text-xs text-slate-400">Joue un son sinusoïdal doux pour guider l’oreille</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.audioFeedback}
                    onChange={(e) => onUpdatePreferences({ audioFeedback: e.target.checked })}
                    className="w-4 h-4 accent-sky-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
                  <div>
                    <p className="text-sm font-medium">Mode Expert</p>
                    <p className="text-xs text-slate-400">Affiche les valeurs chiffrées en Hz et cents de demi-ton</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.expertMode}
                    onChange={(e) => onUpdatePreferences({ expertMode: e.target.checked })}
                    className="w-4 h-4 accent-sky-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Calibration Shortcut */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCalibration();
                }}
                className="w-full py-3 px-4 rounded-xl text-sm font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Recalibrer le microphone</span>
              </button>

              {/* Backup & Privacy (CDC Section 5 & 53) */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Données locales & Confidentialité</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  L’intégralité de tes données et analyses vocales reste stockée dans ton navigateur. Rien n’est transmis à aucun serveur externe.
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => LocalStorageManager.exportDataAsJSON()}
                    className="flex-1 py-2.5 px-3 rounded-xl text-xs font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exporter (JSON)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-3 rounded-xl text-xs font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Importer</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Es-tu certain de vouloir effacer tout l’historique local ?')) {
                      LocalStorageManager.clearAllData();
                      window.location.reload();
                    }
                  }}
                  className="w-full py-2 px-3 text-xs text-red-400/80 hover:text-red-300 hover:bg-red-950/20 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Effacer toutes les données locales</span>
                </button>
              </div>
            </>
          ) : (
            /* History Tab */
            <div className="space-y-3">
              {scores.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Aucune séance enregistrée pour le moment.
                </div>
              ) : (
                scores.map((sc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-medium text-slate-200">
                        {new Date(sc.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {sc.stoppedEarly ? 'Interrompu' : `${sc.durationSec}s d’entraînement`}
                      </p>
                    </div>
                    {!sc.stoppedEarly ? (
                      <div className="flex gap-3 text-right">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Précision</span>
                          <span className="text-xs font-bold text-sky-400">{sc.accuracy}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Stabilité</span>
                          <span className="text-xs font-bold text-emerald-400">{sc.stability}%</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-amber-400 font-medium bg-amber-950/30 px-2 py-0.5 rounded-md border border-amber-800/40">
                        Repos
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
