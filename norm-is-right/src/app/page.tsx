"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EntryForm } from "@/components/EntryForm";
import { StatsDisplay } from "@/components/StatsDisplay";
import { PredictionCard } from "@/components/PredictionCard";
import { EmptyState } from "@/components/EmptyState";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { NormAvatar } from "@/components/NormAvatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prediction, Stats, ACHIEVEMENTS } from "@/types";
import {
  getPredictions,
  getStats,
  getDefaultStats,
  addPrediction,
  deletePrediction,
  saveLocalState,
  loadRemoteState,
  saveRemoteState,
} from "@/lib/storage";
import { Crown, History, Trophy, Sparkles } from "lucide-react";

export default function Home() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<Stats>(getDefaultStats());
  const [lastResult, setLastResult] = useState<"win" | "loss" | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [normMood, setNormMood] = useState<"happy" | "sad" | "neutral" | "confident">("neutral");
  const [filter, setFilter] = useState<"all" | "wins" | "losses">("all");
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  // Load data on mount
  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      const remoteState = await loadRemoteState();
      if (remoteState) {
        saveLocalState(remoteState);
      }

      if (!mounted) return;
      setPredictions(getPredictions());
      setStats(getStats());
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  // Update Norm's mood based on stats
  useEffect(() => {
    if (stats.currentStreak >= 5) {
      setNormMood("confident");
    } else if (stats.currentStreak >= 1) {
      setNormMood("happy");
    } else if (stats.normLosses > stats.normWins) {
      setNormMood("sad");
    } else {
      setNormMood("neutral");
    }
  }, [stats]);

  const handleAddPrediction = useCallback((
    claim: string,
    outcome: string,
    normWasRight: boolean,
    category?: string
  ) => {
    const { stats: newStats, newAchievements: newAchs } = addPrediction(
      claim,
      outcome,
      normWasRight,
      category
    );

    const updatedPredictions = getPredictions();
    setPredictions(updatedPredictions);
    setStats(newStats);
    setLastResult(normWasRight ? "win" : "loss");
    setShowConfetti(true);
    void saveRemoteState({ predictions: updatedPredictions, stats: newStats });
    
    if (newAchs.length > 0) {
      setNewAchievements(newAchs);
    }

    // Reset confetti after animation
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  const handleDelete = useCallback((id: string) => {
    deletePrediction(id);
    const updatedPredictions = getPredictions();
    const updatedStats = getStats();
    setPredictions(updatedPredictions);
    setStats(updatedStats);
    void saveRemoteState({ predictions: updatedPredictions, stats: updatedStats });
  }, []);

  const filteredPredictions = predictions.filter((p) => {
    if (filter === "wins") return p.normWasRight;
    if (filter === "losses") return !p.normWasRight;
    return true;
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      <ConfettiEffect trigger={showConfetti} type={lastResult || "win"} />
      
      {/* Achievement Notification */}
      <AnimatePresence>
        {newAchievements.length > 0 && (
          <motion.div
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            onClick={() => setNewAchievements([])}
          >
            {newAchievements.map((achKey) => {
              const ach = ACHIEVEMENTS[achKey as keyof typeof ACHIEVEMENTS];
              return (
                <div
                  key={achKey}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-xl shadow-xl mb-2 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{ach?.icon}</span>
                    <div>
                      <p className="font-bold">Achievement Unlocked! 🎉</p>
                      <p className="text-sm">{ach?.name}: {ach?.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-4">
            <NormAvatar mood={normMood} size="lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-2">
            Norm Is Always Right
          </h1>
          <p className="text-lg text-gray-600">
            Track the legendary predictions of Norm... or dare to doubt him? 👑
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatsDisplay stats={stats} />
        </motion.div>

        {/* Entry Form */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <EntryForm onSubmit={handleAddPrediction} />
        </motion.div>

        {/* History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-violet-600" />
            <h2 className="text-2xl font-bold text-gray-800">Prediction History</h2>
          </div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> All
              </TabsTrigger>
              <TabsTrigger value="wins" className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-green-600" /> Norm Won
              </TabsTrigger>
              <TabsTrigger value="losses" className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-red-600" /> Reality Won
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-0">
              {filteredPredictions.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-4">
                  {filteredPredictions.map((prediction, index) => (
                    <PredictionCard
                      key={prediction.id}
                      prediction={prediction}
                      onDelete={handleDelete}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Remember: Norm is always right... mostly. 🔮
          </p>
          <p className="mt-1">
            Built with 💜 for the legend himself.
          </p>
        </footer>
      </div>
    </main>
  );
}
