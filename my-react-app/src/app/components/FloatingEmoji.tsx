import { motion } from 'motion/react';

interface FloatingEmojiProps {
  emoji: string;
  delay?: number;
}

export function FloatingEmoji({ emoji, delay = 0 }: FloatingEmojiProps) {
  return (
    <motion.div
      className="absolute text-4xl"
      initial={{ y: 0, opacity: 0, rotate: 0 }}
      animate={{
        y: [-20, -40, -20],
        opacity: [0, 1, 0],
        rotate: [-10, 10, -10],
        x: [0, 10, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      {emoji}
    </motion.div>
  );
}
