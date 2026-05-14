import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Trash2, MessageSquare, ExternalLink } from 'lucide-react';
import { IBookmark } from '@/types';
import { formatRelativeTime } from '@/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';

interface BookmarkCardProps {
  bookmark: IBookmark;
  onDelete: (id: string) => void;
}

export function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
  const navigate = useNavigate();
  const conversation = typeof bookmark.conversationId === 'object' ? bookmark.conversationId : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col rounded-3xl border border-white/10 bg-[#1A1A1A]/40 backdrop-blur-md overflow-hidden transition-all hover:border-purple-500/30 hover:bg-purple-500/5 shadow-lg"
    >
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-0.5">
                {bookmark.type}
              </span>
              <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight">{bookmark.title}</h3>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(bookmark._id);
            }}
            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="prose prose-invert prose-sm max-w-none line-clamp-4 text-gray-400 mb-6 text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {bookmark.content}
          </ReactMarkdown>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            {formatRelativeTime(new Date(bookmark.createdAt))}
          </div>
          
          {conversation && (
            <button
              onClick={() => navigate(`/workspace/${conversation._id}`)}
              className="flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="max-w-[100px] truncate">{conversation.title}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}
