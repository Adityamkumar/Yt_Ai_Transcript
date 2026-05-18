import React from "react";
import { motion } from "framer-motion";
import { Copy, Bookmark, BookmarkCheck, FileText, Check, Lightbulb, ListChecks, Target, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage, IBookmark, NotesResponse } from "@/types";
import { useBookmarks } from "@/hooks/useBookmarks";
import toast from "react-hot-toast";
import { PDFDownloadButton } from "../pdf/PDFDownloadBtn";

interface NotesMessageProps {
  message: ChatMessage;
  videoId?: string;
}

const MarkdownRenderer = ({ content }: { content: string }) => (
  <div className="markdown-content">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  </div>
);

export function NotesSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4 sm:px-6 animate-pulse">
      <div className="rounded-3xl border border-white/5 bg-[#121212]/30 backdrop-blur-xl h-[600px] flex flex-col">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-white/5 rounded" />
              <div className="h-3 w-48 bg-white/5 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/5" />
            <div className="w-10 h-10 rounded-xl bg-white/5" />
            <div className="w-10 h-10 rounded-xl bg-white/5" />
          </div>
        </div>
        <div className="p-12 space-y-8">
          <div className="h-10 w-1/3 bg-white/5 rounded" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-2/3 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotesMessage({ message, videoId: _videoId }: NotesMessageProps) {
  const { bookmarks, createBookmark, isCreating } = useBookmarks();
  const [copied, setCopied] = React.useState(false);

  const parsedNotes = React.useMemo<NotesResponse | null>(() => {
    if (!message.content) return null;
    try {
      return JSON.parse(message.content);
    } catch {
      return null;
    }
  }, [message.content]);

  if (message.isLoading && !message.content) {
    return <NotesSkeleton />;
  }

  if (!parsedNotes) {
    return <div className="text-red-400 p-6">Failed to load notes.</div>;
  }

  const isBookmarked = bookmarks.some((b: IBookmark) => b.messageId === message._id);

  const handleCopy = async () => {
    try {
      if (!parsedNotes) return;
      const formattedText = `# ${parsedNotes.title}\n${parsedNotes.subtitle}\n\n## Overview\n${parsedNotes.overview.join("\n\n")}\n\n## Main Concepts\n${parsedNotes.mainConcepts.map((c) => `### ${c.heading}\n${c.points.map((p) => `- ${p}`).join("\n")}`).join("\n\n")}\n\n## Key Insights\n${parsedNotes.keyInsights.map((i) => `- ${i}`).join("\n")}\n\n## Actionable Takeaways\n${parsedNotes.actionableTakeaways.map((t) => `- ${t}`).join("\n")}`;
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      toast.success("Notes copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleBookmark = () => {
    if (isCreating || isBookmarked) return;
    createBookmark({
      conversationId: message.conversationId,
      messageId: message._id,
      type: "notes",
      title: parsedNotes.title,
      content: JSON.stringify(parsedNotes),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto my-8 px-4 sm:px-6"
    >
      <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-[#121212]/50 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col gap-5 px-5 sm:px-8 py-6 border-b border-white/5 bg-gradient-to-r from-purple-500/10 via-blue-500/5 to-purple-500/10">
          <div className="flex items-start gap-4 sm:gap-5 min-w-0">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 shrink-0 shadow-lg shadow-purple-500/10">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight mb-1 truncate whitespace-nowrap">
                {parsedNotes.title}
              </h2>
              <p className="text-gray-400 text-sm sm:text-base font-medium tracking-wide leading-relaxed break-words">
                {parsedNotes.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
            <button
              onClick={handleCopy}
              className="h-11 w-11 inline-flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 shrink-0"
            >
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            </button>
            <PDFDownloadButton notes={parsedNotes} />
            <button
              onClick={handleBookmark}
              disabled={isCreating}
              className={`h-11 w-11 inline-flex items-center justify-center rounded-xl transition-all shrink-0 ${
                isBookmarked
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-10 bg-[#0A0A0A] space-y-14">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-7 rounded-full bg-blue-500" />
              <h3 className="text-2xl font-black text-white tracking-tight">Overview</h3>
            </div>
            <div className="space-y-5">
              {parsedNotes.overview?.map((paragraph, index) => (
                <div key={index} className="text-[17px] leading-relaxed text-gray-300 font-medium">
                  <MarkdownRenderer content={paragraph} />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-7 rounded-full bg-purple-500" />
              <h3 className="text-2xl font-black text-white tracking-tight">Main Concepts</h3>
            </div>
            <div className="grid grid-cols-1 gap-8">
              {parsedNotes.mainConcepts?.map((concept, index) => (
                <div key={index} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    {concept.heading}
                  </h4>
                  <ul className="space-y-3">
                    {concept.points?.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-3 group">
                        <div className="mt-2.5 h-1.5 w-1.5 rounded-full bg-purple-500/50 shrink-0 group-hover:bg-purple-400 transition-colors" />
                        <div className="text-gray-300 text-[15px] leading-relaxed">
                          <MarkdownRenderer content={typeof point === 'string' ? point : (point as any).text} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-6">
              <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Key Insights
              </h3>
              <ul className="space-y-3">
                {parsedNotes.keyInsights?.map((insight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-2 h-1.5 w-1.5 rounded-full bg-yellow-400/60 shrink-0" />
                    <div className="text-gray-300 text-sm leading-relaxed">
                      <MarkdownRenderer content={typeof insight === 'string' ? insight : (insight as any).text} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-green-500/10 bg-green-500/5 p-6">
              <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-green-400" />
                Actionable Takeaways
              </h3>
              <ul className="space-y-3">
                {parsedNotes.actionableTakeaways?.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Zap className="w-4 h-4 text-green-400 mt-1 shrink-0" />
                    <span className="text-gray-300 text-sm leading-relaxed">{typeof takeaway === 'string' ? takeaway : (takeaway as any).text || String(takeaway)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {parsedNotes.examples?.length > 0 && (
            <section className="rounded-2xl border border-purple-500/10 bg-purple-500/5 p-6">
              <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Real-world Examples</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {parsedNotes.examples?.map((example, index) => (
                  <li key={index} className="flex items-start gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
                    <span className="text-gray-300 text-sm leading-relaxed">{example}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="h-2 w-full bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600" />
      </div>
    </motion.div>
  );
}
