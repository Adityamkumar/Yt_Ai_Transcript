import React from "react";
import { motion } from "framer-motion";
import { Copy, Bookmark, BookmarkCheck, FileText, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage, IBookmark } from "@/types";
import { useBookmarks } from "@/hooks/useBookmarks";

import toast from "react-hot-toast";

import { PDFDownloadButton } from "../pdf/PDFDownloadBtn";

interface NotesMessageProps {
  message: ChatMessage;
}

const MarkdownRenderer = ({ content }: { content: string }) => (
  <div className="markdown-content">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
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

export function NotesMessage({ message }: NotesMessageProps) {
  const { bookmarks, createBookmark, isCreating } = useBookmarks();

  const [copied, setCopied] = React.useState(false);

  const parsedNotes = React.useMemo(() => {
    if (!message.content) return null;
    try {
      return JSON.parse(message.content);
    } catch (err) {
      return null;
    }
  }, [message.content]);

  if (message.isLoading && !message.content) {
    return <NotesSkeleton />;
  }

  if (!parsedNotes) {
    return <div className="text-red-400 p-6">Failed to load notes.</div>;
  }

  const isBookmarked = bookmarks.some(
    (b: IBookmark) => b.messageId === message._id,
  );

  const handleCopy = async () => {
    try {
      const formattedText = `
${parsedNotes.title}

${parsedNotes.subtitle}

OVERVIEW
${parsedNotes.overview.join("\n")}

KEY INSIGHTS
${parsedNotes.keyInsights.join("\n")}
`;

      await navigator.clipboard.writeText(formattedText);

      setCopied(true);

      toast.success("Notes copied to clipboard");

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy notes");
    }
  };

  const handleBookmark = () => {
    if (isCreating) return;

    if (isBookmarked) {
      toast("Already bookmarked", {
        icon: "🔖",
      });

      return;
    }

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
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="w-full max-w-4xl mx-auto my-8 px-4 sm:px-6"
    >
      <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-[#121212]/50 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-6 sm:px-8 py-6 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h2 className="text-xl sm:text-lg font-black text-white tracking-tight leading-tight">
                  {parsedNotes.title.replace(/\*\*/g, "")}
                </h2>

                <span className="w-fit px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-wider shrink-0">
                  Verified
                </span>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed">{parsedNotes.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end border-t sm:border-t-0 border-white/5 pt-6 sm:pt-0">
            <button
              onClick={handleCopy}
              title="Copy to clipboard"
              className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 shrink-0"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>

            <PDFDownloadButton notes={parsedNotes} />

            <button
              onClick={handleBookmark}
              disabled={isCreating}
              title={isBookmarked ? "Already bookmarked" : "Save to bookmarks"}
              className={`p-2.5 rounded-xl transition-all shrink-0 ${
                isBookmarked
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-5 h-5 fill-current" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-[#0A0A0A] space-y-10">
          <section>
            <h3 className="text-3xl font-black text-white mb-6">Overview</h3>

            <ul className="space-y-4">
              {parsedNotes.overview.map((item: string, index: number) => (
                <li
                  key={index}
                  className="flex items-start gap-4 text-gray-300"
                >
                  <div className="mt-2 h-2 w-2 rounded-full bg-purple-500" />

                  <div className="flex-1 min-w-0">
                    <MarkdownRenderer content={item} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-3xl font-black text-white mb-6">
              Main Concepts
            </h3>

            <div className="space-y-8">
              {parsedNotes.mainConcepts.map((concept: any, index: number) => (
                <div key={index}>
                  <h4 className="text-xl font-bold text-purple-300 mb-4">
                    {concept.heading}
                  </h4>

                  <ul className="space-y-3">
                    {concept.points.map((point: string, pointIndex: number) => (
                      <li
                        key={pointIndex}
                        className="flex items-start gap-4 text-gray-300"
                      >
                        <div className="mt-2 h-2 w-2 rounded-full bg-blue-400" />

                        <div className="flex-1 min-w-0">
                          <MarkdownRenderer content={point} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-3xl font-black text-white mb-6">
              Key Insights
            </h3>

            <ul className="space-y-4">
              {parsedNotes.keyInsights.map((item: string, index: number) => (
                <li
                  key={index}
                  className="flex items-start gap-4 text-gray-300"
                >
                  <div className="mt-2 h-2 w-2 rounded-full bg-green-400" />

                  <div className="flex-1 min-w-0">
                    <MarkdownRenderer content={item} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-3xl font-black text-white mb-6">
              Actionable Takeaways
            </h3>

            <ul className="space-y-4">
              {parsedNotes.actionableTakeaways.map(
                (item: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-4 text-gray-300"
                  >
                    <div className="mt-2 h-2 w-2 rounded-full bg-yellow-400" />

                    <div className="flex-1 min-w-0">
                      <MarkdownRenderer content={item} />
                    </div>
                  </li>
                ),
              )}
            </ul>
          </section>

          <section>
            <h3 className="text-3xl font-black text-white mb-6">Examples</h3>

            <ul className="space-y-4">
              {parsedNotes.examples.map((item: string, index: number) => (
                <li
                  key={index}
                  className="flex items-start gap-4 text-gray-300"
                >
                  <div className="mt-2 h-2 w-2 rounded-full bg-pink-400" />

                  <div className="flex-1 min-w-0">
                    <MarkdownRenderer content={item} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-3xl font-black text-white mb-6">
              Final Summary
            </h3>

            <ul className="space-y-4">
              {parsedNotes.summary.map((item: string, index: number) => (
                <li
                  key={index}
                  className="flex items-start gap-4 text-gray-300"
                >
                  <div className="mt-2 h-2 w-2 rounded-full bg-purple-400" />

                  <div className="flex-1 min-w-0">
                    <MarkdownRenderer content={item} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600" />
      </div>
    </motion.div>
  );
}
