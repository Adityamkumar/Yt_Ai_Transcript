import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, PanelLeft, Search, Settings, SquarePen } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { useUIStore } from "@/store/useUIStore";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { SettingsModal } from "@/components/SettingsModal";
import { LogoutModal } from "@/components/LogoutModal";
import { Tooltip } from "@/components/ui/Tooltip";

interface HeaderProps {
  onSearchOpen?: () => void;
  onNewChat?: () => void;
  workspaceActions?: React.ReactNode;
}

export function Header({ onSearchOpen, onNewChat, workspaceActions }: HeaderProps) {
  const { user, logout } = useAuth();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { conversations } = useConversations();
  const { toggleSidebar } = useUIStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const activeConversation = conversations.find((conversation) => conversation._id === conversationId);

  const isConversationView = !!activeConversation;

  useEffect(() => {
    if (!profileOpen) return;
    const onOutsideClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", onOutsideClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [profileOpen]);

  /* ── Mobile Top-Left Actions: New Chat & Toggle Sidebar (matching reference screenshot) ── */
  const mobileLeftActions = (
    <div className="flex items-center gap-1.5 lg:hidden">
      <Tooltip content="New chat" side="bottom">
        <button
          onClick={onNewChat}
          aria-label="New chat"
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.12] bg-[#121318]/90 text-neutral-300 shadow-sm transition-colors hover:border-white/[0.22] hover:bg-white/[0.09] hover:text-white active:scale-95"
        >
          <SquarePen size={16} />
        </button>
      </Tooltip>
      <Tooltip content="Toggle sidebar" shortcut="Ctrl+B" side="bottom">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          style={{ cursor: "ew-resize" }}
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.12] bg-[#121318]/90 text-neutral-300 shadow-sm transition-colors hover:border-white/[0.22] hover:bg-white/[0.09] hover:text-white active:scale-95 cursor-ew-resize"
        >
          <PanelLeft size={16} />
        </button>
      </Tooltip>
    </div>
  );

  /* ── Shared: profile avatar + black dropdown (vertically centered with search) ── */
  const profileSection = (
    <div ref={profileRef} className="relative flex items-center shrink-0">
      <button
        onClick={() => setProfileOpen((open) => !open)}
        aria-label="Open account menu"
        aria-expanded={profileOpen}
        className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9da5ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#090a10]"
      >
        <UserAvatar name={user?.name || "Guest"} avatar={user?.avatar} size={34} />
      </button>
      <AnimatePresence>
        {profileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-white/[0.10] bg-[#0a0a0a] p-1.5 shadow-[0_22px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 rounded-xl px-3 py-3">
              <UserAvatar name={user?.name || "Guest"} avatar={user?.avatar} size={38} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{user?.name || "Guest"}</span>
                <span className="block truncate text-xs text-[var(--text-muted)]">{user?.email || ""}</span>
              </span>
            </div>
            <div className="my-1 h-px bg-white/[0.08]" />
            <button
              onClick={() => { setProfileOpen(false); setSettingsOpen(true); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#c5cbe5] transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              <Settings size={16} /> Settings
            </button>
            <button
              onClick={() => { setProfileOpen(false); setLogoutOpen(true); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#c5cbe5] transition-colors hover:bg-red-400/[0.09] hover:text-red-300"
            >
              <LogOut size={16} /> Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <header className="relative z-20 flex h-[var(--header-height)] w-full shrink-0 items-center bg-transparent">
        <div className="flex h-full w-full items-center justify-between gap-2 px-3 sm:gap-3 sm:px-5">

          {isConversationView ? (
            /* ═══════════════════════════════════════
               CONVERSATION HEADER
               - Mobile: New Chat & Toggle Sidebar on left
               - Desktop: Clean spacing
               - Right: workspace actions + responsive search + profile
               ═══════════════════════════════════════ */
            <>
              {mobileLeftActions}
              <div className="hidden lg:block w-9 shrink-0" />

              {/* Right: workspace actions + elongated search + profile */}
              <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-5">
                {activeConversation.type !== "pdf" && workspaceActions}

                {/* Search: compact icon on mobile, elongated input on desktop */}
                <button
                  onClick={onSearchOpen}
                  className="flex h-9 w-9 sm:w-60 md:w-72 items-center justify-center sm:justify-start gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-0 sm:px-3 text-[13px] font-medium text-[var(--text-secondary)] backdrop-blur-md transition-colors hover:border-white/[0.15] hover:bg-white/[0.07] hover:text-white"
                  aria-label="Search sources and notes"
                >
                  <Search size={16} className="text-[#dbe1ff] shrink-0" />
                  <span className="hidden sm:inline flex-1 text-left truncate text-neutral-400 text-xs sm:text-[13px]">
                    Search...
                  </span>
                  <kbd className="hidden sm:inline-flex items-center rounded-md border border-white/[0.12] bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-medium text-neutral-300">
                    ⌘ K
                  </kbd>
                </button>

                {/* Profile section vertically centered with search */}
                {profileSection}
              </div>
            </>
          ) : (
            /* ═══════════════════════════════════════
               DASHBOARD HEADER
               - Mobile: New Chat & Toggle Sidebar on left
               - Desktop: Centered search bar with subtle transparent bg
               - Right: search icon (mobile) + profile avatar
               ═══════════════════════════════════════ */
            <>
              {mobileLeftActions}
              <div className="hidden lg:block w-9 shrink-0" />

              {/* Center: search bar (desktop) — slightly transparent, subtle border, no hard solid fill */}
              <div className="pointer-events-none absolute left-1/2 hidden w-[min(43vw,560px)] -translate-x-1/2 md:block">
                <button
                  onClick={onSearchOpen}
                  className="pointer-events-auto inline-flex h-10 w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] pl-4 pr-3 text-[13px] font-medium text-[#b9c3ed] backdrop-blur-md transition-colors hover:border-white/[0.15] hover:bg-white/[0.07] hover:text-white"
                  aria-label="Search sources and notes"
                >
                  <Search size={16} className="text-[#dbe1ff]" />
                  <span className="flex-1 text-left">Search your sources, notes or ask anything...</span>
                  <kbd className="inline-flex items-center rounded-md border border-white/[0.14] bg-white/[0.06] px-2 py-1 text-[11px] font-medium leading-none text-[#dbe1ff]">
                    ⌘ K
                  </kbd>
                </button>
              </div>

              {/* Right: mobile search + profile (vertically centered on the exact same axis) */}
              <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                <Tooltip content="Search" side="bottom">
                  <button
                    onClick={onSearchOpen}
                    className="grid h-9 w-9 place-items-center rounded-xl text-[var(--text-secondary)] hover:bg-white/[0.05] hover:text-white md:hidden"
                    aria-label="Search sources and notes"
                  >
                    <Search size={17} />
                  </button>
                </Tooltip>
                {profileSection}
              </div>
            </>
          )}

        </div>
      </header>
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <LogoutModal isOpen={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={logout} />
    </>
  );
}
