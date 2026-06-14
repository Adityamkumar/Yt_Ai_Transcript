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
  FileText,
} from 'lucide-react';
import { SmartNotesCard } from './notes/SmartNotesCard';
import { APP_NAME, APP_TAGLINE, SUGGESTED_PROMPTS } from '@/constants';
import { promptCardVariants, promptStagger } from '@/animations/variants';

interface EmptyStateProps {
  onPromptSelect?: (text: string) => void;
  onNotesClick?: () => void;
  onSummaryClick?: () => void;
  isLoadingNotes?: boolean;
  hasTranscript?: boolean;
}

const promptIcons = [Sparkles, CheckCircle2, BrainCircuit, FileQuestion, BarChart3, ListChecks];

export function EmptyState({
  onPromptSelect,
  onNotesClick,
  onSummaryClick,
  isLoadingNotes,
  hasTranscript = false
}: EmptyStateProps) {
  if (hasTranscript) {
    return (
      <div className="chat-container flex min-h-full flex-col justify-center pb-40 pt-10 sm:pb-44 sm:pt-12">
        <div className="mb-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-3)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <BrainCircuit size={13} className="text-[var(--accent)]" />
            Source indexed
          </div>
          <h1 className="text-[clamp(1.75rem,4.5vw,2.75rem)] font-semibold leading-[1.1] tracking-tight text-[var(--text-primary)]">
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
            className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {onNotesClick && (
              <>
                <motion.div variants={promptCardVariants}>
                  <SmartNotesCard
                     onClick={onNotesClick}
                     isLoading={isLoadingNotes}
                  />
                </motion.div>
                <motion.div variants={promptCardVariants}>
                  <SmartNotesCard
                    title="Summarize Video"
                    description="Get a conversational summary with key timestamped highlights instantly."
                    color="blue"
                    onClick={() => onSummaryClick?.()}
                    isLoading={isLoadingNotes}
                  />
                </motion.div>
              </>
            )}

            {SUGGESTED_PROMPTS.slice(onNotesClick ? 1 : 0).map((prompt, index) => {
              const Icon = promptIcons[index + (onNotesClick ? 1 : 0)] ?? MessageSquare;

              return (
                <motion.button
                  key={prompt.label}
                  variants={promptCardVariants}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => onPromptSelect(prompt.text)}
                  className="group flex min-h-[136px] flex-col rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-3)] p-4 text-left transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
                >
                  <div className="mb-3.5 flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--border-soft)] bg-[var(--canvas)] text-[var(--accent)]">
                      <Icon size={16} />
                    </span>
                    <ArrowRight
                      size={15}
                      className="text-[var(--text-muted)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{prompt.label}</span>
                  <span className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">
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
      <div className="pointer-events-none absolute left-1/2 top-4 h-56 w-56 -translate-x-1/2 rounded-full bg-[var(--accent-glow)] blur-3xl opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="relative"
      >
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-3)] text-[var(--accent)] shadow-lg backdrop-blur-xl">
          <BrainCircuit size={26} />
        </div>

        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-3)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
          <Sparkles size={12} className="text-[var(--accent)]" />
          AI learning workspace
        </p>

        <h1 className="mx-auto max-w-2xl text-[clamp(2rem,5.5vw,3.75rem)] font-semibold leading-[1.06] tracking-tight text-[var(--text-primary)]">
          {APP_NAME}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
          {APP_TAGLINE}
        </p>

        <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
          {[
            { icon: Youtube, title: 'Analyze YouTube', text: 'Index transcripts of any educational video.' },
            { icon: FileText, title: 'Chat with PDF', text: 'Upload documents to query grounded facts.' },
            { icon: BrainCircuit, title: 'Generate Study Notes', text: 'Turn sources into structured study materials.' },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-3)] p-4 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
            >
              <Icon size={17} className="mb-3 text-[var(--accent)]" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
