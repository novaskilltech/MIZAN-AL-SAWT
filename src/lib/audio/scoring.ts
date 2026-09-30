import { VocalScore } from '@/types/audio';
import { calculateCentsDifference } from './pitchDetection';

export interface EvaluationSample {
  timeMs: number;
  detectedFreq: number;
  targetFreq: number;
  isVoiced: boolean;
}

/**
 * Calculates session vocal scores according to CDC Section 15:
 * Accuracy, Stability, Overall score, and constructive feedback.
 */
export function calculateVocalScore(
  exerciseId: string,
  samples: EvaluationSample[],
  totalDurationMs: number,
  stoppedEarly: boolean = false
): VocalScore {
  if (samples.length === 0 || stoppedEarly) {
    return {
      exerciseId,
      date: new Date().toISOString(),
      accuracy: 0,
      stability: 0,
      overallScore: 0,
      averageDeviationCents: 0,
      completed: false,
      stoppedEarly,
      durationSec: Math.round(totalDurationMs / 1000),
      feedbackText: stoppedEarly
        ? 'Exercice interrompu par précaution vocale. Prends le temps de te reposer.'
        : 'Aucune voix détectée pendant l’exercice.',
    };
  }

  // Filter only voiced frames
  const voicedSamples = samples.filter((s) => s.isVoiced && s.detectedFreq > 0 && s.targetFreq > 0);

  if (voicedSamples.length < 5) {
    return {
      exerciseId,
      date: new Date().toISOString(),
      accuracy: 0,
      stability: 0,
      overallScore: 0,
      averageDeviationCents: 0,
      completed: false,
      stoppedEarly: false,
      durationSec: Math.round(totalDurationMs / 1000),
      feedbackText: 'Signal trop court pour être évalué. Essaie de maintenir ta voix sur toute la durée.',
    };
  }

  // 1. Calculate accuracy based on cents deviation
  let totalAccuracyScore = 0;
  let totalCentsDeviation = 0;
  const deviations: number[] = [];

  for (const sample of voicedSamples) {
    const centsDiff = Math.abs(calculateCentsDifference(sample.detectedFreq, sample.targetFreq));
    deviations.push(centsDiff);
    totalCentsDeviation += centsDiff;

    // Tolerance window:
    // <= 45 cents: 100%
    // 45 to 150 cents: linear decrease from 100% to 15%
    // > 150 cents: 10%
    if (centsDiff <= 45) {
      totalAccuracyScore += 100;
    } else if (centsDiff <= 150) {
      const penalty = ((centsDiff - 45) / 105) * 85;
      totalAccuracyScore += Math.max(15, 100 - penalty);
    } else {
      totalAccuracyScore += 10;
    }
  }

  const accuracy = Math.round(totalAccuracyScore / voicedSamples.length);
  const averageDeviationCents = Math.round(totalCentsDeviation / voicedSamples.length);

  // 2. Calculate stability based on variance of pitch variation
  let sumSquaredDiffs = 0;
  for (let i = 1; i < voicedSamples.length; i++) {
    const diff = Math.abs(voicedSamples[i].detectedFreq - voicedSamples[i - 1].detectedFreq);
    sumSquaredDiffs += diff;
  }
  const avgFrameJitter = sumSquaredDiffs / (voicedSamples.length - 1);
  // Lower jitter = higher stability
  const stability = Math.max(20, Math.min(98, Math.round(100 - avgFrameJitter * 8)));

  // 3. Overall score
  const overallScore = Math.round(accuracy * 0.7 + stability * 0.3);

  // 4. Constructive feedback text (CDC Section 12 & 15)
  let feedbackText = '';
  if (overallScore >= 85) {
    feedbackText = 'Très belle régularité et justesse remarquable. La voix est bien posée.';
  } else if (overallScore >= 70) {
    feedbackText = 'Bon contrôle. Poursuis en veillant à la détente de la gorge et au soutien du souffle.';
  } else if (overallScore >= 50) {
    feedbackText = 'Progression en cours. Concentre-toi sur la stabilité avant de chercher la précision extrême.';
  } else {
    feedbackText = 'Prends ton temps pour écouter la tonalité de départ avant de reproduire le son.';
  }

  return {
    exerciseId,
    date: new Date().toISOString(),
    accuracy,
    stability,
    overallScore,
    averageDeviationCents,
    completed: true,
    stoppedEarly: false,
    durationSec: Math.round(totalDurationMs / 1000),
    feedbackText,
  };
}
