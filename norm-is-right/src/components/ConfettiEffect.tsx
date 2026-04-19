"use client";

import { useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  trigger: boolean;
  type?: "win" | "loss";
}

export function ConfettiEffect({ trigger, type = "win" }: ConfettiEffectProps) {
  const fireConfetti = useCallback(() => {
    if (type === "win") {
      // Golden confetti for Norm wins
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ["#FFD700", "#FFA500", "#FF6B6B", "#9B59B6"];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } else {
      // Sad confetti (blue/gray) for Norm losses
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6B7280", "#9CA3AF", "#60A5FA", "#3B82F6"],
        gravity: 1.5,
        drift: 0,
      });
    }
  }, [type]);

  useEffect(() => {
    if (trigger) {
      fireConfetti();
    }
  }, [trigger, fireConfetti]);

  return null;
}
