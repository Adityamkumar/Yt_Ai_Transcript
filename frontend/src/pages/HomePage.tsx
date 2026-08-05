import { useCallback, useEffect, useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2, Sparkles, Youtube } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatContainer = lazy(() => import('@/components/ChatContainer').then(m => ({ default: m.ChatContainer })));
const PdfChatContainer = lazy(() => import('@/components/pdf/PdfChatContainer').then(m => ({ default: m.PdfChatContainer })));

import { PdfUploadCard } from '@/components/pdf/PdfUploadCard';
import { PdfIndexingStatus } from '@/components/pdf/PdfIndexingStatus';
import { GreetingHero } from '@/components/chat/GreetingHero';
import { TranscriptLoader } from '@/components/TranscriptLoader';
import { useConversations } from '@/hooks/useConversations';
import { videoService } from '@/services/video.service';
import { fadeIn, pageVariants } from '@/animations/variants';
import { WorkspaceAction } from '@/components/workspace-actions/workspaceActionConfig';
import { PdfDocument, IConversation } from '@/types';

interface HomePageProps {
  onActionReady?: (trigger: (action: WorkspaceAction) => void) => void;
}

const videoProcessingSteps = [
  {
    title: 'Fetching video details',
    description: 'Checking the video and getting everything ready.'
  },
  {
    title: 'Extracting the transcript',
    description: 'Turning the video into text you can chat with.'
  },
  {
    title: 'Organizing the context',
    description: 'Chunking the content and preparing your workspace.'
  }
];

