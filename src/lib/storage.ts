import { VocalScore, UserPreferences } from '@/types/audio';

const STORAGE_KEYS = {
  PREFERENCES: 'mizan_preferences',
  SCORES: 'mizan_scores',
  STREAK: 'mizan_streak',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  baseFrequency: 145, // Neutral comfortable frequency in Hz
  audioFeedback: true,
  expertMode: false,
  micSensitivity: 'auto',
  dailyGoalMinutes: 12,
};

export class LocalStorageManager {
  public static getPreferences(): UserPreferences {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  public static savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    return updated;
  }

  public static getScores(): VocalScore[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCORES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveScore(score: VocalScore): void {
    if (typeof window === 'undefined') return;
    try {
      const list = this.getScores();
      list.unshift(score);
      // Keep last 100 sessions to avoid localStorage overflow
      if (list.length > 100) list.pop();
      localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save score locally', e);
    }
  }

  /**
   * Export all data as JSON file for offline backup (CDC Section 5)
   */
  public static exportDataAsJSON(): void {
    if (typeof window === 'undefined') return;
    const payload = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      preferences: this.getPreferences(),
      scores: this.getScores(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mizan_al_sawt_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import data from JSON file
   */
  public static importDataFromJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        if (parsed.preferences) {
          localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(parsed.preferences));
        }
        if (Array.isArray(parsed.scores)) {
          localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(parsed.scores));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public static clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    localStorage.removeItem(STORAGE_KEYS.SCORES);
  }
}
