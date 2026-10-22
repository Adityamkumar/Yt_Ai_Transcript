import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  Bookmark,
  MessageSquare,
  PanelLeft,
  Sparkles,
  Trash2,
  Pin,
  SquarePen,
  X,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useConversations } from "@/hooks/useConversations";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useUIStore } from "@/store/useUIStore";
import { APP_NAME } from "@/constants";
import { listItemVariants, sidebarVariants, staggerContainer } from "@/animations/variants";
import { cn } from "@/utils/cn";
import { Tooltip } from "@/components/ui/Tooltip";
import { DeleteChatModal } from "./DeleteChatModal";

interface SidebarProps {
  onNewChat: () => void;
}

function ConversationTitle({ title }: { title: string }) {
  const label = title.replace(/\*\*/g, "");
  const measureRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);

  useEffect(() => {
    const element = measureRef.current;
    if (!element) return;

    const update = () => setOverflow(Math.max(0, element.scrollWidth - element.clientWidth));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [label]);

  return (
    <span ref={measureRef} className="relative block overflow-hidden text-[13px] font-medium leading-5">
      <span className={cn("block truncate", overflow > 0 && "group-hover:opacity-0")}>{label}</span>
      {overflow > 0 && (
        <span className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <span
            className="sidebar-title-marquee block w-max whitespace-nowrap"
            style={{ "--title-shift": `-${overflow}px` } as React.CSSProperties}
          >
            {label}
          </span>
        </span>
      )}
    </span>
  );
}

