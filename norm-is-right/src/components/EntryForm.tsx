"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/types";
import { Crown, Frown, Sparkles } from "lucide-react";

interface EntryFormProps {
  onSubmit: (claim: string, outcome: string, normWasRight: boolean, category?: string) => void;
}

export function EntryForm({ onSubmit }: EntryFormProps) {
  const [claim, setClaim] = useState("");
  const [outcome, setOutcome] = useState("");
  const [category, setCategory] = useState("");
  const [normWasRight, setNormWasRight] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim.trim() || !outcome.trim() || normWasRight === null) return;

    setIsSubmitting(true);
    
    // Simulate satisfying animation delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    onSubmit(claim.trim(), outcome.trim(), normWasRight, category || undefined);
    
    // Reset form
    setClaim("");
    setOutcome("");
    setCategory("");
    setNormWasRight(null);
    setIsSubmitting(false);
  };

  return (
    <Card className="border-2 border-violet-200 shadow-xl shadow-violet-100">
      <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="w-5 h-5" />
          Track Norm&apos;s Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-violet-700 flex items-center gap-2">
              <span className="text-lg">🔮</span>
              What did Norm claim?
            </label>
            <Textarea
              placeholder="Norm said that..."
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              className="min-h-[80px] border-violet-200 focus:border-violet-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-violet-700 flex items-center gap-2">
              <span className="text-lg">🌍</span>
              What was the outcome?
            </label>
            <Textarea
              placeholder="Reality said that..."
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="min-h-[80px] border-violet-200 focus:border-violet-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-violet-700 flex items-center gap-2">
              <span className="text-lg">🏷️</span>
              Category (optional)
            </label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border-violet-200"
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-violet-700 flex items-center gap-2">
              <span className="text-lg">⚖️</span>
              The Verdict
            </label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                onClick={() => setNormWasRight(true)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  normWasRight === true
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Crown className={`w-8 h-8 ${
                  normWasRight === true ? "text-green-600" : "text-gray-400"
                }`} />
                <span className={`font-semibold ${
                  normWasRight === true ? "text-green-700" : "text-gray-600"
                }`}>
                  Norm was RIGHT! 👑
                </span>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setNormWasRight(false)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  normWasRight === false
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-red-300"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Frown className={`w-8 h-8 ${
                  normWasRight === false ? "text-red-600" : "text-gray-400"
                }`} />
                <span className={`font-semibold ${
                  normWasRight === false ? "text-red-700" : "text-gray-600"
                }`}>
                  Norm was wrong... 😢
                </span>
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {normWasRight !== null && claim && outcome && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Button
                  type="submit"
                  className={`w-full h-14 text-lg font-bold ${
                    normWasRight
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Record the Verdict!
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </CardContent>
    </Card>
  );
}
