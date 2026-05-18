import { useEffect, useRef, useState } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  FileQuestion,
  FileText,
  Layers,
  ListChecks,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { WORKSPACE_ACTIONS, WorkspaceAction } from './workspaceActionConfig';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FileText,
  Sparkles,
  CheckCircle2,
  FileQuestion,
  BrainCircuit,
  ListChecks,
  Layers,
};

interface WorkspaceActionsProps {
  onAction: (action: WorkspaceAction) => void;
  disabled?: boolean;
}

export function WorkspaceActions({ onAction, disabled = false }: WorkspaceActionsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (action: WorkspaceAction) => {
    setOpen(false);
    onAction(action);
  };

  return (
    <div ref={ref} className="relative">
      <button
        id="workspace-actions-trigger"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.055] px-3 text-sm font-medium text-white transition hover:border-white/[0.16] hover:bg-white/[0.09] disabled:pointer-events-none disabled:opacity-40"
      >
        <Wand2 size={14} className="text-[var(--accent)]" />
        <span className="hidden sm:inline">AI Tools</span>
        <ChevronDown
          size={13}
          className={`text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d1117]/95 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl"
        >
          <div className="px-3 pb-1 pt-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              AI Actions
            </p>
          </div>
          <div className="py-1">
            {WORKSPACE_ACTIONS.map((action) => {
              const Icon = iconMap[action.icon] ?? Sparkles;
              return (
                <button
                  key={action.id}
                  role="menuitem"
                  onClick={() => handleSelect(action)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-[var(--text-secondary)] transition hover:bg-white/[0.055] hover:text-white"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-[var(--accent)]">
                    <Icon size={12} />
                  </span>
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
