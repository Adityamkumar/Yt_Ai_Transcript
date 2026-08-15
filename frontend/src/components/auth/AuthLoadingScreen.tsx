import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { APP_NAME } from '@/constants';

export function AuthLoadingScreen() {
  return (
    <div className="app-shell bg-[var(--canvas)] pointer-events-none select-none">
      {/* Sidebar Skeleton */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 shrink-0 overflow-hidden border-r border-[var(--border-soft)] bg-[rgba(8,9,12,0.88)] shadow-xl shadow-black/20 backdrop-blur-2xl lg:relative lg:z-30 w-[var(--sidebar-width)] flex-col">
        <div className="flex h-[var(--header-height)] items-center justify-between border-b border-[var(--border-soft)] px-4 bg-[rgba(255,255,255,0.015)]">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[rgba(157,165,255,0.2)] bg-[rgba(157,165,255,0.12)] text-[var(--accent)]">
              <Sparkles size={16} />
            </span>
            <div>
              <div className="h-4 w-24 bg-[var(--surface-3)] rounded-md animate-pulse"></div>
              <div className="h-3 w-32 bg-[var(--surface-2)] rounded-md mt-1 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="p-3.5">
          <div className="h-11 w-full bg-[var(--surface-2)] rounded-2xl animate-pulse"></div>
        </div>

        <div className="px-3 space-y-2 mt-2">
          <div className="h-9 w-full bg-[var(--surface-2)] rounded-xl animate-pulse"></div>
          <div className="h-9 w-full bg-[var(--surface-2)] rounded-xl animate-pulse"></div>
        </div>

        <div className="mt-8 px-5">
          <div className="h-3 w-16 bg-[var(--surface-3)] rounded animate-pulse mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 w-full bg-[var(--surface-2)] rounded-xl animate-pulse"></div>
            <div className="h-10 w-full bg-[var(--surface-2)] rounded-xl animate-pulse"></div>
            <div className="h-10 w-full bg-[var(--surface-2)] rounded-xl animate-pulse"></div>
          </div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <div className="app-main flex-1 flex flex-col min-w-0">
        {/* Header Skeleton */}
        <header className="relative z-20 flex h-[var(--header-height)] shrink-0 items-center border-b border-[var(--border-soft)] bg-[rgba(8,9,12,0.72)] backdrop-blur-2xl">
          <div className="flex w-full items-center justify-between gap-3 px-3 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-[var(--surface-2)] rounded-xl animate-pulse"></div>
              <div className="hidden h-5 w-px bg-[var(--border-soft)] sm:block" />
              <div className="h-5 w-32 bg-[var(--surface-2)] rounded-md animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-32 sm:w-40 bg-[var(--surface-2)] rounded-xl animate-pulse"></div>
              <div className="h-9 w-24 bg-[var(--surface-2)] rounded-xl animate-pulse hidden sm:block"></div>
            </div>
          </div>
        </header>

        {/* Dashboard Content Skeleton with Loading Message */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(124,92,255,0.05)_0%,transparent_60%)]"></div>
          
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#7C5CFF] blur-xl opacity-20 rounded-full animate-pulse"></div>
              <div className="grid h-16 w-16 place-items-center rounded-2xl border border-[rgba(157,165,255,0.2)] bg-[rgba(157,165,255,0.05)] text-[var(--accent)] backdrop-blur-md shadow-2xl">
                <Loader2 size={28} className="animate-spin text-[#7C5CFF]" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-medium text-[var(--text-primary)]">Loading your dashboard...</h2>
              <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
                Preparing your {APP_NAME} workspace. This will just take a moment.
              </p>
            </div>
          </div>
          
          {/* Subtle background shimmer cards to make it feel like the dashboard is loading */}
          <div className="absolute top-20 left-10 lg:left-20 w-64 h-32 bg-[var(--surface-1)] rounded-2xl border border-[var(--border-soft)] opacity-20 animate-pulse hidden md:block"></div>
          <div className="absolute bottom-20 right-10 lg:right-20 w-72 h-40 bg-[var(--surface-1)] rounded-2xl border border-[var(--border-soft)] opacity-20 animate-pulse hidden md:block"></div>
          <div className="absolute top-40 right-20 w-48 h-24 bg-[var(--surface-1)] rounded-2xl border border-[var(--border-soft)] opacity-10 animate-pulse hidden lg:block"></div>
        </main>
      </div>
    </div>
  );
}
