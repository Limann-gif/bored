import { motion } from 'motion/react';

export function AnimatedBackground() {
  const circles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 400 + 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50" />
      
      {circles.map((circle) => (
        <motion.div
          key={circle.id}
          className="absolute rounded-full mix-blend-multiply filter blur-xl opacity-30"
          style={{
            width: circle.size,
            height: circle.size,
            left: `${circle.x}%`,
            top: `${circle.y}%`,
            background: circle.id % 3 === 0 
              ? 'linear-gradient(135deg, #9333ea, #ec4899)' 
              : circle.id % 3 === 1
              ? 'linear-gradient(135deg, #ec4899, #f59e0b)'
              : 'linear-gradient(135deg, #f59e0b, #10b981)',
          }}
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: circle.duration,
            repeat: Infinity,
            delay: circle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
