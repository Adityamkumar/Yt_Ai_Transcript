import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  Youtube,
  FileText,
  ChevronRight,
  Play,
  ArrowUpRight,
  Zap,
  Bot
} from 'lucide-react';

export interface BentoCardProps {
  color?: string;
  title?: string;
  description?: string;
  label?: string;
  textAutoHide?: boolean;
  disableAnimations?: boolean;
}

export interface BentoProps {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '139, 156, 247'; // Harmonic Indigo-Purple: rgb(139, 156, 247)
const MOBILE_BREAKPOINT = 768;

const cardData: BentoCardProps[] = [
  {
    color: '#0d0f14',
    title: 'YouTube Ingest',
    description: 'Paste URL to segment transcripts.',
    label: 'Ingestion'
  },
  {
    color: '#0d0f14',
    title: 'Speech Mapping',
    description: 'Clickable speech timeline jumps.',
    label: 'Navigation'
  },
  {
    color: '#0d0f14',
    title: 'Immersive 3-Panel Workspace',
    description: 'Simultaneous video, chatbot and citation panels.',
    label: 'Interface'
  },
  {
    color: '#0d0f14',
    title: 'PDF Decoupling',
    description: 'Extract and isolate vectors on upload.',
    label: 'Performance'
  },
  {
    color: '#0d0f14',
    title: 'Low Latency RAG',
    description: 'General queries run under 80ms.',
    label: 'Database'
  },
  {
    color: '#0d0f14',
    title: 'Smart Citations',
    description: 'Hallucination-free evidence badges.',
    label: 'Accuracy'
  }
];

const createParticleElement = (x: number, y: number, color: string = DEFAULT_GLOW_COLOR): HTMLDivElement => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card: HTMLElement, mouseX: number, mouseY: number, glow: number, radius: number) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

const ParticleCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}> = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLDivElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        }
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true) as HTMLDivElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        {
          scale: 0,
          opacity: 1
        },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove()
        }
      );
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <div
      ref={cardRef}
      className={`${className} relative overflow-hidden`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
    >
      {children}
    </div>
  );
};

