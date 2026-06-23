import { useState } from 'react';
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
  X,
  LogOut,
  FileText,
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
import { SettingsModal } from './SettingsModal';
import { UserAvatar } from '@/components/auth/UserAvatar';
import { DeleteChatModal } from './DeleteChatModal';

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<{ id: string; title: string } | null>(null);

  const handleConversationClick = (id: string) => {
    navigate(`/workspace/${id}`);
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return;
    try {
      await deleteConversation(conversationToDelete.id);
      toast.success('Conversation deleted');
      if (conversationId === conversationToDelete.id) {
        navigate('/app');
      }
      setDeleteModalOpen(false);
      setConversationToDelete(null);
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
            transition={{ duration: 0.2 }}
            onClick={toggleSidebar}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={sidebarOpen ? 'open' : 'closed'}
        className="fixed inset-y-0 left-0 z-50 flex shrink-0 overflow-hidden border-r border-[var(--border-soft)] bg-[var(--canvas-subtle)]/90 shadow-xl shadow-black/20 backdrop-blur-2xl lg:relative lg:z-30"
      >
        <div className="flex h-full w-[var(--sidebar-width)] flex-col">
          {/* ── Brand ── */}
          <div className="flex h-[var(--header-height)] items-center justify-between border-b border-[var(--border-soft)] px-4">
            <button
              onClick={() => navigate('/app')}
              className="flex min-w-0 items-center gap-3 rounded-xl pr-2 text-left transition-colors hover:opacity-90"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--border-medium)] bg-[var(--accent-subtle)] text-[var(--accent)]">
                <Sparkles size={16} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">{APP_NAME}</span>
                <span className="block text-[11px] text-[var(--text-muted)]">AI learning workspace</span>
              </span>
            </button>

            <button
              onClick={toggleSidebar}
              aria-label="Close sidebar"
              className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] lg:hidden"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── New Chat CTA ── */}
          <div className="p-3.5">
            <button
              onClick={onNewChat}
              className="group flex w-full items-center gap-3 rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-3)] px-3.5 py-2.5 text-left transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--text-primary)] text-[var(--canvas)] transition-transform group-hover:scale-[1.04]">
                <Plus size={16} strokeWidth={2.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[var(--text-primary)]">New conversation</span>
                <span className="block text-[11px] text-[var(--text-muted)]">Index YouTube / PDF</span>
              </span>
              <ChevronRight size={15} className="text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* ── Navigation ── */}
          <nav className="px-3 space-y-0.5">
            <button
              onClick={() => navigate('/app')}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                !location.pathname.includes('/bookmarks') && !conversationId
                  ? "bg-[var(--surface-active)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              )}
            >
              <LayoutDashboard
                size={15}
                className={!location.pathname.includes('/bookmarks') && !conversationId ? "text-[var(--accent)]" : ""}
              />
              Workspace
            </button>
            <button
              onClick={() => navigate('/bookmarks')}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === '/bookmarks'
                  ? "bg-[var(--surface-active)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              )}
            >
              <Bookmark
                size={15}
                className={location.pathname === '/bookmarks' ? "text-[var(--accent)]" : ""}
              />
              <span className="flex-1">Bookmarks</span>
              {bookmarks.length > 0 && (
                <span className="rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                  {bookmarks.length}
                </span>
              )}
            </button>
          </nav>

          {/* ── History ── */}
          <div className="mt-5 flex min-h-0 flex-1 flex-col px-3">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                History
              </p>
              <span className="rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                {conversations.length}
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pb-4 pr-1 no-scrollbar">
              {isConversationsLoading && conversations.length === 0 ? (
                <div className="space-y-2 p-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 w-full rounded-lg shimmer-loader" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border-soft)] px-4 py-6 text-center">
                  <MessageSquare size={17} className="mx-auto mb-2 text-[var(--text-muted)]" />
                  <p className="text-sm font-medium text-[var(--text-primary)]">No chats yet</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Your indexed sources appear here.</p>
                </div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-0.5"
                >
                  {conversations.map((conv) => {
                    const isActive = conversationId === conv._id;
                    const isPdf = conv.type === "pdf";

                    return (
                      <motion.div key={conv._id} variants={listItemVariants} className="group relative">
                        <button
                          onClick={() => handleConversationClick(conv._id)}
                          className={cn(
                            'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                            isActive
                              ? 'bg-[var(--surface-active)] text-[var(--text-primary)]'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border',
                              isActive
                                ? 'border-[rgba(139,156,247,0.25)] bg-[var(--accent-subtle)] text-[var(--accent)]'
                                : 'border-[var(--border-soft)] bg-[var(--surface-3)] text-[var(--text-muted)]'
                            )}
                          >
                            {isPdf ? <FileText size={13} /> : <MessageSquare size={13} />}
                          </span>
                          <span className="min-w-0 flex-1 pr-7">
                            <span className="block truncate text-sm font-medium">
                              {conv.title.replace(/\*\*/g, "")}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">
                              {formatRelativeTime(new Date(conv.updatedAt))}
                            </span>
                          </span>
                        </button>

                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setConversationToDelete({ id: conv._id, title: conv.title });
                            setDeleteModalOpen(true);
                          }}
                          aria-label={`Delete ${conv.title}`}
                          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-[var(--text-muted)] opacity-0 transition-all hover:bg-[var(--danger-subtle)] hover:text-[var(--danger)] group-hover:opacity-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </div>

          {/* ── User Footer ── */}
          <div className="border-t border-[var(--border-soft)] p-3 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--surface-3)]">
              <UserAvatar name={user?.name || 'Guest'} avatar={user?.avatar} size={34} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-[var(--text-primary)]">{user?.name || 'Guest'}</span>
                <span className="block text-[11px] text-[var(--text-muted)] truncate">{user?.email}</span>
              </span>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--danger-subtle)] hover:text-[var(--danger)] transition-colors"
              >
                <LogOut size={15} />
              </button>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <Settings size={14} />
              <span className="text-xs font-medium">Settings</span>
            </button>
          </div>
        </div>
      </motion.aside>
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <DeleteChatModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setConversationToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        chatTitle={conversationToDelete?.title || ""}
      />
    </>
  );
}
