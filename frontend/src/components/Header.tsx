import { PanelLeft, Plus, Sparkles } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useUIStore } from '@/store/useUIStore';
import { useConversations } from '@/hooks/useConversations';
import { APP_NAME } from '@/constants';
import { cn } from '@/utils/cn';

interface HeaderProps {
  onNewChat?: () => void;
  workspaceActions?: React.ReactNode;
}

export function Header({ onNewChat, workspaceActions }: HeaderProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { conversations } = useConversations();

  const activeConversation = conversations.find((c) => c._id === conversationId);

  return (
    <header className="relative z-20 flex h-[var(--header-height)] shrink-0 items-center border-b border-[var(--border-soft)] bg-[var(--canvas)]/70 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between gap-3 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            <PanelLeft
              size={17}
              className={cn('transition-transform duration-300', !sidebarOpen && 'rotate-180')}
            />
          </button>

          <div className="hidden h-5 w-px bg-[var(--border-soft)] sm:block" />

          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-3)] text-[var(--accent)] sm:hidden">
              <Sparkles size={13} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-5 text-[var(--text-primary)]">
                {activeConversation?.title.replace(/\*\*/g, "") ?? APP_NAME}
              </p>
              <p className="hidden truncate text-[11px] text-[var(--text-muted)] sm:block">
                {activeConversation ? (activeConversation.type === 'pdf' ? 'PDF workspace' : 'Video workspace') : 'Transcript intelligence workspace'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {activeConversation && activeConversation.type !== 'pdf' && workspaceActions}

          <button
            onClick={onNewChat}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-3)] px-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </div>
      </div>
    </header>
  );
}
