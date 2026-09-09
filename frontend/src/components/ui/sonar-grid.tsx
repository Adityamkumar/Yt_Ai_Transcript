import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SonarGridProps extends React.ComponentPropsWithRef<'div'> {
  spacing?: number;
  dotRadius?: number;
  baseOpacity?: number;
  color?: string;
  pingEvery?: number;
  speed?: number;
  ringWidth?: number;
  amplitude?: number;
  interactive?: boolean;
  maxRings?: number;
  seedPing?: boolean;
  pingArea?: [number, number, number, number];
}

interface Ring { x: number; y: number; born: number; }

const MAX_DPR = 2;
const TAU = Math.PI * 2;

/** A responsive, motion-aware dot field with expanding sonar pings. */
export const SonarGrid = React.forwardRef<HTMLDivElement, SonarGridProps>(function SonarGrid(
  {
    spacing = 26,
    dotRadius = 1.4,
    baseOpacity = 0.28,
    color,
    pingEvery = 2.4,
    speed = 260,
    ringWidth = 90,
    amplitude = 2.2,
    interactive = true,
    maxRings = 6,
    seedPing = true,
    pingArea = [0.15, 0.2, 0.85, 0.8],
    className,
    children,
    ...rest
  },
  forwardedRef,
) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const ringsRef = React.useRef<Ring[]>([]);
  const refreshRef = React.useRef<() => void>(() => {});
  const optionsRef = React.useRef({ spacing, dotRadius, baseOpacity, pingEvery, speed, ringWidth, amplitude, interactive, maxRings, seedPing, pingArea });
  optionsRef.current = { spacing, dotRadius, baseOpacity, pingEvery, speed, ringWidth, amplitude, interactive, maxRings, seedPing, pingArea };

  const setHost = React.useCallback((node: HTMLDivElement | null) => {
    hostRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 1;
    let height = 1;
    let animationFrame = 0;
    let timer = 0;
    let visible = true;
    let seeded = false;
    let stroke = '';
    let nextPing = performance.now() + optionsRef.current.pingEvery * 1000;

    const readColor = () => { stroke = getComputedStyle(canvas).color; };
    const addRing = (x: number, y: number, born: number) => {
      readColor();
      const rings = ringsRef.current;
      rings.push({ x, y, born });
      while (rings.length > optionsRef.current.maxRings) rings.shift();
    };

    const draw = (now: number) => {
      const o = optionsRef.current;
      const lifetime = (Math.hypot(width, height) + o.ringWidth) / o.speed;
      ringsRef.current = ringsRef.current.filter((ring) => (now - ring.born) / 1000 < lifetime);
      const live = ringsRef.current.map((ring) => {
        const age = (now - ring.born) / 1000;
        const radius = age * o.speed;
        return { ...ring, radius, reach: radius + o.ringWidth, fade: 1 - age / lifetime };
      });
      context.clearRect(0, 0, width, height);
      context.fillStyle = stroke;
      // Keep the outer dots inside the canvas. Using an extra column placed dots
      // just beyond both edges, which made the right-most dots look clipped.
      const cols = Math.max(1, Math.floor(width / o.spacing));
      const rows = Math.max(1, Math.floor(height / o.spacing));
      const offsetX = (width - (cols - 1) * o.spacing) / 2;
      const offsetY = (height - (rows - 1) * o.spacing) / 2;
      const hot: number[] = [];
      context.globalAlpha = o.baseOpacity;
      context.beginPath();
      for (let column = 0; column < cols; column += 1) {
        const x = offsetX + column * o.spacing;
        for (let row = 0; row < rows; row += 1) {
          const y = offsetY + row * o.spacing;
          let energy = 0;
          for (const ring of live) {
            if (Math.abs(x - ring.x) > ring.reach || Math.abs(y - ring.y) > ring.reach) continue;
            const distance = Math.abs(Math.hypot(x - ring.x, y - ring.y) - ring.radius);
            if (distance >= o.ringWidth) continue;
            const t = 1 - distance / o.ringWidth;
            energy = Math.max(energy, t * t * (3 - 2 * t) * ring.fade);
          }
          if (energy < 0.01) {
            context.moveTo(x + o.dotRadius, y);
            context.arc(x, y, o.dotRadius, 0, TAU);
          } else hot.push(x, y, energy);
        }
      }
      context.fill();
      for (let index = 0; index < hot.length; index += 3) {
        const energy = hot[index + 2] ?? 0;
        context.globalAlpha = o.baseOpacity + (1 - o.baseOpacity) * energy;
        context.beginPath();
        context.arc(hot[index] ?? 0, hot[index + 1] ?? 0, o.dotRadius * (1 + o.amplitude * energy), 0, TAU);
        context.fill();
      }
      context.globalAlpha = 1;
    };

    const tick = (now: number) => {
      animationFrame = 0;
      if (!visible || document.hidden) return;
      if (reducedMotion.matches) { ringsRef.current = []; draw(now); return; }
      const o = optionsRef.current;
      if (o.pingEvery > 0 && now >= nextPing) {
        const [x0, y0, x1, y1] = o.pingArea;
        addRing(width * (x0 + Math.random() * (x1 - x0)), height * (y0 + Math.random() * (y1 - y0)), now);
        nextPing = now + o.pingEvery * 1000;
      }
      draw(now);
      if (ringsRef.current.length > 0) animationFrame = requestAnimationFrame(tick);
      else if (o.pingEvery > 0) timer = window.setTimeout(() => tick(performance.now()), Math.max(16, nextPing - now));
    };
    const wake = () => {
      if (!animationFrame) { window.clearTimeout(timer); animationFrame = requestAnimationFrame(tick); }
    };
    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!seeded) {
        seeded = true;
        const [x0, y0, x1, y1] = optionsRef.current.pingArea;
        if (optionsRef.current.seedPing && !reducedMotion.matches) addRing(width * (x0 + (x1 - x0) * 0.68), height * (y0 + (y1 - y0) * 0.34), performance.now() - 500);
      }
      draw(performance.now());
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!optionsRef.current.interactive || reducedMotion.matches) return;
      const rect = host.getBoundingClientRect();
      addRing(event.clientX - rect.left, event.clientY - rect.top, performance.now());
      wake();
    };
    const onVisibilityChange = () => { if (!document.hidden) wake(); };
    refreshRef.current = () => { readColor(); nextPing = Math.min(nextPing, performance.now() + optionsRef.current.pingEvery * 1000); wake(); };
    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => { visible = entry?.isIntersecting ?? true; if (visible) wake(); });
    const mutationObserver = new MutationObserver(() => refreshRef.current());
    readColor();
    resize();
    resizeObserver.observe(host);
    intersectionObserver.observe(host);
    mutationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] });
    host.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.addEventListener('change', wake);
    wake();
    return () => {
      resizeObserver.disconnect(); intersectionObserver.disconnect(); mutationObserver.disconnect();
      host.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotion.removeEventListener('change', wake);
      cancelAnimationFrame(animationFrame); window.clearTimeout(timer); refreshRef.current = () => {};
    };
  }, []);

  React.useEffect(() => { refreshRef.current(); }, [spacing, dotRadius, baseOpacity, color, pingEvery, speed, ringWidth, amplitude, interactive, maxRings, pingArea]);

  return (
    <div ref={setHost} data-slot="sonar-grid" className={cn('relative isolate overflow-hidden', className)} {...rest}>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 size-full" style={{ color: color ?? 'var(--text-primary)' }} />
      {children}
    </div>
  );
});

SonarGrid.displayName = 'SonarGrid';
