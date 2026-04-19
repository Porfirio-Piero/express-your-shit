"use client";

import { motion } from "framer-motion";

interface NormAvatarProps {
  mood?: "happy" | "sad" | "neutral" | "confident";
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

const fontSizes = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-5xl",
};

export function NormAvatar({ mood = "neutral", size = "md" }: NormAvatarProps) {
  const getFace = () => {
    switch (mood) {
      case "happy":
        return "😄";
      case "sad":
        return "😢";
      case "confident":
        return "😎";
      default:
        return "🤔";
    }
  };

  const getGlow = () => {
    switch (mood) {
      case "happy":
        return "shadow-lg shadow-green-400/50";
      case "sad":
        return "shadow-lg shadow-blue-400/50";
      case "confident":
        return "shadow-lg shadow-violet-400/50";
      default:
        return "shadow-lg shadow-violet-400/30";
    }
  };

  return (
    <motion.div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center ${getGlow()} border-4 border-white`}
      animate={{
        scale: mood === "happy" ? [1, 1.1, 1] : 1,
        rotate: mood === "confident" ? [0, 5, -5, 0] : 0,
      }}
      transition={{
        duration: 0.5,
        repeat: mood === "happy" ? Infinity : 0,
        repeatDelay: 2,
      }}
    >
      <span className={fontSizes[size]}>{getFace()}</span>
    </motion.div>
  );
}
