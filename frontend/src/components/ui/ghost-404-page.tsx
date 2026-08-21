import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Ghost404PageProps {
  destination: string;
  destinationLabel: string;
}

const easing = [0.43, 0.13, 0.23, 0.96] as const;

export function Ghost404Page({ destination, destinationLabel }: Ghost404PageProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-black px-5 py-12 text-white sm:px-8">
      <motion.section
        className="flex w-full max-w-2xl flex-col items-center text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easing }}
      >
        <div className="mb-8 flex items-center justify-center gap-3 sm:mb-10 sm:gap-5">
          <motion.span
            className="select-none text-7xl font-bold leading-none text-[var(--text-primary)] opacity-70 sm:text-9xl"
            initial={{ opacity: 0, x: -40, y: 15, rotate: -5 }}
            animate={{ opacity: 0.7, x: 0, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, ease: easing, delay: 0.1 }}
          >
            4
          </motion.span>
          <motion.img
            src="https://xubohuah.github.io/xubohua.top/Group.png"
            alt="Friendly ghost"
            className="size-20 select-none object-contain sm:size-30"
            draggable={false}
            initial={{ scale: 0.8, opacity: 0, y: 15, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, y: [-5, 5, -5], rotate: 0 }}
            whileHover={{ scale: 1.1, y: -10, rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            className="select-none text-7xl font-bold leading-none text-[var(--text-primary)] opacity-70 sm:text-9xl"
            initial={{ opacity: 0, x: 40, y: 15, rotate: 5 }}
            animate={{ opacity: 0.7, x: 0, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, ease: easing, delay: 0.1 }}
          >
            4
          </motion.span>
        </div>

        <motion.h1
          className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easing, delay: 0.25 }}
        >
          Boo! Page missing!
        </motion.h1>
        <motion.p
          className="inline-block text-center text-sm leading-6 text-[var(--text-secondary)] sm:text-base"
          style={{ marginTop: '24px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easing, delay: 0.35 }}
        >
          Whoops! This page must be a ghost — it&apos;s not here.
        </motion.p>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easing, delay: 0.45 }}
        >
          <Link
            to={destination}
            className="group relative inline-flex min-h-11 items-center gap-3 overflow-hidden rounded-full border border-[var(--border-strong)] px-7 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors duration-500 hover:border-[var(--accent)] hover:text-[var(--canvas)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            <span className="pointer-events-none absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-[var(--accent)] transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] will-change-transform group-hover:scale-100" />
            <span className="relative">{destinationLabel}</span>
            <ArrowRight className="relative size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </motion.div>
      </motion.section>
    </main>
  );
}
