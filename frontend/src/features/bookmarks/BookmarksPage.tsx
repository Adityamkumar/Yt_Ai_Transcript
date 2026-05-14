import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Search, Inbox, Loader2 } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { BookmarkCard } from './BookmarkCard';
import { fadeIn, staggerContainer } from '@/animations/variants';

export default function BookmarksPage() {
  const { bookmarks, isLoading, deleteBookmark } = useBookmarks();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredBookmarks = bookmarks.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeIn}
      className="flex flex-col h-full min-h-0 bg-[#0A0A0B]"
    >
      <div className="border-b border-white/5 bg-[#0D0D0F]/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-10 sm:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Bookmarks</h1>
              </div>
              <p className="text-gray-400 text-lg max-w-xl">
                Your permanent library of AI-generated insights, notes, and key moments from YouTube.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 sm:p-10">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
              <p className="text-gray-400 font-medium">Curating your knowledge base...</p>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-40 px-6 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-dashed border-white/10">
                <Inbox className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No bookmarks found</h3>
              <p className="text-gray-500 max-w-sm">
                {searchQuery ? "We couldn't find anything matching your search." : "Start bookmarking important insights from your chat workspace to see them here."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 pb-20"
            >
              <AnimatePresence mode="popLayout">
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark._id}
                    bookmark={bookmark}
                    onDelete={deleteBookmark}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
