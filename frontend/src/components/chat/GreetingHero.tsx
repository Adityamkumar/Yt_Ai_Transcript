import React, { useMemo } from 'react';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { Youtube, FileText, BrainCircuit, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/AuthContext';
import { DYNAMIC_GREETINGS } from '@/constants/dynamicGreetings';

export function GreetingHero() {
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  // Parse user's name and fallback to Learner
  const userName = useMemo(() => {
    const rawName = user?.name || 'Learner';
    return rawName.trim().split(/\s+/)[0];
  }, [user?.name]);

  // Select a random greeting template once on mount/page refresh (stable on re-renders)
  const greetingTemplate = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * DYNAMIC_GREETINGS.length);
    return DYNAMIC_GREETINGS[randomIndex];
  }, []);

  // Split greeting template around the {name} placeholder
  const parsedGreeting = useMemo(() => {
    const parts = greetingTemplate.split('{name}');
    return {
      before: parts[0] || '',
      after: parts[1] || ''
    };
  }, [greetingTemplate]);

  const quickActions = [
    'Explain concepts',
    'Generate notes',
    'Give code examples',
    'Create flashcards'
  ];

  const handleQuickActionClick = (action: string) => {
    try {
      navigator.clipboard.writeText(action);
      toast.success(`Copied "${action}" to clipboard! Paste it once a source is loaded.`);
    } catch {
      toast.error('Failed to copy to clipboard.');
    }
  };

  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05,
      }
    }
  };

  const itemVariants: Variants = {
    initial: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 8 
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.35, 
        ease: [0.25, 0.1, 0.25, 1.0] as const
      }
    }
  };

  return (
    <motion.section 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="relative mx-auto w-full max-w-full md:max-w-3xl text-center pt-2 pb-3 px-4 flex flex-col items-center justify-center overflow-x-hidden"
    >
      {/* Decorative accent glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-44 w-44 -translate-x-1/2 rounded-full bg-[var(--accent-glow)] blur-3xl opacity-50" />

      {/* Large Dynamic Conversational Greeting */}
      <motion.h1 
        variants={itemVariants}
        className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-center w-full max-w-full md:max-w-3xl leading-snug break-words px-1"
      >
        {parsedGreeting.before}
        <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] bg-clip-text text-transparent font-semibold">
          {userName}
        </span>
        {parsedGreeting.after}
      </motion.h1>

      {/* Suggested Quick Actions */}
      <motion.div 
        variants={itemVariants}
        className="mt-4.5 flex flex-row flex-nowrap items-center justify-start sm:justify-center gap-2 max-w-full overflow-x-auto no-scrollbar py-1 px-2 w-full min-w-0"
      >
        {quickActions.map((action) => (
          <button
            key={action}
            onClick={() => handleQuickActionClick(action)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[var(--border-soft)] bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer duration-200 active:scale-95 shrink-0"
          >
            <Sparkles size={10} className="text-[var(--accent)]" />
            {action}
          </button>
        ))}
      </motion.div>

      {/* Feature Cards Grid */}
      <motion.div 
        variants={itemVariants}
        className="mt-6 grid grid-cols-1 gap-3.5 text-left sm:grid-cols-3 max-w-2xl mx-auto w-full"
      >
        {[
          { icon: Youtube, title: 'Analyze YouTube', text: 'Index transcripts of any educational video.' },
          { icon: FileText, title: 'Chat with PDF', text: 'Upload documents to query grounded facts.' },
          { icon: BrainCircuit, title: 'Generate Study Notes', text: 'Turn sources into structured study materials.' },
        ].map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="group rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-3)] p-4 flex flex-col"
          >
            <Icon size={16} className="mb-2.5 text-[var(--accent)]" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">{text}</p>
          </div>
        ))}
      </motion.div>
    </motion.section>
  );
}
