import { Variants } from 'framer-motion';

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export const fadeUpLg: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const sidebarVariants: Variants = {
  open: {
    width: 280,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  closed: {
    width: 0,
    x: '-100%',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 35
    }
  }
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04
    }
  }
};

export const listItemVariants: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
};

export const chatBubbleVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  }
};

export const promptStagger: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2
    }
  }
};

export const promptCardVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: {
    y: -4,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  tap: { scale: 0.98 }
};

export const pageVariants: Variants = {
  initial: { opacity: 0, scale: 0.99 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }
  },
  exit: {
    opacity: 0,
    scale: 1.01,
    transition: { duration: 0.3, ease: 'easeIn' }
  }
};
