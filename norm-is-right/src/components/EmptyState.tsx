"use client";

import { motion } from "framer-motion";
import { NORM_QUOTES } from "@/types";
import { NormAvatar } from "./NormAvatar";

export function EmptyState() {
  const randomQuote = NORM_QUOTES[Math.floor(Math.random() * NORM_QUOTES.length)];

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <NormAvatar mood="neutral" size="lg" />
      
      <motion.p
        className="mt-6 text-lg text-gray-600 max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {randomQuote}
      </motion.p>
      
      <motion.div
        className="mt-4 text-sm text-violet-500 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Add a prediction above to get started! ✨
      </motion.div>
    </motion.div>
  );
}
