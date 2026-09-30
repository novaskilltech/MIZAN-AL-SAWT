import { ExerciseConfig, CurvePoint } from '@/types/audio';

export const BASELINE_EXERCISES: ExerciseConfig[] = [
  {
    id: 'hold_pitch',
    title: 'Tenir une hauteur',
    titleAr: 'ثبات الصوت',
    subtitle: 'Niveau 1 — Stabilité',
    description: 'Maintiens ta voix constante et régulière sur la ligne guide.',
    type: 'hold_pitch',
    durationMs: 6000,
    baseFreqOffset: 0,
    points: [
      { timeMs: 0, freq: 0 },       // 0 semitone offset
      { timeMs: 6000, freq: 0 },
    ],
  },
  {
    id: 'ascend',
    title: 'Montée progressive',
    titleAr: 'صعود تدريجي',
    subtitle: 'Niveau 1 — Contrôle moteur',
    description: 'Fais monter doucement ta voix sans forcer ni crier.',
    type: 'ascend',
    durationMs: 6000,
    baseFreqOffset: 0,
    points: [
      { timeMs: 0, freq: 0 },
      { timeMs: 1500, freq: 0 },     // Stabilise initially
      { timeMs: 4500, freq: 3.5 },   // Rise +3.5 semitones
      { timeMs: 6000, freq: 3.5 },   // Stabilise at top
    ],
  },
  {
    id: 'descend',
    title: 'Descente progressive',
    titleAr: 'نزول تدريجي',
    subtitle: 'Niveau 1 — Souplesse',
    description: 'Laisse redescendre ta voix avec calme et maîtrise du souffle.',
    type: 'descend',
    durationMs: 6000,
    baseFreqOffset: 3.5,
    points: [
      { timeMs: 0, freq: 3.5 },
      { timeMs: 1500, freq: 3.5 },   // Stabilise
      { timeMs: 4500, freq: 0 },     // Descend to base
      { timeMs: 6000, freq: 0 },
    ],
  },
  {
    id: 'ascend_descend',
    title: 'Montée puis descente',
    titleAr: 'صعود ثم نزول',
    subtitle: 'Niveau 1 — Flexibilité',
    description: 'Monte avec douceur puis redescends en suivant l’arche vocale.',
    type: 'ascend_descend',
    durationMs: 8000,
    baseFreqOffset: 0,
    points: [
      { timeMs: 0, freq: 0 },
      { timeMs: 1200, freq: 0 },     // Base
      { timeMs: 3500, freq: 4 },     // Top
      { timeMs: 4800, freq: 4 },     // Plateau
      { timeMs: 6800, freq: 0 },     // Return
      { timeMs: 8000, freq: 0 },
    ],
  },
];

/**
 * Converts semitone offset curve into absolute frequencies in Hz
 * using user's comfortable base frequency (e.g. 145 Hz).
 */
export function buildAbsoluteCurve(points: CurvePoint[], baseFrequency: number): CurvePoint[] {
  return points.map((p) => ({
    timeMs: p.timeMs,
    freq: Math.round(baseFrequency * Math.pow(2, p.freq / 12) * 10) / 10,
  }));
}

/**
 * Computes target frequency at any exact elapsed time (ms) using linear interpolation
 */
export function getTargetFrequencyAtTime(curve: CurvePoint[], timeMs: number): number {
  if (!curve || curve.length === 0) return 0;
  if (timeMs <= curve[0].timeMs) return curve[0].freq;
  if (timeMs >= curve[curve.length - 1].timeMs) return curve[curve.length - 1].freq;

  for (let i = 0; i < curve.length - 1; i++) {
    const p1 = curve[i];
    const p2 = curve[i + 1];

    if (timeMs >= p1.timeMs && timeMs <= p2.timeMs) {
      const span = p2.timeMs - p1.timeMs;
      if (span === 0) return p1.freq;
      const progress = (timeMs - p1.timeMs) / span;
      return p1.freq + (p2.freq - p1.freq) * progress;
    }
  }

  return curve[curve.length - 1].freq;
}
