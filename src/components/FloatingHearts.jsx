import { useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkle, Star } from "./icons";

const colors = [
  "text-pink-500/50",
  "text-rose-500/40",
  "text-pink-400/50",
  "text-rose-400/40",
  "text-pink-600/30",
];

const shapes = [Heart, Star, Sparkle, Heart, Sparkle, Star];

export default function FloatingHearts() {
  const items = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 7 + Math.random() * 18,
        duration: 15 + Math.random() * 15,
        delay: Math.random() * 16,
        drift: -30 + Math.random() * 60,
        color: colors[i % colors.length],
        opacity: 0.18 + Math.random() * 0.32,
        Shape: shapes[i % shapes.length],
      })),
    []
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {items.map((item) => {
        const Shape = item.Shape;

        return (
          <motion.div
            key={item.id}
            className={`absolute ${item.color}`}
            style={{
              left: `${item.left}%`,
              width: item.size,
              height: item.size,
              opacity: item.opacity,
            }}
            initial={{ y: "110vh", x: 0, rotate: -12 }}
            animate={{ y: "-15vh", x: item.drift, rotate: 14 }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Shape className="h-full w-full" />
          </motion.div>
        );
      })}
    </div>
  );
}
