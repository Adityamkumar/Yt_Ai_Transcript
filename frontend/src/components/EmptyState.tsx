import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  FileQuestion,
  Lightbulb,
  ListChecks,
  MessageSquare,
  Sparkles,
  Youtube,
  Zap,
} from 'lucide-react';
import { SmartNotesCard } from './notes/SmartNotesCard';
import { APP_NAME, APP_TAGLINE, SUGGESTED_PROMPTS } from '@/constants';
import { promptCardVariants, promptStagger } from '@/animations/variants';

interface EmptyStateProps {
  onPromptSelect?: (text: string) => void;
  onNotesClick?: () => void;
  isLoadingNotes?: boolean;
  hasTranscript?: boolean;
}

const promptIcons = [Sparkles, CheckCircle2, BrainCircuit, FileQuestion, BarChart3, ListChecks];

export function EmptyState({ onPromptSelect, onNotesClick, isLoadingNotes, hasTranscript = false }: EmptyStateProps) {
  if (hasTranscript) {
    return (
      <div className="chat-container flex min-h-full flex-col justify-center pb-40 pt-10 sm:pb-44 sm:pt-12">
        <div className="mb-8 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <BrainCircuit size={14} className="text-[var(--accent)]" />
            Source indexed
          </div>
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.08] text-white">
            Ask anything about this video.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-secondary)]">
            Start with a direct question, pull out the main ideas, or turn the transcript into structured notes.
          </p>
        </div>

        {onPromptSelect && (
          <motion.div
            variants={promptStagger}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {onNotesClick && (
              <motion.div variants={promptCardVariants}>
                <SmartNotesCard 
                  onClick={onNotesClick} 
                  isLoading={isLoadingNotes} 
                />
              </motion.div>
            )}
            
            {SUGGESTED_PROMPTS.slice(onNotesClick ? 1 : 0).map((prompt, index) => {
              const Icon = promptIcons[index + (onNotesClick ? 1 : 0)] ?? MessageSquare;

              return (
                <motion.button
                  key={prompt.label}
                  variants={promptCardVariants}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => onPromptSelect(prompt.text)}
                  className="group flex min-h-[142px] flex-col rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 text-left shadow-sm transition hover:border-white/[0.16] hover:bg-white/[0.065]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-[#0c1018] text-[var(--accent)]">
                      <Icon size={17} />
                    </span>
                    <ArrowRight
                      size={16}
                      className="text-[var(--text-muted)] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </div>
                  <span className="text-sm font-semibold text-white">{prompt.label}</span>
                  <span className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-muted)]">
                    {prompt.text}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <section className="relative mx-auto w-full max-w-3xl text-center">
      <div className="pointer-events-none absolute left-1/2 top-4 h-64 w-64 -translate-x-1/2 rounded-full bg-[rgba(139,156,255,0.12)] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative"
      >
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.1] bg-white/[0.055] text-[var(--accent)] shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <BrainCircuit size={27} />
        </div>

        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
          <Sparkles size={13} className="text-[var(--accent)]" />
          AI transcript workspace
        </p>

        <h1 className="mx-auto max-w-2xl text-[clamp(2.25rem,6vw,4.25rem)] font-semibold leading-[1.04] text-white">
          {APP_NAME}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
          {APP_TAGLINE}
        </p>

        <div className="mx-auto mt-7 grid max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
          {[
            { icon: Youtube, title: 'Paste a link', text: 'Index any public YouTube transcript.' },
            { icon: Zap, title: 'Extract signal', text: 'Find the ideas worth saving.' },
            { icon: MessageSquare, title: 'Ask clearly', text: 'Chat with the video context.' },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 shadow-sm"
            >
              <Icon size={18} className="mb-3 text-[var(--accent)]" />
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">{text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
