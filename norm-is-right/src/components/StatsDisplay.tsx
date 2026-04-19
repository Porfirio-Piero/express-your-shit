"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Stats } from "@/types";
import { ACHIEVEMENTS } from "@/types";
import { Trophy, Target, Flame, Sparkles } from "lucide-react";

interface StatsDisplayProps {
  stats: Stats;
}

// Crystal Ball Heat Levels based on current streak
const HEAT_LEVELS = [
  { min: 0, max: 1, label: "Chilly", color: "from-blue-400 to-cyan-400", emoji: "❄️", desc: "The ball is cold..." },
  { min: 2, max: 3, label: "Heating Up", color: "from-yellow-400 to-amber-400", emoji: "🌤️", desc: "Warmth building..." },
  { min: 4, max: 5, label: "On Fire!", color: "from-orange-500 to-red-500", emoji: "🔥", desc: "The crystal glows!" },
  { min: 6, max: Infinity, label: "Legendary!", color: "from-purple-500 to-pink-500", emoji: "🔮✨", desc: "MAXIMUM POWER!" },
];

function CrystalBallHeat({ streak }: { streak: number }) {
  const level = HEAT_LEVELS.find(l => streak >= l.min && streak <= l.max) || HEAT_LEVELS[0];
  const heatPercent = Math.min((streak / 10) * 100, 100);
  
  return (
    <div className="space-y-3">
      {/* Heat Label */}
      <div className="flex items-center justify-between">
        <motion.div 
          className={`text-xl font-bold bg-gradient-to-r ${level.color} bg-clip-text text-transparent`}
          key={level.label}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {level.label}
        </motion.div>
        <motion.span 
          className="text-2xl"
          key={level.emoji}
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {level.emoji}
        </motion.span>
      </div>
      
      {/* Heat Bar */}
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${level.color}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(heatPercent, 10)}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
        {/* Glow effect for high streaks */}
        {streak >= 4 && (
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-white/30"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: `${Math.max(heatPercent, 10)}%`, opacity: [0.3, 0.6, 0.3] }}
            transition={{ 
              width: { type: "spring", stiffness: 100 },
              opacity: { repeat: Infinity, duration: 1.5 }
            }}
          />
        )}
      </div>
      
      {/* Description */}
      <p className="text-xs text-muted-foreground text-center">
        {level.desc}
      </p>
      
      {/* Streak indicator */}
      <div className="flex justify-center gap-1">
        {Array.from({ length: Math.min(streak, 10) }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 rounded-full bg-gradient-to-r ${level.color}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
          />
        ))}
        {streak === 0 && (
          <span className="text-xs text-gray-400">Start a streak to heat up!</span>
        )}
      </div>
    </div>
  );
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  const winRate = stats.totalPredictions > 0 
    ? Math.round((stats.normWins / stats.totalPredictions) * 100) 
    : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Win Rate Card */}
      <Card className="border-violet-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-500" />
            Norm&apos;s Win Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="text-3xl font-bold text-gradient"
            key={winRate}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {winRate}%
          </motion.div>
          <Progress value={winRate} max={100} className="mt-2 h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.normWins} wins / {stats.totalPredictions} total
          </p>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card className="border-violet-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="text-3xl font-bold text-orange-600"
            key={stats.currentStreak}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {stats.currentStreak}
            <span className="text-lg ml-1">{stats.currentStreak > 0 ? "🔥" : ""}</span>
          </motion.div>
          <p className="text-xs text-muted-foreground mt-2">
            Longest: {stats.longestStreak}
          </p>
        </CardContent>
      </Card>

      {/* Crystal Ball Confidence */}
      <Card className="border-violet-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Crystal Ball Confidence
          </CardTitle>        
        </CardHeader>
        <CardContent>
          <CrystalBallHeat streak={stats.currentStreak} />
        </CardContent>
      </Card>

      {/* Achievements */}
      {stats.achievements.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4 border-violet-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Achievements Unlocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.achievements.map((achievementKey) => {
                const achievement = ACHIEVEMENTS[achievementKey as keyof typeof ACHIEVEMENTS];
                if (!achievement) return null;
                return (
                  <motion.div
                    key={achievementKey}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Badge 
                      className="px-3 py-1 text-sm cursor-default bg-violet-500 text-white hover:bg-violet-600"
                    >
                      <span className="mr-1">{achievement.icon}</span>
                      {achievement.name}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
