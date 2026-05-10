import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useStore } from '@/store/useAppStore';
import { APP_NAME } from '@/constants';
import { formatRelativeTime } from '@/utils';
import { listItemVariants, sidebarVariants, staggerContainer } from '@/animations/variants';
import { cn } from '@/utils/cn';

interface SidebarProps {
  onNewChat: () => void;
}

export function Sidebar({ onNewChat }: SidebarProps) {
  const { state, setActiveSession, deleteSession, toggleSidebar } = useStore();
  const { sessions, activeSessionId, sidebarOpen } = state;

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
              onClick={onNewChat}
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
              className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.075] px-3.5 py-3 text-left shadow-sm transition hover:border-white/[0.16] hover:bg-white/[0.11]"
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

          <nav className="px-3">
            <button className="flex w-full items-center gap-3 rounded-xl bg-white/[0.055] px-3 py-2.5 text-sm font-medium text-white">
              <LayoutDashboard size={16} className="text-[var(--accent)]" />
              Workspace
            </button>
          </nav>

          <div className="mt-5 flex min-h-0 flex-1 flex-col px-3">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                History
              </p>
              <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
                {sessions.length}
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pb-4 pr-1 no-scrollbar">
              {sessions.length === 0 ? (
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
                  {sessions.map((session) => {
                    const isActive = activeSessionId === session.id;

                    return (
                      <motion.div key={session.id} variants={listItemVariants} className="group relative">
                        <button
                          onClick={() => setActiveSession(session.id)}
                          className={cn(
                            'flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition',
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
                            <span className="block truncate text-sm font-medium">{session.title}</span>
                            <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                              {formatRelativeTime(session.updatedAt)}
                            </span>
                          </span>
                        </button>

                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteSession(session.id);
                          }}
                          aria-label={`Delete ${session.title}`}
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

          <div className="border-t border-white/[0.07] p-3">
            <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/[0.055]">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[0.1] bg-white/[0.055] text-[var(--text-secondary)]">
                <User size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">Aditya Kumar</span>
                <span className="block text-xs text-[var(--text-muted)]">Personal workspace</span>
              </span>
              <Settings size={16} className="text-[var(--text-muted)]" />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
