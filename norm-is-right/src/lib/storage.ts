import { Prediction, Stats, AchievementKey } from "@/types";
const STATE_API_PATH = "/api/state";

const PREDICTIONS_KEY = "norm-predictions";
const STATS_KEY = "norm-stats";

export interface PersistedState {
  predictions: Prediction[];
  stats: Stats;
}

export function getDefaultStats(): Stats {
  return {
    totalPredictions: 0,
    normWins: 0,
    normLosses: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievements: [],
  };
}

export function getPredictions(): Prediction[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(PREDICTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function savePredictions(predictions: Prediction[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREDICTIONS_KEY, JSON.stringify(predictions));
}

export function getStats(): Stats {
  if (typeof window === "undefined") return getDefaultStats();
  const stored = localStorage.getItem(STATS_KEY);
  return stored ? JSON.parse(stored) : getDefaultStats();
}

export function saveStats(stats: Stats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function addPrediction(
  claim: string,
  outcome: string,
  normWasRight: boolean,
  category?: string
): { prediction: Prediction; stats: Stats; newAchievements: string[] } {
  const predictions = getPredictions();
  const stats = getStats();

  const prediction: Prediction = {
    id: crypto.randomUUID(),
    claim,
    outcome,
    normWasRight,
    createdAt: new Date().toISOString(),
    category,
  };

  predictions.unshift(prediction);
  savePredictions(predictions);

  // Update stats
  stats.totalPredictions++;
  if (normWasRight) {
    stats.normWins++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
  } else {
    stats.normLosses++;
    stats.currentStreak = 0;
  }

  // Check for new achievements
  const newAchievements: string[] = [];
  const checkAchievement = (key: AchievementKey) => {
    if (!stats.achievements.includes(key)) {
      stats.achievements.push(key);
      newAchievements.push(key);
    }
  };

  // Streak achievements
  if (stats.currentStreak >= 3) checkAchievement("NORM_FAN_3");
  if (stats.currentStreak >= 5) checkAchievement("NORM_FAN_5");
  if (stats.currentStreak >= 10) checkAchievement("NORM_FAN_10");
  if (stats.currentStreak >= 25) checkAchievement("NORM_FAN_25");

  // Count achievements
  if (stats.totalPredictions >= 10) checkAchievement("FORTUNE_TELLER");
  if (stats.totalPredictions >= 20) checkAchievement("REALITY_CHECKER");
  if (stats.normLosses >= 1) checkAchievement("DOUBTER");
  if (stats.normLosses >= 5) {
    checkAchievement("SKEPTIC");
    checkAchievement("NEMESIS");
  }

  // Win rate achievement
  if (stats.totalPredictions >= 10) {
    const winRate = stats.normWins / stats.totalPredictions;
    if (winRate >= 0.9) checkAchievement("TRUE_BELIEVER");
  }

  saveStats(stats);

  return { prediction, stats, newAchievements };
}

export function getCurrentState(): PersistedState {
  return {
    predictions: getPredictions(),
    stats: getStats(),
  };
}

export function saveLocalState(state: PersistedState): void {
  savePredictions(state.predictions);
  saveStats(state.stats);
}

export async function loadRemoteState(): Promise<PersistedState | null> {
  try {
    const response = await fetch(STATE_API_PATH, { method: "GET" });
    if (!response.ok) return null;
    const state = (await response.json()) as PersistedState;
    if (!Array.isArray(state?.predictions) || !state?.stats) return null;
    return state;
  } catch (err) {
    console.error("Failed to load remote state:", err);
    return null;
  }
}

export async function saveRemoteState(state: PersistedState): Promise<boolean> {
  try {
    const response = await fetch(STATE_API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    return response.ok;
  } catch (err) {
    console.error("Failed to save remote state:", err);
    return false;
  }
}

export function deletePrediction(id: string): void {
  const predictions = getPredictions();
  const filtered = predictions.filter((p) => p.id !== id);
  savePredictions(filtered);
  // Note: Stats are not recalculated to preserve history
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PREDICTIONS_KEY);
  localStorage.removeItem(STATS_KEY);
}
