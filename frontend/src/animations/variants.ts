import { Variants } from 'framer-motion';

/* ──────────────────────────────────────────
   Core Motion Variants
   ────────────────────────────────────────── */

const EASE_PREMIUM = [0.25, 0.1, 0.25, 1.0] as const;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_PREMIUM },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

export const fadeUpLg: Variants = {
  initial: { opacity: 0, y: 28 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_PREMIUM },
  },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.35, ease: EASE_PREMIUM },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

/* ──────────────────────────────────────────
   Scale & Blur Variants
   ────────────────────────────────────────── */

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: EASE_PREMIUM },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE_PREMIUM },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

/* ──────────────────────────────────────────
   Layout Components
   ────────────────────────────────────────── */

export const sidebarVariants: Variants = {
  open: {
    width: 'var(--sidebar-width)',
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 32,
      staggerChildren: 0.04,
      delayChildren: 0.08,
    },
  },
  closed: {
    width: 0,
    x: '-100%',
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 36,
    },
  },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.035,
    },
  },
};

export const listItemVariants: Variants = {
  initial: { opacity: 0, x: -8 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: EASE_PREMIUM },
  },
};

/* ──────────────────────────────────────────
   Chat & Messages
   ────────────────────────────────────────── */

export const chatBubbleVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: EASE_PREMIUM,
    },
  },
};

/* ──────────────────────────────────────────
   Prompt Cards
   ────────────────────────────────────────── */

export const promptStagger: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.15,
    },
  },
};

export const promptCardVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_PREMIUM },
  },
  hover: {
    y: -3,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  tap: { scale: 0.985 },
};

/* ──────────────────────────────────────────
   Page Transitions
   ────────────────────────────────────────── */

export const pageVariants: Variants = {
  initial: { opacity: 0, scale: 0.995 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: EASE_PREMIUM },
  },
  exit: {
    opacity: 0,
    scale: 1.005,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

/* ──────────────────────────────────────────
   Workspace Panel Reveal
   ────────────────────────────────────────── */

export const panelRevealStagger: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const panelRevealItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_PREMIUM },
  },
};
