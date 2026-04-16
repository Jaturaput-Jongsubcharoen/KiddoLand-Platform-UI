import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import confetti from 'canvas-confetti';

interface CelebrationEffectProps {
  /** Trigger level: 'high' (3 stars) or 'mid' (2 stars). */
  level: 'high' | 'mid';
}

/* ── Sparkle dots that float upward ───────────────────────────────────────── */
interface SparkleConfig {
  id: number;
  x: string;
  delay: string;
  duration: string;
  size: number;
  color: string;
}

const SPARKLE_COLORS = [
  '#F7C948', '#FF6B35', '#A855F7', '#22C55E', '#3B82F6', '#F43F5E',
];

function makeSparkles(count: number): SparkleConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: `${Math.random() * 100}%`,
    delay: `${(Math.random() * 1.2).toFixed(2)}s`,
    duration: `${(1.8 + Math.random() * 1.4).toFixed(2)}s`,
    size: Math.floor(6 + Math.random() * 10),
    color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
  }));
}

/* ── Confetti helpers ─────────────────────────────────────────────────────── */
function fireConfettiBurst(canvas: HTMLCanvasElement) {
  const fire = confetti.create(canvas, { resize: true, useWorker: false });

  const shared = {
    particleCount: 60,
    spread: 70,
    startVelocity: 40,
    ticks: 160,
    colors: ['#F7C948', '#FF6B35', '#A855F7', '#22C55E', '#3B82F6', '#F43F5E'],
    gravity: 0.9,
    scalar: 1.1,
  };

  fire({ ...shared, origin: { x: 0.25, y: 0.55 }, angle: 60 });
  fire({ ...shared, origin: { x: 0.75, y: 0.55 }, angle: 120 });

  setTimeout(() => {
    fire({ ...shared, particleCount: 30, origin: { x: 0.5, y: 0.6 }, angle: 90 });
  }, 350);
}

function fireMidConfetti(canvas: HTMLCanvasElement) {
  const fire = confetti.create(canvas, { resize: true, useWorker: false });
  fire({
    particleCount: 35,
    spread: 55,
    startVelocity: 30,
    ticks: 120,
    colors: ['#F7C948', '#3B82F6', '#22C55E'],
    origin: { x: 0.5, y: 0.6 },
    gravity: 1,
    scalar: 0.9,
  });
}

/* ── Component ────────────────────────────────────────────────────────────── */
const CelebrationEffect: React.FC<CelebrationEffectProps> = ({ level }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparkles = useRef<SparkleConfig[]>(
    makeSparkles(level === 'high' ? 18 : 10),
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const t = setTimeout(() => {
      if (!canvasRef.current) return;
      if (level === 'high') {
        fireConfettiBurst(canvasRef.current);
      } else {
        fireMidConfetti(canvasRef.current);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [level]);

  return (
    /* Full-size overlay — pointer-events off so clicks pass through */
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        borderRadius: 'inherit',
      }}
    >
      {/* confetti canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      {/* floating sparkle dots */}
      {sparkles.current.map((sp) => (
        <Box
          key={sp.id}
          sx={{
            position: 'absolute',
            bottom: '-10%',
            left: sp.x,
            width: sp.size,
            height: sp.size,
            borderRadius: '50%',
            bgcolor: sp.color,
            opacity: 0,
            animation: `sparkleFloat ${sp.duration} ${sp.delay} ease-out forwards`,
            '@keyframes sparkleFloat': {
              '0%': { opacity: 0.9, transform: 'translateY(0) scale(1)' },
              '80%': { opacity: 0.6, transform: 'translateY(-220px) scale(0.7)' },
              '100%': { opacity: 0, transform: 'translateY(-280px) scale(0.3)' },
            },
          }}
        />
      ))}
    </Box>
  );
};

export default CelebrationEffect;