export default function HomePage({ onActionReady }: HomePageProps) {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { conversations, createConversation, isCreating: isCreatingConversation } = useConversations();

  const [sourceType, setSourceType] = useState<"video" | "pdf">("video");
  const [isPdfProcessing, setIsPdfProcessing] = useState(false);
  const [processingFileName, setProcessingFileName] = useState("");

  const activeConversation = conversations.find((c) => c._id === conversationId);

  const [isExtracting, setIsExtracting] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  useEffect(() => {
    if (!isExtracting && !isCreatingConversation) {
      setProcessingStep(0);
      return;
    }

    const interval = window.setInterval(() => {
      setProcessingStep((currentStep) => (currentStep + 1) % videoProcessingSteps.length);
    }, 2400);

    return () => window.clearInterval(interval);
  }, [isCreatingConversation, isExtracting]);

  const handleTranscriptSubmit = useCallback(
    async (url: string) => {
      try {
        setIsExtracting(true);
        const videoData = await videoService.getTranscript(url);

        const conversation = await createConversation({
          videoId: videoData._id,
          title: videoData.title || 'New Chat'
        });

        toast.success('Source indexed and ready to chat');

        navigate(`/workspace/${conversation._id}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Indexing failed');
      } finally {
        setIsExtracting(false);
      }
    },
    [createConversation, navigate]
  );

  const handlePdfUploadSuccess = useCallback(
    (conversation: IConversation) => {
      setIsPdfProcessing(false);

      queryClient.setQueryData<IConversation[]>(['conversations'], (old) => {
        if (!old) return [conversation];
        if (old.some((c) => c._id === conversation._id)) return old;
        return [conversation, ...old];
      });

      navigate(`/workspace/${conversation._id}`);
    },
    [navigate, queryClient]
  );

  const handlePdfUploadingState = useCallback((uploading: boolean) => {
    setIsPdfProcessing(uploading);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {activeConversation ? (
        <motion.div
          key={activeConversation._id}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="h-full min-h-0 w-full"
        >
          <Suspense fallback={
            <div className="flex h-full w-full items-center justify-center bg-[var(--canvas)]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-[#7C5CFF] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-[var(--text-muted)] animate-pulse">Initializing workspace...</span>
              </div>
            </div>
          }>
            {activeConversation.type === 'pdf' ? (
              <PdfChatContainer
                conversationId={activeConversation._id}
                pdf={activeConversation.pdfDocumentId as PdfDocument}
                onActionReady={onActionReady}
              />
            ) : (
              <ChatContainer
                conversationId={activeConversation._id}
                video={typeof activeConversation.videoId === 'string' ? { _id: activeConversation.videoId } as any : activeConversation.videoId}
                onActionReady={onActionReady}
              />
            )}
          </Suspense>
        </motion.div>
      ) : (
        <motion.div
          key="onboarding"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="h-full overflow-y-auto overflow-x-hidden w-full max-w-full"
        >
          <div className="content-container flex min-h-full flex-col justify-center py-3 sm:py-4 lg:py-5">
            <div className="grid items-center gap-3 lg:gap-4 w-full max-w-full overflow-x-hidden">
              <AnimatePresence mode="wait">
                {!(isExtracting || isCreatingConversation || isPdfProcessing) ? (
                  <motion.div key="empty" variants={fadeIn} className="w-full max-w-full min-w-0 overflow-x-hidden">
                    <GreetingHero />
                  </motion.div>
                ) : isPdfProcessing ? (
                  <motion.div
                    key="pdf-loading"
                    variants={fadeIn}
                    className="mx-auto w-full max-w-[520px] py-10"
                  >
                    <PdfIndexingStatus fileName={processingFileName || "your document"} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="loading"
                    variants={fadeIn}
                    className="mx-auto w-full max-w-[440px] py-10 sm:py-12"
                  >
                    <div className="premium-panel relative overflow-hidden rounded-2xl px-5 py-6 sm:px-7">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(157,165,255,0.07),transparent_36%),radial-gradient(circle_at_80%_0%,rgba(77,162,255,0.05),transparent_30%)] pointer-events-none" />
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-4 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                          <Sparkles size={12} className="text-[var(--accent)]" />
                          <span>Preparing your workspace</span>
                        </div>

                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
                          className="mb-4 text-[var(--accent)]"
                        >
                          <Loader2 size={24} strokeWidth={2.25} />
                        </motion.div>

                        <AnimatePresence mode="wait">
                          <motion.div
                            key={processingStep}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)] sm:text-xl">
                              {videoProcessingSteps[processingStep].title}
                            </h2>
                            <p className="mt-1.5 text-sm text-[var(--text-muted)]">
                              {videoProcessingSteps[processingStep].description}
                            </p>
                          </motion.div>
                        </AnimatePresence>

                        <div className="mt-5 h-1 w-full max-w-[280px] overflow-hidden rounded-full bg-[rgba(255,255,255,0.07)]">
                          <motion.div
                            className="h-full w-1/2 rounded-full bg-[linear-gradient(90deg,rgba(157,165,255,0.68),rgba(77,162,255,0.98),rgba(157,165,255,0.68))]"
                            animate={{ x: ['-35%', '135%'] }}
                            transition={{ repeat: Infinity, duration: 1.7, ease: 'easeInOut' }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!(isExtracting || isCreatingConversation || isPdfProcessing) && (
                <motion.div
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.14, duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }}
                  className="flex flex-col gap-4 w-full max-w-full min-w-0 overflow-x-hidden"
                >
                  {/* Source Type Toggle */}
                  <div className="mx-auto flex w-full max-w-sm items-center gap-1 rounded-2xl border border-[var(--border-soft)] bg-[var(--canvas-subtle)]/90 p-1.5 backdrop-blur-md">
                    <button
                      onClick={() => setSourceType("video")}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${sourceType === "video" ? "bg-[var(--surface-active)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                    >
                      <Youtube size={15} />
                      YouTube Video
                    </button>
                    <button
                      onClick={() => setSourceType("pdf")}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${sourceType === "pdf" ? "bg-[var(--surface-active)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                    >
                      <FileText size={15} />
                      PDF Document
                    </button>
                  </div>

                  {sourceType === "video" ? (
                    <TranscriptLoader
                      onSubmit={handleTranscriptSubmit}
                      isLoading={isExtracting || isCreatingConversation}
                    />
                  ) : (
                    <PdfUploadCard
                      onUploadSuccess={handlePdfUploadSuccess}
                      onUploadingStateChange={(uploading) => {
                        handlePdfUploadingState(uploading);
                        const inputEl = document.querySelector('input[type="file"]') as HTMLInputElement;
                        if (inputEl?.files?.[0]) {
                          setProcessingFileName(inputEl.files[0].name);
                        }
                      }}
                    />
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
