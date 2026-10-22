import { useCallback, useState, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Youtube } from "lucide-react";
import toast from "react-hot-toast";
import { EMAIL_NOT_VERIFIED_CODE } from "@/lib/axios";

const ChatContainer = lazy(() =>
  import("@/components/ChatContainer").then((m) => ({
    default: m.ChatContainer,
  })),
);
const PdfChatContainer = lazy(() =>
  import("@/components/pdf/PdfChatContainer").then((m) => ({
    default: m.PdfChatContainer,
  })),
);

import { PdfUploadCard } from "@/components/pdf/PdfUploadCard";
import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader";
import { GreetingHero, SourceSuggestionChips } from "@/components/chat/GreetingHero";
import { TranscriptLoader } from "@/components/TranscriptLoader";
import { useConversations } from "@/hooks/useConversations";
import { videoService } from "@/services/video.service";
import { fadeIn, pageVariants } from "@/animations/variants";
import { WorkspaceAction } from "@/components/workspace-actions/workspaceActionConfig";
import { PdfDocument, IConversation } from "@/types";

interface HomePageProps {
  onActionReady?: (trigger: (action: WorkspaceAction) => void) => void;
}

const videoProcessingSteps = [
  {
    title: "Fetching video details",
    description: "Checking the video and getting everything ready.",
  },
  {
    title: "Extracting the transcript",
    description: "Turning the video into text you can chat with.",
  },
  {
    title: "Organizing the context",
    description: "Chunking the content and preparing your workspace.",
  },
];

const pdfProcessingSteps = [
  { at: 0, label: "Uploading your PDF" },
  { at: 28, label: "Extracting document text" },
  { at: 56, label: "Organizing your document" },
  { at: 80, label: "Preparing your workspace" },
];

