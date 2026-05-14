import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Copy, Bookmark, BookmarkCheck, FileText, Check } from 'lucide-react';
import { ChatMessage, IBookmark } from '@/types';
import { useBookmarks } from '@/hooks/useBookmarks';
import toast from 'react-hot-toast';

interface NotesMessageProps {
  message: ChatMessage;
}

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
          <div className="h-8 w-1/4 bg-white/5 rounded" />
          <div className="grid grid-cols-1 gap-4">
            <div className="h-12 w-full bg-white/5 rounded-xl" />
            <div className="h-12 w-full bg-white/5 rounded-xl" />
            <div className="h-12 w-full bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotesMessage({ message }: NotesMessageProps) {
  const { bookmarks, createBookmark, deleteBookmark, isCreating } = useBookmarks();
  const [copied, setCopied] = React.useState(false);

  if (message.isLoading && !message.content) {
    return <NotesSkeleton />;
  }

  const isBookmarked = bookmarks.some((b: IBookmark) => b.messageId === message._id);

  const getDynamicMetaData = (content: string) => {
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    let title = 'Knowledge Base';
    let subtitle = 'Topic-specific knowledge extraction';

    if (lines.length >= 2 && lines[0].startsWith('#')) {
      const firstLine = lines[0].replace(/^#+\s+/, '').replace(/[#*`]/g, '').trim();
      const secondLine = lines[1].replace(/[#*`]/g, '').trim();
      
      const genericWords = ['overview', 'summary', 'introduction', 'conclusion', 'notes', 'smart notes'];
      if (!genericWords.some(word => firstLine.toLowerCase() === word)) {
        title = firstLine.length > 40 ? `${firstLine.substring(0, 40)}...` : firstLine;
        subtitle = secondLine;
      }
    }
    
    return { title, subtitle };
  };

  const { title: dynamicTitle, subtitle: dynamicSubtitle } = getDynamicMetaData(message.content);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Notes copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy notes');
    }
  };

  const handleBookmark = () => {
    if (isCreating) return;

    if (isBookmarked) {
      toast('Already in your bookmarks', {
        icon: '🔖',
        style: {
          background: '#1A1A1A',
          color: '#F5F7FF',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      });
      return;
    }

    createBookmark({
      conversationId: message.conversationId,
      messageId: message._id,
      type: 'notes',
      title: dynamicTitle,
      content: message.content,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto my-8 px-4 sm:px-6"
    >
      <div 
        id={`notes-${message._id}`}
        className="relative group overflow-hidden rounded-3xl border border-white/10 bg-[#121212]/50 backdrop-blur-xl shadow-2xl transition-all hover:border-purple-500/30"
      >
        <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-lg font-black text-white tracking-tight leading-tight">
                  {dynamicTitle}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  Verified
                </span>
              </div>
              <p className="text-sm text-gray-400 font-medium line-clamp-1">{dynamicSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 border border-white/5"
              title="Copy Notes"
            >
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            </button>

            <button
              onClick={handleBookmark}
              disabled={isCreating}
              className={`p-2.5 rounded-xl transition-all active:scale-95 border ${
                isBookmarked 
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-white/5'
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Notes"}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-5 h-5 fill-current" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 prose prose-invert prose-purple max-w-none bg-[#0A0A0A]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => {
                const text = String(children);
                if (text === dynamicTitle || dynamicTitle.startsWith(text.substring(0, 15))) {
                  return null;
                }
                return (
                  <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mt-10 mb-6 first:mt-0 tracking-tight">
                    {children}
                  </h1>
                );
              },
              p: ({ children }) => {
                const text = String(children);
                if (text === dynamicSubtitle || dynamicSubtitle.startsWith(text.substring(0, 20))) {
                  return null;
                }
                return (
                  <p className="text-gray-300 leading-[1.7] mb-5 text-base font-medium opacity-90">
                    {children}
                  </p>
                );
              },
              ul: ({ children }) => (
                <ul className="space-y-4 my-8 list-none p-0">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="space-y-4 my-8 list-decimal pl-6 text-gray-300">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="flex items-start gap-4 text-gray-300 mb-4">
                  <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-purple-500 ring-4 ring-purple-500/20 flex-shrink-0" />
                  <div className="text-base leading-relaxed font-medium flex-1">{children}</div>
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-white bg-white/5 px-1 rounded mx-0.5">
                  {children}
                </strong>
              ),
              code: ({ children }) => (
                <code className="bg-white/10 text-purple-300 px-1.5 py-0.5 rounded font-mono text-sm">
                  {children}
                </code>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500/50 bg-blue-500/5 px-8 py-6 rounded-r-2xl italic text-blue-200 my-10 shadow-inner">
                  {children}
                </blockquote>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 animate-gradient-x" />
      </div>
    </motion.div>
  );
}
