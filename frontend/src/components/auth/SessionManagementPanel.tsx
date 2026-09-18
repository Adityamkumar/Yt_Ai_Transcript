import { useState } from "react";
import { CheckCircle2, Clock3, Loader2, LogOut, Monitor } from "lucide-react";
import { authService } from "@/services/auth.service";
import type { Session } from "@/types";
import { parseUserAgent } from "@/utils/userAgent";

interface SessionManagementPanelProps {
  sessions: Session[];
  sessionManagementToken: string;
  onContinue: () => void;
}

function formatRelativeTime(date: string): string {
  const createdAt = new Date(date).getTime();
  if (Number.isNaN(createdAt)) return "Recently";

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - createdAt) / 1000));
  if (elapsedSeconds < 60) return "Just now";
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SessionManagementPanel({
  sessions: initialSessions,
  sessionManagementToken,
  onContinue,
}: SessionManagementPanelProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRevokedSession, setHasRevokedSession] = useState(false);

  const handleRevoke = async (sessionId: string) => {
    if (revokingSessionId) return;

    setRevokingSessionId(sessionId);
    setError(null);
    try {
      await authService.revokePreAuthSession(sessionId, sessionManagementToken);
      setSessions((current) => current.filter((session) => session._id !== sessionId));
      setHasRevokedSession(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't sign out that session.");
    } finally {
      setRevokingSessionId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
        <p className="text-sm font-semibold text-amber-100">
          Maximum of 3 active sessions reached.
        </p>
        <p className="mt-1 text-xs leading-5 text-amber-100/70">
          You are already signed in on these devices. Sign out from one to continue here.
        </p>
      </div>

      {hasRevokedSession && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs text-emerald-200">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
          <span>Session signed out successfully. You can continue signing in.</span>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
          {error}
        </p>
      )}

      {sessions.length > 0 ? (
        <div className="flex flex-col gap-2">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
            >
              <Monitor size={17} className="shrink-0 text-indigo-300" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {parseUserAgent(session.userAgent)}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/50">
                  <span className="capitalize">{session.provider}</span>
                  <span aria-hidden="true">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={11} />
                    {formatRelativeTime(session.createdAt)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRevoke(session._id)}
                disabled={Boolean(revokingSessionId)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {revokingSessionId === session._id ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <LogOut size={13} />
                )}
                Sign out
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center text-xs text-white/60">
          No active sessions remain. Continue signing in below.
        </p>
      )}

      {hasRevokedSession && (
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
        >
          Continue signing in
        </button>
      )}
    </div>
  );
}