export function Sidebar({ onNewChat }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const {
    conversations,
    isLoading: isConversationsLoading,
    deleteConversation,
    updateConversationPin,
  } = useConversations();
  const { bookmarks } = useBookmarks();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false,
  );

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const handleConversationClick = (id: string) => {
    void navigate(`/workspace/${id}`);
    if (isMobile) {
      toggleSidebar();
    }
  };

  const handleNewChatClick = () => {
    onNewChat();
    if (isMobile) {
      toggleSidebar();
    }
  };

  const handleLogoClick = () => {
    void navigate("/app");
    if (isMobile) {
      toggleSidebar();
    }
  };

  const handleBookmarksClick = () => {
    void navigate("/bookmarks");
    if (isMobile) {
      toggleSidebar();
    }
  };

  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return;
    try {
      await deleteConversation(conversationToDelete.id);
      toast.success("Conversation deleted");
      if (conversationId === conversationToDelete.id) {
        void navigate("/app");
      }
      setDeleteModalOpen(false);
      setConversationToDelete(null);
    } catch {
      toast.error("Failed to delete conversation");
    }
  };

  const handleConversationPin = async (id: string, isPinned: boolean) => {
    try {
      await updateConversationPin({ conversationId: id, isPinned: !isPinned });
      toast.success(isPinned ? "Conversation unpinned" : "Conversation pinned");
    } catch {
      toast.error("Failed to update conversation pin");
    }
  };

  const pinnedConversations = conversations.filter((conversation) => conversation.isPinned);
  const historyConversations = conversations.filter((conversation) => !conversation.isPinned);

  const mobileVariants: Variants = {
    open: {
      x: "0%",
      width: "min(85vw, 280px)",
      transition: { duration: 0.24, ease: [0.25, 0.1, 0.25, 1.0] as const },
    },
    closed: {
      x: "-105%",
      width: "min(85vw, 280px)",
      transition: { duration: 0.24, ease: [0.25, 0.1, 0.25, 1.0] as const },
    },
  };

  const renderConversationList = (items: typeof conversations) => (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-0.5"
    >
      {items.map((conv) => {
        const isActive = conversationId === conv._id;
        return (
          <motion.div key={conv._id} variants={listItemVariants} className="group relative">
            <button
              onClick={() => handleConversationClick(conv._id)}
              className={cn(
                "flex w-full items-start rounded-lg px-3 py-2.5 text-left transition-colors",
                isActive
                  ? "bg-[rgba(157,165,255,0.12)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.045)] hover:text-[var(--text-primary)]",
              )}
            >
              <span className="min-w-0 flex-1 pr-10">
                <ConversationTitle title={conv.title} />
              </span>
            </button>
            <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center opacity-100 transition-all lg:opacity-0 lg:group-hover:opacity-100">
              <Tooltip content={conv.isPinned ? "Unpin conversation" : "Pin conversation"} side="top">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleConversationPin(conv._id, conv.isPinned);
                  }}
                  aria-label={`${conv.isPinned ? "Unpin" : "Pin"} ${conv.title}`}
                  className="grid h-6 w-6 place-items-center rounded-md text-[var(--text-muted)] transition-all hover:bg-[rgba(157,165,255,0.12)] hover:text-[var(--accent)]"
                >
                  <Pin size={13} className={conv.isPinned ? "fill-current" : ""} />
                </button>
              </Tooltip>
              <Tooltip content="Delete conversation" side="top">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setConversationToDelete({ id: conv._id, title: conv.title });
                    setDeleteModalOpen(true);
                  }}
                  aria-label={`Delete ${conv.title}`}
                  className="grid h-6 w-6 place-items-center rounded-md text-[var(--text-muted)] transition-all hover:bg-[var(--danger-subtle)] hover:text-[var(--danger)]"
                >
                  <Trash2 size={13} />
                </button>
              </Tooltip>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );

  return (
    <>
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.button
            aria-label="Close sidebar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={toggleSidebar}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        variants={isMobile ? mobileVariants : sidebarVariants}
        initial={false}
        animate={sidebarOpen ? "open" : "closed"}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex shrink-0 overflow-hidden border-r border-[var(--border-soft)] bg-[rgba(8,9,12,0.96)] shadow-2xl shadow-black/40 backdrop-blur-2xl lg:relative lg:z-30",
          isMobile && !sidebarOpen && "pointer-events-none",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {sidebarOpen || isMobile ? (
            /* ═══════════════════════════════════════
               EXPANDED SIDEBAR / MOBILE DRAWER
               ═══════════════════════════════════════ */
            <motion.div
              key="sidebar-open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex h-full w-[264px] max-w-[85vw] flex-col"
            >
              {/* Brand Header */}
              <div className="flex h-[var(--header-height)] items-center justify-between border-b border-[var(--border-soft)] px-3.5 bg-[rgba(255,255,255,0.015)]">
                <button
                  onClick={handleLogoClick}
                  aria-label="Lumora"
                  className="flex min-w-0 items-center gap-3 rounded-xl pr-2 text-left transition-colors hover:opacity-90"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[rgba(157,165,255,0.2)] bg-[rgba(157,165,255,0.12)] text-[var(--accent)] shadow-[0_10px_24px_rgba(157,165,255,0.08)]">
                    <Sparkles size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">
                      {APP_NAME}
                    </span>
                    <span className="block text-[11px] text-[var(--text-muted)]">
                      AI learning workspace
                    </span>
                  </span>
                </button>

                <Tooltip content={isMobile ? "Close sidebar" : "Collapse sidebar"} shortcut={isMobile ? undefined : "Ctrl+B"} side="bottom">
                  <button
                    onClick={toggleSidebar}
                    style={{ cursor: "ew-resize" }}
                    aria-label={isMobile ? "Close sidebar" : "Collapse sidebar"}
                    className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-ew-resize"
                  >
                    {isMobile ? <X size={17} /> : <PanelLeft size={16} />}
                  </button>
                </Tooltip>
              </div>

              {/* Primary Actions: Compact New Chat row + Bookmarks */}
              <div className="p-3 space-y-1">
                <button
                  onClick={handleNewChatClick}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <SquarePen size={16} className="shrink-0 text-[var(--text-muted)]" />
                  <span className="truncate">New chat</span>
                </button>

                <button
                  onClick={handleBookmarksClick}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    location.pathname === "/bookmarks"
                      ? "bg-[rgba(157,165,255,0.12)] text-[var(--text-primary)]"
                      : "text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.045)] hover:text-[var(--text-primary)]",
                  )}
                >
                  <Bookmark
                    size={16}
                    className={location.pathname === "/bookmarks" ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}
                  />
                  <span className="flex-1 text-left">Bookmarks</span>
                  {bookmarks.length > 0 && (
                    <span className="rounded-full bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                      {bookmarks.length}
                    </span>
                  )}
                </button>
              </div>

              {/* History Section */}
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 no-scrollbar pb-4">
                {pinnedConversations.length > 0 && (
                  <div className="mb-5">
                    <div className="mb-2 flex items-center px-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Pinned
                      </p>
                    </div>
                    {renderConversationList(pinnedConversations)}
                  </div>
                )}
                <div className="mb-2 flex items-center justify-between px-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Recents
                  </p>
                  <span className="rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                    {historyConversations.length}
                  </span>
                </div>

                <div className="pb-4 pr-1">
                  {isConversationsLoading && conversations.length === 0 ? (
                    <div className="space-y-2 p-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-10 w-full rounded-lg shimmer-loader" />
                      ))}
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[var(--border-soft)] px-4 py-6 text-center bg-[rgba(255,255,255,0.02)]">
                      <MessageSquare size={17} className="mx-auto mb-2 text-[var(--text-muted)]" />
                      <p className="text-sm font-medium text-[var(--text-primary)]">No chats yet</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Your indexed sources appear here.
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                      className="space-y-0.5"
                    >
                      {historyConversations.map((conv) => {
                        const isActive = conversationId === conv._id;
                        return (
                          <motion.div
                            key={conv._id}
                            variants={listItemVariants}
                            className="group relative"
                          >
                            <button
                              onClick={() => handleConversationClick(conv._id)}
                              className={cn(
                                "flex w-full items-start rounded-lg px-3 py-2.5 text-left transition-colors",
                                isActive
                                  ? "bg-[rgba(157,165,255,0.12)] text-[var(--text-primary)]"
                                  : "text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.045)] hover:text-[var(--text-primary)]",
                              )}
                            >
                              <span className="min-w-0 flex-1 pr-10">
                                <ConversationTitle title={conv.title} />
                              </span>
                            </button>

                            <Tooltip content={conv.isPinned ? "Unpin conversation" : "Pin conversation"} side="top">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleConversationPin(conv._id, conv.isPinned);
                                }}
                                aria-label={`${conv.isPinned ? "Unpin" : "Pin"} ${conv.title}`}
                                className="absolute right-7.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-[var(--text-muted)] opacity-100 transition-all hover:bg-[rgba(157,165,255,0.12)] hover:text-[var(--accent)] lg:opacity-0 lg:group-hover:opacity-100"
                              >
                                <Pin size={13} className={conv.isPinned ? "fill-current" : ""} />
                              </button>
                            </Tooltip>
                            <Tooltip content="Delete conversation" side="top">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setConversationToDelete({ id: conv._id, title: conv.title });
                                  setDeleteModalOpen(true);
                                }}
                                aria-label={`Delete ${conv.title}`}
                                className="absolute right-1.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-[var(--text-muted)] opacity-100 transition-all hover:bg-[var(--danger-subtle)] hover:text-[var(--danger)] lg:opacity-0 lg:group-hover:opacity-100"
                              >
                                <Trash2 size={13} />
                              </button>
                            </Tooltip>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* ═══════════════════════════════════════
               DESKTOP COLLAPSED SIDEBAR (60px)
               ═══════════════════════════════════════ */
            <motion.div
              key="sidebar-closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex h-full w-[60px] flex-col items-center"
            >
              {/* Header Logo */}
              <div className="flex h-[var(--header-height)] w-full items-center justify-center border-b border-[var(--border-soft)] bg-[rgba(255,255,255,0.015)]">
                <Tooltip content="Lumora" side="right">
                  <button
                    onClick={handleLogoClick}
                    aria-label="Lumora"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-[rgba(157,165,255,0.2)] bg-[rgba(157,165,255,0.12)] text-[var(--accent)] shadow-[0_10px_24px_rgba(157,165,255,0.08)] transition-transform hover:scale-105"
                  >
                    <Sparkles size={16} />
                  </button>
                </Tooltip>
              </div>

              {/* Action Icons: Toggle, New Chat, Bookmarks */}
              <div className="flex flex-col items-center gap-2 pt-3 px-2">
                <Tooltip content="Toggle sidebar" shortcut="Ctrl+B" side="right">
                  <button
                    onClick={toggleSidebar}
                    style={{ cursor: "ew-resize" }}
                    aria-label="Toggle sidebar"
                    className="grid h-9 w-9 place-items-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-primary)] cursor-ew-resize"
                  >
                    <PanelLeft size={16} />
                  </button>
                </Tooltip>

                <Tooltip content="New chat" side="right">
                  <button
                    onClick={handleNewChatClick}
                    aria-label="New chat"
                    className="grid h-9 w-9 place-items-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
                  >
                    <SquarePen size={16} />
                  </button>
                </Tooltip>

                <Tooltip
                  content={bookmarks.length > 0 ? `Bookmarks (${bookmarks.length})` : "Bookmarks"}
                  side="right"
                >
                  <button
                    onClick={handleBookmarksClick}
                    aria-label="Bookmarks"
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-xl transition-colors relative",
                      location.pathname === "/bookmarks"
                        ? "bg-[rgba(157,165,255,0.14)] text-[var(--accent)]"
                        : "text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-[var(--text-primary)]",
                    )}
                  >
                    <Bookmark size={16} />
                    {bookmarks.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                    )}
                  </button>
                </Tooltip>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

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