const GlobalSpotlight: React.FC<{
  gridRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}> = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR
}) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const isInsideSection = useRef(false);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.12) 0%,
        rgba(${glowColor}, 0.06) 15%,
        rgba(${glowColor}, 0.03) 25%,
        rgba(${glowColor}, 0.015) 40%,
        rgba(${glowColor}, 0.005) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current.closest('.bento-section');
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

      isInsideSection.current = mouseInside || false;
      const cards = gridRef.current.querySelectorAll('.card');

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
        cards.forEach(card => {
          (card as HTMLElement).style.setProperty('--glow-intensity', '0');
        });
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach(card => {
        const cardElement = card as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: 'power2.out'
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      isInsideSection.current = false;
      gridRef.current?.querySelectorAll('.card').forEach(card => {
        (card as HTMLElement).style.setProperty('--glow-intensity', '0');
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

const BentoCardGrid: React.FC<{
  children: React.ReactNode;
  gridRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ children, gridRef }) => (
  <div
    className="bento-section grid gap-2 p-1 max-w-[72rem] mx-auto select-none relative"
    ref={gridRef}
  >
    {children}
  </div>
);

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Sub-render function for Card interactive graphics
const renderCardGraphics = (index: number) => {
  switch (index) {
    case 0: // YouTube Ingest
      return (
        <div className="mt-4 space-y-3 font-mono text-[10.5px] w-full text-left">
          <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-lg p-2.5">
            <Youtube size={12} className="text-red-400 flex-shrink-0" />
            <span className="text-[var(--text-secondary)] truncate flex-1 select-none">
              youtube.com/watch?v=RAG_101...
            </span>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider scale-95 flex-shrink-0">
              Parsed
            </span>
          </div>
          <div className="bg-black/30 border border-white/[0.04] rounded-lg p-3 space-y-1.5 text-[var(--text-muted)]">
            <p className="text-white/60 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Vectorizing Speech...
            </p>
            <p className="pl-3.5 text-[9.5px]">Segments generated: 28 chunks</p>
          </div>
        </div>
      );

    case 1: // Speech Mapping / Navigation
      return (
        <div className="mt-4 space-y-2.5 text-left font-sans text-xs w-full flex-1 flex flex-col justify-end">
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5">
            <span className="font-mono text-[9px] text-[var(--accent)] bg-[var(--accent-subtle)] px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 font-bold">
              04:12
            </span>
            <p className="text-[10.5px] text-[var(--text-secondary)] leading-relaxed">
              "...by partitioning tables horizontally, we reduce latencies..."
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent)]/15 flex items-start gap-2.5 shadow-[0_0_15px_rgba(139,156,247,0.1)]">
            <span className="font-mono text-[9px] text-white bg-[var(--accent)] px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 font-bold">
              05:35
            </span>
            <p className="text-[10.5px] text-white font-medium leading-relaxed">
              "This acts as a decoupled database collections layer..."
            </p>
          </div>
        </div>
      );

    case 2: // Immersive 3-Panel Workspace [Spans 2x2]
      return (
        <div className="mt-5 border border-white/[0.07] bg-black/40 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col min-h-[160px] lg:min-h-[220px] w-full text-left font-sans relative">
          {/* Mock window header */}
          <div className="px-3.5 py-2 border-b border-white/[0.05] bg-white/[0.015] flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-[8.5px] font-mono text-[var(--text-muted)] tracking-wider">
              echomind.ai/workspace/decoupled_specs
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          {/* 3 panels split */}
          <div className="grid grid-cols-[85px_1fr_95px] flex-1 min-h-0 text-[9px] text-[var(--text-secondary)]">
            {/* Left Panel */}
            <div className="border-r border-white/[0.04] bg-white/[0.005] p-2 space-y-1.5 font-mono">
              <span className="text-[7px] text-[var(--text-muted)] uppercase tracking-wider block font-bold">Chapters</span>
              <div className="h-2 w-12 bg-white/10 rounded" />
              <div className="h-2 w-8 bg-white/5 rounded" />
              <div className="h-2 w-14 bg-white/5 rounded" />
              <div className="h-2 w-10 bg-[var(--accent)]/30 rounded border border-[var(--accent)]/20" />
            </div>
            {/* Center Chat Panel */}
            <div className="p-2 bg-black/15 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex justify-end">
                  <div className="bg-[var(--accent)] text-white text-[7.5px] px-1.5 py-0.5 rounded-md font-medium">
                    Summarize page 8 latency tests
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-4.5 h-4.5 rounded bg-gradient-to-br from-[#7C5CFF] to-[#4DA2FF] flex items-center justify-center flex-shrink-0 text-white text-[6.5px]">
                    <Bot size={7} />
                  </div>
                  <div className="bg-white/5 border border-white/10 text-[8px] p-1.5 rounded-md text-[var(--text-secondary)] leading-relaxed">
                    Decoupled tables limit response payload size, reducing general API load times.
                  </div>
                </div>
              </div>
              <div className="h-5.5 w-full bg-white/[0.01] border border-white/[0.07] rounded-lg flex items-center px-2 text-[7.5px] text-[var(--text-muted)] font-mono">
                Ask workspace...
              </div>
            </div>
            {/* Right Citations Panel */}
            <div className="border-l border-white/[0.04] bg-white/[0.005] p-2 space-y-2">
              <span className="text-[7px] text-[var(--accent)] uppercase tracking-wider block font-bold font-mono">Grounding</span>
              <div className="p-1.5 rounded bg-[var(--accent-subtle)] border border-[var(--accent)]/15 space-y-1 shadow-[0_4px_10px_rgba(139,156,247,0.05)]">
                <span className="text-[6px] font-mono text-[var(--accent)] font-bold block">Page 8 Segment</span>
                <p className="text-[6.5px] text-[var(--text-secondary)] leading-tight italic select-none">
                  "isolated index storage yields 78ms query times."
                </p>
              </div>
            </div>
          </div>
        </div>
      );

    case 3: // PDF Decoupling / Vector Indexing [Spans 2x2]
      return (
        <div className="mt-5 flex flex-col sm:flex-row gap-4 flex-1 w-full text-left font-sans min-h-[160px] lg:min-h-[220px]">
          {/* Drag & drop mock */}
          <div className="flex-1 border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.02] hover:border-[var(--accent)]/30 transition-all duration-300">
            <FileText size={22} className="text-[var(--accent)] mb-2.5 animate-pulse" />
            <span className="text-[11px] text-white font-medium">vector_specs.pdf</span>
            <span className="text-[9px] text-[var(--text-muted)] font-mono mt-1">12 pages · 1.4 MB</span>
          </div>
          {/* Vector Segment Grid Mock */}
          <div className="flex-1 bg-black/40 border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 font-mono">
              <span className="text-[9px] text-[var(--text-muted)]">RAG Pipeline</span>
              <span className="text-[8.5px] text-emerald-400 font-bold uppercase tracking-wide">34 Nodes Vectorized</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5 py-3.5">
              {Array.from({ length: 18 }).map((_, i) => {
                const isActive = i === 2 || i === 8 || i === 13;
                const isDecoupled = i === 5 || i === 11 || i === 16;
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-md border flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-[var(--accent)]/20 border-[var(--accent)] shadow-[0_0_10px_rgba(139,156,247,0.4)]'
                        : isDecoupled
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <span className="text-[6.5px] font-mono text-[var(--text-muted)]">{i + 1}</span>
                  </div>
                );
              })}
            </div>
            <span className="text-[8px] text-[var(--text-muted)] font-mono italic">
              decoding chunks from video metadata database models
            </span>
          </div>
        </div>
      );

    case 4: // Performance Latency
      return (
        <div className="mt-4 flex flex-col justify-end flex-1 w-full text-left font-sans">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white tracking-tight">78ms</span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono bg-emerald-500/10 border border-emerald-500/20 px-1 rounded flex items-center gap-0.5">
              ↓ 75% latency
            </span>
          </div>
          <div className="mt-3 bg-black/30 border border-white/[0.04] rounded-lg p-2.5 space-y-1.5 font-mono text-[9px]">
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Standard RAG</span>
              <span className="text-red-400">320ms</span>
            </div>
            <div className="flex justify-between font-bold text-white">
              <span>Decoupled RAG</span>
              <span className="text-emerald-400">78ms</span>
            </div>
            {/* Sparkline Graphic */}
            <svg className="w-full h-8 mt-1 text-[var(--accent)]" viewBox="0 0 100 20" fill="none" preserveAspectRatio="none">
              <path d="M0 18 L20 17 L40 16 L60 18 L80 8 L100 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M0 18 L20 17 L40 16 L60 18 L80 8 L100 2 L100 20 L0 20 Z" fill="url(#bento-spark-grad)" opacity="0.15" />
              <defs>
                <linearGradient id="bento-spark-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      );

    case 5: // Smart Citation evidence badges
      return (
        <div className="mt-4 space-y-2.5 flex-1 w-full text-left font-sans flex flex-col justify-end">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <p className="text-[10.5px] text-[var(--text-secondary)] leading-relaxed italic select-none">
              "...verified in Table 3 decoupled collections testing trials..."
            </p>
            <div className="flex flex-wrap gap-1.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-[8.5px] font-mono text-emerald-400 font-semibold cursor-pointer hover:bg-emerald-500/25 transition-colors">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                decoupled_specs.pdf [Page 8]
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-[8.5px] font-mono text-red-400 font-semibold cursor-pointer hover:bg-red-500/25 transition-colors">
                <Play size={7} className="fill-red-400 text-red-400" />
                04:12 Jump
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

const MagicBento: React.FC<BentoProps> = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = true,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  return (
    <>
      <style>
        {`
          .bento-section {
            --glow-x: 50%;
            --glow-y: 50%;
            --glow-intensity: 0;
            --glow-radius: 200px;
            --glow-color: ${glowColor};
            --border-color: rgba(255, 255, 255, 0.08);
            --background-dark: #0a0c10;
            --white: #f0f2f7;
            --purple-primary: rgba(139, 156, 247, 1);
            --purple-glow: rgba(139, 156, 247, 0.2);
            --purple-border: rgba(139, 156, 247, 0.4);
          }
          
          .card-responsive {
            grid-template-columns: 1fr;
            width: 100%;
            margin: 0 auto;
            padding: 0.5rem;
          }
          
          @media (min-width: 640px) {
            .card-responsive {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          
          @media (min-width: 1024px) {
            .card-responsive {
              grid-template-columns: repeat(4, 1fr);
            }
            
            .card-responsive .card:nth-child(3) {
              grid-column: span 2;
              grid-row: span 2;
            }
            
            .card-responsive .card:nth-child(4) {
              grid-column: 1 / span 2;
              grid-row: 2 / span 2;
            }
            
            .card-responsive .card:nth-child(6) {
              grid-column: 4;
              grid-row: 3;
            }
          }
          
          .card--border-glow::after {
            content: '';
            position: absolute;
            inset: 0;
            padding: 1.5px;
            background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y),
                rgba(${glowColor}, calc(var(--glow-intensity) * 0.8)) 0%,
                rgba(${glowColor}, calc(var(--glow-intensity) * 0.4)) 30%,
                transparent 60%);
            border-radius: inherit;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            pointer-events: none;
            opacity: 1;
            transition: opacity 0.3s ease;
            z-index: 1;
          }
          
          .card--border-glow:hover::after {
            opacity: 1;
          }
          
          .card--border-glow:hover {
            box-shadow: 0 4px 20px rgba(139, 156, 247, 0.05), 0 0 25px rgba(${glowColor}, 0.04);
            border-color: rgba(${glowColor}, 0.25);
          }
          
          .particle::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: rgba(${glowColor}, 0.2);
            border-radius: 50%;
            z-index: -1;
          }
          
          .particle-container:hover {
            box-shadow: 0 4px 20px rgba(139, 156, 247, 0.05), 0 0 25px rgba(${glowColor}, 0.04);
          }
          
          .text-clamp-1 {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            line-clamp: 1;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .text-clamp-2 {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          @media (max-width: 639px) {
            .card-responsive {
              grid-template-columns: 1fr;
              width: 100%;
              margin: 0 auto;
              padding: 0.5rem;
            }
            
            .card-responsive .card {
              width: 100%;
              min-height: 200px;
              aspect-ratio: auto;
            }
          }
        `}
      </style>

      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <BentoCardGrid gridRef={gridRef}>
        <div className="card-responsive grid gap-4">
          {cardData.map((card, index) => {
            const isSpanned = index === 2 || index === 3;
            
            const baseClassName = `card flex flex-col justify-between relative ${
              isSpanned ? 'aspect-auto' : 'aspect-[4/3]'
            } min-h-[220px] w-full max-w-full p-6 rounded-[20px] border border-solid font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${
              enableBorderGlow ? 'card--border-glow' : ''
            }`;

            const cardStyle = {
              backgroundColor: card.color || 'var(--background-dark)',
              borderColor: 'var(--border-color)',
              color: 'var(--white)',
              '--glow-x': '50%',
              '--glow-y': '50%',
              '--glow-intensity': '0',
              '--glow-radius': '200px'
            } as React.CSSProperties;

            const cardHeader = (
              <div className="card__header flex justify-between gap-3 relative text-white">
                <span className="card__label text-[10px] font-mono tracking-widest text-[var(--accent)] uppercase font-semibold">
                  {card.label}
                </span>
              </div>
            );

            const cardContent = (
              <div className="card__content flex flex-col relative text-white mt-auto">
                <h3 className={`card__title font-bold text-[15px] m-0 mb-1 leading-snug ${textAutoHide ? 'text-clamp-1' : ''}`}>
                  {card.title}
                </h3>
                <p className={`card__description text-xs leading-relaxed text-[var(--text-secondary)] ${textAutoHide ? 'text-clamp-2' : ''}`}>
                  {card.description}
                </p>
              </div>
            );

            if (enableStars) {
              return (
                <ParticleCard
                  key={index}
                  className={baseClassName}
                  style={cardStyle}
                  disableAnimations={shouldDisableAnimations}
                  particleCount={particleCount}
                  glowColor={glowColor}
                  enableTilt={enableTilt}
                  clickEffect={clickEffect}
                  enableMagnetism={enableMagnetism}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.015] to-transparent pointer-events-none" />
                  <div className="flex flex-col h-full justify-between z-10 relative">
                    <div>
                      {cardHeader}
                      {renderCardGraphics(index)}
                    </div>
                    {cardContent}
                  </div>
                </ParticleCard>
              );
            }

            return (
              <div
                key={index}
                className={baseClassName}
                style={cardStyle}
                ref={el => {
                  if (!el || shouldDisableAnimations) return;

                  const handleMouseMove = (e: MouseEvent) => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    if (enableTilt) {
                      const rotateX = ((y - centerY) / centerY) * -10;
                      const rotateY = ((x - centerX) / centerX) * 10;

                      gsap.to(el, {
                        rotateX,
                        rotateY,
                        duration: 0.1,
                        ease: 'power2.out',
                        transformPerspective: 1000
                      });
                    }

                    if (enableMagnetism) {
                      const magnetX = (x - centerX) * 0.05;
                      const magnetY = (y - centerY) * 0.05;

                      gsap.to(el, {
                        x: magnetX,
                        y: magnetY,
                        duration: 0.3,
                        ease: 'power2.out'
                      });
                    }
                  };

                  const handleMouseLeave = () => {
                    if (enableTilt) {
                      gsap.to(el, {
                        rotateX: 0,
                        rotateY: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                      });
                    }

                    if (enableMagnetism) {
                      gsap.to(el, {
                        x: 0,
                        y: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                      });
                    }
                  };

                  const handleClick = (e: MouseEvent) => {
                    if (!clickEffect) return;

                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const maxDistance = Math.max(
                      Math.hypot(x, y),
                      Math.hypot(x - rect.width, y),
                      Math.hypot(x, y - rect.height),
                      Math.hypot(x - rect.width, y - rect.height)
                    );

                    const ripple = document.createElement('div');
                    ripple.style.cssText = `
                      position: absolute;
                      width: ${maxDistance * 2}px;
                      height: ${maxDistance * 2}px;
                      border-radius: 50%;
                      background: radial-gradient(circle, rgba(${glowColor}, 0.3) 0%, rgba(${glowColor}, 0.1) 30%, transparent 70%);
                      left: ${x - maxDistance}px;
                      top: ${y - maxDistance}px;
                      pointer-events: none;
                      z-index: 1000;
                    `;

                    el.appendChild(ripple);

                    gsap.fromTo(
                      ripple,
                      {
                        scale: 0,
                        opacity: 1
                      },
                      {
                        scale: 1,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power2.out',
                        onComplete: () => ripple.remove()
                      }
                    );
                  };

                  el.addEventListener('mousemove', handleMouseMove);
                  el.addEventListener('mouseleave', handleMouseLeave);
                  el.addEventListener('click', handleClick);
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.015] to-transparent pointer-events-none" />
                <div className="flex flex-col h-full justify-between z-10 relative">
                  <div>
                    {cardHeader}
                    {renderCardGraphics(index)}
                  </div>
                  {cardContent}
                </div>
              </div>
            );
          })}
        </div>
      </BentoCardGrid>
    </>
  );
};

export default MagicBento;
