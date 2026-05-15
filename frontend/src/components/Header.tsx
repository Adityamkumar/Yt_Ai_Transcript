import { PanelLeft, Plus, Sparkles } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useUIStore } from '@/store/useUIStore';
import { useConversations } from '@/hooks/useConversations';
import { APP_NAME } from '@/constants';
import { cn } from '@/utils/cn';

interface HeaderProps {
  onNewChat?: () => void;
}

export function Header({ onNewChat }: HeaderProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { conversations } = useConversations();
  
  const activeConversation = conversations.find((c) => c._id === conversationId);

  return (
    <header className="relative z-20 flex h-[var(--header-height)] shrink-0 items-center border-b border-white/[0.07] bg-[#07090d]/70 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between gap-3 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[var(--text-muted)] transition hover:bg-white/[0.06] hover:text-white"
          >
            <PanelLeft
              size={18}
              className={cn('transition-transform duration-300', !sidebarOpen && 'rotate-180')}
            />
          </button>

          <div className="hidden h-5 w-px bg-white/[0.08] sm:block" />

          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.045] text-[var(--accent)] shadow-sm sm:hidden">
              <Sparkles size={14} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-5 text-white">
                {activeConversation?.title.replace(/\*\*/g, "") ?? APP_NAME}
              </p>
              <p className="hidden truncate text-xs text-[var(--text-muted)] sm:block">
                {activeConversation ? 'Video workspace' : 'Transcript intelligence workspace'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onNewChat}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.055] px-3 text-sm font-medium text-white transition hover:border-white/[0.16] hover:bg-white/[0.09]"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New chat</span>
        </button>
      </div>
    </header>
  );
}
