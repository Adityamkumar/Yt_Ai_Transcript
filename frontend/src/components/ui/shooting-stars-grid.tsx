import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';

type ShootingStarsGridSpeed = 'slow' | 'normal' | 'fast' | number;

interface ShootingStarsGridProps {
  starCount?: number;
  shootingStarCount?: number;
  gridSize?: number;
  speed?: ShootingStarsGridSpeed;
  className?: string;
}

interface StaticStar {
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
}

interface ShootingStar {
  axis: 'horizontal' | 'vertical';
  line: number;
  start: string;
  end: string;
  length: number;
  delay: number;
  duration: number;
  repeatDelay: number;
  direction: 1 | -1;
}

const speedScale = { slow: 1.25, normal: 1, fast: 0.72 } as const;

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 91.73 + salt * 37.11) * 10000;
  return value - Math.floor(value);
}

function createStaticStars(count: number): StaticStar[] {
  return Array.from({ length: count }, (_, index) => ({
    x: seeded(index, 1) * 100,
    y: seeded(index, 2) * 100,
    size: 1 + seeded(index, 3) * 2.2,
    opacity: 0.14 + seeded(index, 4) * 0.38,
    delay: seeded(index, 5) * 4,
    duration: 2.4 + seeded(index, 6) * 3.2,
  }));
}

function createShootingStars(count: number): ShootingStar[] {
  const horizontalLines = [3, 5, 7, 10, 13, 16, 19];
  const verticalLines = [2, 5, 8, 11, 15, 19, 22];

  return Array.from({ length: count }, (_, index) => {
    const axis = index % 3 === 1 ? 'vertical' : 'horizontal';
    const direction = index % 2 === 0 ? 1 : -1;
    const lines = axis === 'horizontal' ? horizontalLines : verticalLines;

    return {
      axis,
      line: lines[index % lines.length],
      start: direction === 1 ? '-18%' : '112%',
      end: direction === 1 ? '112%' : '-18%',
      length: 124 + seeded(index, 15) * 154,
      delay: seeded(index, 16) * 7 + index * 0.65,
      duration: 2.1 + seeded(index, 17) * 1.4,
      repeatDelay: 1.8 + seeded(index, 18) * 3.2,
      direction,
    };
  });
}

export function ShootingStarsGrid({
  starCount = 40,
  shootingStarCount = 7,
  gridSize = 46,
  speed = 'normal',
  className,
}: ShootingStarsGridProps) {
  const reduceMotion = useReducedMotion() === true;
  const staticStars = React.useMemo(() => createStaticStars(Math.min(Math.max(starCount, 0), 80)), [starCount]);
  const shootingStars = React.useMemo(() => createShootingStars(Math.min(Math.max(shootingStarCount, 0), 8)), [shootingStarCount]);
  const animationScale = typeof speed === 'number' ? Math.max(0.35, speed) : speedScale[speed];
  const gridStyle = {
    '--shooting-stars-grid-size': `${gridSize}px`,
  } as React.CSSProperties;

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 isolate overflow-hidden bg-[#050505]', className)}
      style={gridStyle}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#050505_0%,#0b0b0c_55%,#050505_100%)]" />
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:var(--shooting-stars-grid-size)_var(--shooting-stars-grid-size)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,5,0.28)_52%,rgba(5,5,5,0.96)_100%)]" />

      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_28%_30%,rgba(118,118,118,0.1),transparent_38%),radial-gradient(circle_at_74%_68%,rgba(88,88,88,0.09),transparent_34%)]"
        animate={reduceMotion ? undefined : { opacity: [0.72, 1, 0.78], scale: [1, 1.03, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {staticStars.map((star, index) => (
        <motion.span
          key={index}
          className={cn('absolute rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)]', index > 30 && 'max-sm:hidden')}
          style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size, opacity: star.opacity }}
          animate={reduceMotion ? undefined : { opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.55], scale: [0.85, 1.16, 0.9] }}
          transition={{ duration: star.duration, delay: star.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {shootingStars.map((star, index) => {
        const horizontal = star.axis === 'horizontal';
        const linePosition = `calc(var(--shooting-stars-grid-size) * ${star.line})`;
        const gradient = horizontal
          ? star.direction === 1 ? '90deg' : '270deg'
          : star.direction === 1 ? '180deg' : '0deg';

        return (
          <motion.span
            key={index}
            className={cn('absolute rounded-full', index > 3 && 'max-sm:hidden')}
            style={{
              left: horizontal ? star.start : linePosition,
              top: horizontal ? linePosition : star.start,
              width: horizontal ? star.length : 1,
              height: horizontal ? 1 : star.length,
              background: `linear-gradient(${gradient}, transparent 0%, rgba(131,164,255,0.18) 18%, rgba(164,191,255,0.96) 52%, rgba(255,255,255,0.98) 58%, transparent 100%)`,
              boxShadow: '0 0 18px rgba(128,162,255,0.72), 0 0 34px rgba(170,184,255,0.28)',
            }}
            initial={false}
            animate={reduceMotion ? { opacity: 0.45 } : {
              left: horizontal ? [star.start, star.end] : linePosition,
              top: horizontal ? linePosition : [star.start, star.end],
              opacity: [0, 1, 1, 0],
              scaleX: horizontal ? [0.35, 1, 1.08, 0.8] : 1,
              scaleY: horizontal ? 1 : [0.35, 1, 1.08, 0.8],
            }}
            transition={{
              duration: star.duration * animationScale,
              delay: star.delay,
              repeat: Infinity,
              repeatDelay: star.repeatDelay * animationScale,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}
