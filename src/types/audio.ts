export interface PitchResult {
  frequency: number;       // Fundamental frequency in Hz (0 if unvoiced/silent)
  confidence: number;      // 0 to 1 confidence/periodicity score
  clarity: number;         // 0 to 1
  rms: number;             // Audio power (volume)
  isVoiced: boolean;       // True if above volume & confidence threshold
  centsOff?: number;       // Deviation in cents from target (if target provided)
  timestamp: number;       // High-resolution timestamp
}

export type ExerciseType = 'hold_pitch' | 'ascend' | 'descend' | 'ascend_descend';

export interface CurvePoint {
  timeMs: number;
  freq: number;
}

export interface ExerciseConfig {
  id: string;
  title: string;
  titleAr: string;
  subtitle: string;
  description: string;
  type: ExerciseType;
  durationMs: number;
  baseFreqOffset: number; // Semitones from user base frequency
  points: CurvePoint[];   // Relative target curve
}

export interface VocalScore {
  exerciseId: string;
  date: string;
  accuracy: number;        // Percentage 0-100
  stability: number;       // Percentage 0-100
  overallScore: number;    // Weighted combination
  averageDeviationCents: number;
  completed: boolean;
  stoppedEarly: boolean;
  durationSec: number;
  feedbackText: string;
}

export interface UserPreferences {
  baseFrequency: number;   // In Hz (default ~145 Hz for comfortable voice)
  audioFeedback: boolean;  // Play reference sound
  expertMode: boolean;     // Show Hz & cents
  micSensitivity: 'auto' | 'manual';
  dailyGoalMinutes: number;
}

export interface MicStatus {
  isAvailable: boolean;
  hasPermission: boolean;
  rms: number;
  noiseFloor: number;
  isCalibrated: boolean;
  message: string;
}
