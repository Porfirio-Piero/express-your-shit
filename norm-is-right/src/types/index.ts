export interface Prediction {
  id: string;
  claim: string;
  outcome: string;
  normWasRight: boolean;
  createdAt: string;
  category?: string;
}

export interface Stats {
  totalPredictions: number;
  normWins: number;
  normLosses: number;
  currentStreak: number;
  longestStreak: number;
  achievements: string[];
}

export const ACHIEVEMENTS = {
  NORM_FAN_3: { id: "norm-fan-3", name: "Norm's #1 Fan", description: "3 wins in a row!", icon: "👑" },
  NORM_FAN_5: { id: "norm-fan-5", name: "Norm Devotee", description: "5 wins in a row!", icon: "👑👑" },
  NORM_FAN_10: { id: "norm-fan-10", name: "Norm Apostle", description: "10 wins in a row!", icon: "👑👑👑" },
  NORM_FAN_25: { id: "norm-fan-25", name: "Norm Prophet", description: "25 wins in a row!", icon: "🔮" },
  NEMESIS: { id: "nemesis", name: "Norm's Nemesis", description: "Marked Norm wrong 5+ times", icon: "😈" },
  FORTUNE_TELLER: { id: "fortune-teller", name: "Fortune Teller", description: "10+ predictions tracked", icon: "🔮" },
  SKEPTIC: { id: "skeptic", name: "The Skeptic", description: "Marked Norm wrong 5+ times", icon: "🤨" },
  TRUE_BELIEVER: { id: "true-believer", name: "True Believer", description: "90%+ win rate for Norm", icon: "⭐" },
  REALITY_CHECKER: { id: "reality-checker", name: "Reality Checker", description: "20+ predictions tracked", icon: "📊" },
  DOUBTER: { id: "doubter", name: "The Doubter", description: "First time marking Norm wrong", icon: "😢" },
} as const;

export type AchievementKey = keyof typeof ACHIEVEMENTS;

export const NORM_QUOTES = [
  "Norm hasn't made any predictions yet. He's probably napping. 💤",
  "The crystal ball is dusty... Norm needs to make some predictions! 🔮",
  "Silence... Norm is contemplating the universe. Or lunch. 🍕",
  "No predictions yet. Norm's wisdom is brewing... ☕",
  "The oracle awaits... What will Norm predict? 🔮",
  "Empty like Norm's coffee cup. Time for more predictions! ☕",
  "Norm is resting his prophetic voice. Check back soon! 🎭",
  "The prediction board is clear. Norm is plotting... 🎯",
];

export const CATEGORIES = [
  { value: "sports", label: "Sports", emoji: "🏆" },
  { value: "weather", label: "Weather", emoji: "🌤️" },
  { value: "life", label: "Life", emoji: "🌱" },
  { value: "politics", label: "Politics", emoji: "🏛️" },
  { value: "tech", label: "Tech", emoji: "💻" },
  { value: "pop", label: "Pop Culture", emoji: "🎬" },
  { value: "other", label: "Other", emoji: "🎲" },
];