export default function HomePage({ onActionReady }: HomePageProps) {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    conversations,
    createConversation,
    isCreating: isCreatingConversation,
  } = useConversations(conversationId);

  const [sourceType, setSourceType] = useState<"video" | "pdf">("video");
  const [isPdfProcessing, setIsPdfProcessing] = useState(false);

  const activeConversation = conversations.find((c) => c._id === conversationId);

  const activeVideo =
    activeConversation?.type === "video" &&
    activeConversation.videoId &&
    typeof activeConversation.videoId !== "string"
      ? activeConversation.videoId
      : null;

  const isVideoReady =
    activeConversation?.type === "video" &&
    !!activeVideo &&
    activeVideo.status === "ready" &&
    activeVideo.ragStatus === "ready";

  const isVideoFailed =
    activeConversation?.type === "video" &&
    !!activeVideo &&
    (activeVideo.status === "failed" || activeVideo.ragStatus === "failed");

  const isVideoPreparing = activeConversation?.type === "video" && !isVideoReady && !isVideoFailed;

  const [isExtracting, setIsExtracting] = useState(false);

  const handleTranscriptSubmit = useCallback(
    async (url: string) => {
      try {
        setIsExtracting(true);
        const videoData = await videoService.getTranscript(url);

        const conversation = await createConversation({
          videoId: videoData._id,
          title: videoData.title || "New Chat",
        });

        void navigate(`/workspace/${conversation._id}`);
      } catch (err) {
        if ((err as { code?: string })?.code === EMAIL_NOT_VERIFIED_CODE) return;
        toast.error(err instanceof Error ? err.message : "Indexing failed");
      } finally {
        setIsExtracting(false);
      }
    },
    [createConversation, navigate],
  );

  const handlePdfUploadSuccess = useCallback(
    (conversation: IConversation) => {
      setIsPdfProcessing(false);

      queryClient.setQueryData<IConversation[]>(["conversations"], (old) => {
        if (!old) return [conversation];
        if (old.some((c) => c._id === conversation._id)) return old;
        return [conversation, ...old];
      });

      void navigate(`/workspace/${conversation._id}`);
    },
    [navigate, queryClient],
  );

  const handlePdfUploadingState = useCallback((uploading: boolean) => {
    setIsPdfProcessing(uploading);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {activeConversation && !isVideoPreparing && !isVideoFailed ? (
        <motion.div
          key={activeConversation._id}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="h-full min-h-0 w-full"
        >
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-[var(--canvas)]">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-[#7C5CFF] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-[var(--text-muted)] animate-pulse">
                    Initializing workspace...
                  </span>
                </div>
              </div>
            }
          >
            {activeConversation.type === "pdf" ? (
              <PdfChatContainer
                conversationId={activeConversation._id}
                pdf={activeConversation.pdfDocumentId as PdfDocument}
                onActionReady={onActionReady}
              />
            ) : (
              <ChatContainer
                conversationId={activeConversation._id}
                video={
                  typeof activeConversation.videoId === "string"
                    ? ({ _id: activeConversation.videoId } as any)
                    : activeConversation.videoId
                }
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
          className="h-full min-h-0 w-full max-w-full overflow-hidden"
        >
          <div className="lumora-dashboard flex h-full min-h-0 w-full flex-col justify-center overflow-hidden py-6 sm:py-8 lg:py-10">
            <div className="relative z-10 grid items-center gap-4 lg:gap-5 w-full max-w-full overflow-x-hidden">
              <AnimatePresence mode="wait">
                {isVideoFailed ? (
                  <motion.div
                    key="video-failed"
                    variants={fadeIn}
                    className="mx-auto w-full max-w-[440px] py-10 sm:py-12"
                  >
                    <div className="premium-panel relative overflow-hidden rounded-2xl px-5 py-6 sm:px-7">
                      <div className="relative z-10 text-center">
                        <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)] sm:text-xl">
                          We couldn't prepare this video
                        </h2>

                        <p className="mt-2 text-sm text-[var(--text-muted)]">
                          The video could not be fully prepared for AI chat. Please try again.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : !(
                    isExtracting ||
                    isCreatingConversation ||
                    isPdfProcessing ||
                    isVideoPreparing
                  ) ? (
                  <motion.div
                    key="empty"
                    variants={fadeIn}
                    className="w-full max-w-full min-w-0 overflow-x-hidden"
                  >
                    <GreetingHero sourceType={sourceType} />
                  </motion.div>
                ) : isPdfProcessing ? (
                  <motion.div
                    key="pdf-loading"
                    variants={fadeIn}
                    className="mx-auto w-full max-w-[560px] py-10"
                  >
                    <ProgressiveFluxLoader phases={pdfProcessingSteps} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="loading"
                    variants={fadeIn}
                    className="mx-auto w-full max-w-[560px] py-10 sm:py-12"
                  >
                    <ProgressiveFluxLoader
                      phases={videoProcessingSteps.map((step, index) => ({ at: index * 33, label: step.title }))}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {!(
                isExtracting ||
                isCreatingConversation ||
                isPdfProcessing ||
                isVideoPreparing ||
                isVideoFailed
              ) && (
                <motion.div
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.14,
                    duration: 0.35,
                    ease: [0.25, 0.1, 0.25, 1.0],
                  }}
                  className="lumora-composer mx-auto flex w-full max-w-3xl flex-col gap-4 overflow-hidden rounded-[26px] p-3 sm:p-5"
                >
                  {/* Source Type Toggle */}
                  <div className="ruixen-source-toggle mx-auto flex w-full max-w-md items-center gap-1 rounded-2xl border border-white/[0.10] bg-[#050817]/75 p-1.5 backdrop-blur-md">
                    <button
                      onClick={() => setSourceType("video")}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${sourceType === "video" ? "bg-[linear-gradient(135deg,rgba(121,57,255,0.78),rgba(49,87,255,0.62))] text-white shadow-[0_0_24px_rgba(119,75,255,0.28)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                    >
                      <Youtube size={15} />
                      YouTube Video
                    </button>
                    <button
                      onClick={() => setSourceType("pdf")}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${sourceType === "pdf" ? "bg-[linear-gradient(135deg,rgba(121,57,255,0.78),rgba(49,87,255,0.62))] text-white shadow-[0_0_24px_rgba(119,75,255,0.28)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
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
                      onUploadingStateChange={handlePdfUploadingState}
                    />
                  )}
                  <SourceSuggestionChips sourceType={sourceType} />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
