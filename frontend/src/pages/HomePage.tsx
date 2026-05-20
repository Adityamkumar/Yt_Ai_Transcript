import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Youtube, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { ChatContainer } from '@/components/ChatContainer';
import { PdfChatContainer } from '@/components/pdf/PdfChatContainer';
import { PdfUploadCard } from '@/components/pdf/PdfUploadCard';
import { PdfIndexingStatus } from '@/components/pdf/PdfIndexingStatus';
import { EmptyState } from '@/components/EmptyState';
import { TranscriptLoader } from '@/components/TranscriptLoader';
import { VideoCard } from '@/components/VideoCard';
import { useConversations } from '@/hooks/useConversations';
import { videoService } from '@/services/video.service';
import { fadeIn, pageVariants } from '@/animations/variants';
import { WorkspaceAction } from '@/components/workspace-actions/workspaceActionConfig';
import { PdfDocument, IConversation } from '@/types';

interface HomePageProps {
  onActionReady?: (trigger: (action: WorkspaceAction) => void) => void;
}

export default function HomePage({ onActionReady }: HomePageProps) {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { conversations, createConversation, isCreating: isCreatingConversation } = useConversations();

  const [sourceType, setSourceType] = useState<"video" | "pdf">("video");
  const [isPdfProcessing, setIsPdfProcessing] = useState(false);
  const [processingFileName, setProcessingFileName] = useState("");

  // Find active conversation from the list
  const activeConversation = conversations.find((c) => c._id === conversationId);

  // Extract transcript mutation state
  const [isExtracting, setIsExtracting] = useState(false);

  const handleTranscriptSubmit = useCallback(
    async (url: string) => {
      try {
        setIsExtracting(true);
        // 1. Get transcript and video data
        const videoData = await videoService.getTranscript(url);
        
        // 2. Create conversation
        const conversation = await createConversation({
          videoId: videoData._id,
          title: videoData.title || 'New Chat'
        });

        toast.success('Source indexed and ready to chat');
        
        // 3. Redirect to workspace
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
      
      // Update cache instantly to prevent dashboard redirection flashes
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
          className="h-full min-h-0"
        >
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
                {!(isExtracting || isCreatingConversation || isPdfProcessing) ? (
                  <motion.div key="empty" variants={fadeIn}>
                    <EmptyState hasTranscript={false} />
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

              {!(isExtracting || isCreatingConversation || isPdfProcessing) && (
                <motion.div
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.16, duration: 0.35 }}
                  className="flex flex-col gap-6"
                >
                  {/* Source Selector tabs */}
                  <div className="mx-auto flex w-full max-w-sm items-center gap-1 rounded-2xl border border-white/[0.08] bg-[#0c1018]/90 p-1.5 backdrop-blur-md">
                    <button
                      onClick={() => setSourceType("video")}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${sourceType === "video" ? "bg-white/[0.08] text-white" : "text-[var(--text-muted)] hover:text-white"}`}
                    >
                      <Youtube size={16} />
                      YouTube Video
                    </button>
                    <button
                      onClick={() => setSourceType("pdf")}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${sourceType === "pdf" ? "bg-white/[0.08] text-white" : "text-[var(--text-muted)] hover:text-white"}`}
                    >
                      <FileText size={16} />
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
                        // Extract file name from upload input to display in indexing widget
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
