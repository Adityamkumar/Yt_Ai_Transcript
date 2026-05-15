import { AnimatePresence, motion } from 'framer-motion';
import {
  Bookmark,
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  User,
  X,
  LogOut,
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useConversations } from '@/hooks/useConversations';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useUIStore } from '@/store/useUIStore';
import { APP_NAME } from '@/constants';
import { formatRelativeTime } from '@/utils';
import { listItemVariants, sidebarVariants, staggerContainer } from '@/animations/variants';
import { cn } from '@/utils/cn';
import { useAuth } from '@/store/AuthContext';

interface SidebarProps {
  onNewChat: () => void;
}

export function Sidebar({ onNewChat }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { conversations, isLoading: isConversationsLoading, deleteConversation } = useConversations();
  const { bookmarks } = useBookmarks();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuth();

  const handleConversationClick = (id: string) => {
    navigate(`/workspace/${id}`);
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      toast.success('Conversation deleted');
      if (conversationId === id) {
        navigate('/app');
      }
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  };

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            aria-label="Close sidebar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={sidebarOpen ? 'open' : 'closed'}
        className="fixed inset-y-0 left-0 z-50 flex shrink-0 overflow-hidden border-r border-white/[0.08] bg-[#090b10]/88 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:relative lg:z-30"
      >
        <div className="flex h-full w-[var(--sidebar-width)] flex-col">
          <div className="flex h-[var(--header-height)] items-center justify-between border-b border-white/[0.07] px-4">
            <button
              onClick={() => navigate('/app')}
              className="flex min-w-0 items-center gap-3 rounded-xl pr-2 text-left"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.1] bg-white/[0.06] text-[var(--accent)] shadow-sm">
                <Sparkles size={17} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{APP_NAME}</span>
                <span className="block text-xs text-[var(--text-muted)]">AI video workspace</span>
              </span>
            </button>

            <button
              onClick={toggleSidebar}
              aria-label="Close sidebar"
              className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] transition hover:bg-white/[0.06] hover:text-white lg:hidden"
            >
              <X size={17} />
            </button>
          </div>

          <div className="p-4">
            <button
              onClick={onNewChat}
              className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.075] px-3.5 py-2.5 text-left shadow-sm transition hover:border-white/[0.16] hover:bg-white/[0.11]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-neutral-950 transition group-hover:scale-[1.03]">
                <Plus size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">New conversation</span>
                <span className="block text-xs text-[var(--text-muted)]">Index another video</span>
              </span>
              <ChevronRight size={16} className="text-[var(--text-muted)] transition group-hover:translate-x-0.5" />
            </button>
          </div>

          <nav className="px-3 space-y-1">
            <button 
              onClick={() => navigate('/app')}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                !location.pathname.includes('/bookmarks') && !conversationId ? "bg-white/[0.055] text-white" : "text-[var(--text-muted)] hover:text-white"
              )}
            >
              <LayoutDashboard size={16} className={!location.pathname.includes('/bookmarks') && !conversationId ? "text-[var(--accent)]" : ""} />
              Workspace
            </button>
            <button 
              onClick={() => navigate('/bookmarks')}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                location.pathname === '/bookmarks' ? "bg-white/[0.055] text-white" : "text-[var(--text-muted)] hover:text-white"
              )}
            >
              <Bookmark size={16} className={location.pathname === '/bookmarks' ? "text-[var(--accent)]" : ""} />
              <span className="flex-1">Bookmarks</span>
              {bookmarks.length > 0 && (
                <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                  {bookmarks.length}
                </span>
              )}
            </button>
          </nav>

          <div className="mt-5 flex min-h-0 flex-1 flex-col px-3">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                History
              </p>
              <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
                {conversations.length}
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pb-4 pr-1 no-scrollbar">
              {isConversationsLoading && conversations.length === 0 ? (
                 <div className="space-y-2 p-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-10 w-full rounded-lg bg-white/[0.03] animate-pulse" />
                    ))}
                 </div>
              ) : conversations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/[0.08] px-4 py-6 text-center">
                  <MessageSquare size={18} className="mx-auto mb-2 text-[var(--text-muted)]" />
                  <p className="text-sm font-medium text-white">No chats yet</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Your indexed videos appear here.</p>
                </div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-1"
                >
                  {conversations.map((conv) => {
                    const isActive = conversationId === conv._id;

                    return (
                      <motion.div key={conv._id} variants={listItemVariants} className="group relative">
                        <button
                          onClick={() => handleConversationClick(conv._id)}
                          className={cn(
                            'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition',
                            isActive
                              ? 'bg-white/[0.075] text-white shadow-sm'
                              : 'text-[var(--text-secondary)] hover:bg-white/[0.045] hover:text-white'
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border',
                              isActive
                                ? 'border-[rgba(139,156,255,0.32)] bg-[rgba(139,156,255,0.14)] text-[var(--accent)]'
                                : 'border-white/[0.08] bg-white/[0.035] text-[var(--text-muted)]'
                            )}
                          >
                            <MessageSquare size={14} />
                          </span>
                          <span className="min-w-0 flex-1 pr-7">
                            <span className="block truncate text-sm font-medium">
                              {conv.title.replace(/\*\*/g, "")}
                            </span>
                            <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                              {formatRelativeTime(new Date(conv.updatedAt))}
                            </span>
                          </span>
                        </button>

                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteConversation(conv._id);
                          }}
                          aria-label={`Delete ${conv.title}`}
                          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[var(--text-muted)] opacity-0 transition hover:bg-[rgba(251,113,133,0.12)] hover:text-[var(--danger)] group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </div>

          <div className="border-t border-white/[0.07] p-3 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/[0.03]">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[0.1] bg-white/[0.055] text-[var(--text-secondary)]">
                <User size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">{user?.name || 'Guest'}</span>
                <span className="block text-xs text-[var(--text-muted)] truncate">{user?.email}</span>
              </span>
              <button 
                onClick={logout}
                title="Logout"
                className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white/[0.055] text-[var(--text-muted)] hover:text-white">
              <Settings size={15} />
              <span className="text-xs font-medium">Settings</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
