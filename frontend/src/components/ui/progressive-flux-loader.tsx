import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/utils/cn";

export interface ProgressiveFluxPhase {
  at: number;
  label: string;
}

interface ProgressiveFluxLoaderProps {
  phases: ProgressiveFluxPhase[];
  className?: string;
}

/** Single-message indeterminate loader, styled after the supplied original. */
export function ProgressiveFluxLoader({ phases, className }: ProgressiveFluxLoaderProps) {
  const reducedMotion = useReducedMotion();
  const [progress, setProgress] = React.useState(4);

  React.useEffect(() => {
    if (reducedMotion) return;
    let frame = 0;
    let startedAt: number | undefined;
    const sweep = (now: number) => {
      startedAt ??= now;
      // Ease toward completion without ever resetting. The real request remains
      // authoritative, so the loader holds near the end until it resolves.
      const elapsed = now - startedAt;
      setProgress(Math.min(92, 4 + 88 * (1 - Math.exp(-elapsed / 30000))));
      frame = requestAnimationFrame(sweep);
    };
    frame = requestAnimationFrame(sweep);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const activeIndex = phases.reduce(
    (index, phase, current) => (progress >= phase.at ? current : index),
    0,
  );
  const active = phases[activeIndex] ?? phases[0];

  return (
    <section
      aria-live="polite"
      aria-label={active?.label ?? "Loading"}
      className={cn(
        "relative mx-auto w-full max-w-[540px] overflow-hidden rounded-[28px] border border-white/[0.10] bg-[linear-gradient(145deg,rgba(18,22,42,0.94),rgba(6,8,17,0.96))] px-5 py-11 shadow-[0_28px_90px_rgba(0,0,0,0.48)] sm:px-9 sm:py-14",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_at_top,rgba(127,115,255,0.25),transparent_70%)]" />
      <div className="relative flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={active?.label}
            className="flex justify-center"
            initial={reducedMotion ? false : { opacity: 0, filter: "blur(8px)", y: 8 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, filter: "blur(8px)", y: -8 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-lg font-semibold tracking-tight text-white/90 sm:text-xl">
              {active?.label.split("").map((character, index) => (
                <motion.span
                  key={`${active.label}-${index}`}
                  className="inline-block"
                  initial={reducedMotion ? false : { opacity: 0, y: 9, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.3, delay: reducedMotion ? 0 : index * 0.025 }}
                >
                  {character === " " ? "\u00a0" : character}
                </motion.span>
              ))}
            </h2>
          </motion.div>
        </AnimatePresence>

        <div
          className="mt-8 h-2 w-full overflow-hidden rounded-full bg-white/[0.10]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-valuetext={active?.label}
        >
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#3879ff,#55c7ff_48%,#d6f7ff_70%,#4b82ff)] shadow-[0_0_18px_rgba(99,181,255,0.8)]"
            initial={{ width: "4%" }}
            animate={{ width: `${progress}%` }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.65, ease: "easeOut" }}
          />
        </div>
      </div>
    </section>
  );
}
