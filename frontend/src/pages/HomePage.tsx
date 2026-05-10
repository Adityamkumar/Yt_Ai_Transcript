import { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ChatContainer } from '@/components/ChatContainer';
import { EmptyState } from '@/components/EmptyState';
import { TranscriptLoader } from '@/components/TranscriptLoader';
import { VideoCard } from '@/components/VideoCard';
import { useStore } from '@/store/useAppStore';
import { useTranscript } from '@/hooks/useTranscript';
import { fadeIn, pageVariants } from '@/animations/variants';

export default function HomePage() {
  const { state, createSession } = useStore();
  const { activeSessionId, sessions } = state;
  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? null;
  const transcript = useTranscript();

  const handleTranscriptSubmit = useCallback(
    async (url: string) => {
      try {
        const data = await transcript.extract(url);
        createSession(data.videoId, url);
        toast.success('Source indexed and ready to chat');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Indexing failed');
      }
    },
    [transcript, createSession]
  );

  const isExtracting = transcript.isPending;

  return (
    <AnimatePresence mode="wait">
      {activeSession ? (
        <motion.div
          key={activeSession.id}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="h-full min-h-0"
        >
          <ChatContainer sessionId={activeSession.id} videoId={activeSession.videoId} />
        </motion.div>
      ) : (
        <motion.div
          key="onboarding"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="h-full overflow-y-auto"
        >
          <div className="content-container flex min-h-full flex-col justify-center py-8 sm:py-10 lg:py-12">
            <div className="grid items-center gap-8 lg:gap-10">
              <AnimatePresence mode="wait">
                {!isExtracting ? (
                  <motion.div key="empty" variants={fadeIn}>
                    <EmptyState hasTranscript={false} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="loading"
                    variants={fadeIn}
                    className="mx-auto w-full max-w-[520px] py-10"
                  >
                    <div className="mb-6 text-center">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                        Processing
                      </p>
                      <h2 className="text-2xl font-semibold text-white">Building video context</h2>
                      <p className="mt-2 text-sm text-[var(--text-muted)]">
                        Extracting transcript signals and preparing the workspace.
                      </p>
                    </div>
                    <VideoCard videoId="loading" youtubeUrl="" isLoading />
                  </motion.div>
                )}
              </AnimatePresence>

              {!isExtracting && (
                <motion.div
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.16, duration: 0.35 }}
                >
                  <TranscriptLoader
                    onSubmit={handleTranscriptSubmit}
                    isLoading={isExtracting}
                    error={transcript.error?.message}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
