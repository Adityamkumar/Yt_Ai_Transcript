import React, { useCallback, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { WorkspaceActions } from '@/components/workspace-actions/WorkspaceActions';
import { useUIStore } from '@/store/useUIStore';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { WorkspaceAction } from '@/components/workspace-actions/workspaceActionConfig';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { toggleSidebar, setSidebarOpen } = useUIStore();
  const actionTriggerRef = useRef<((action: WorkspaceAction) => void) | null>(null);

  const handleNewChat = useCallback(() => {
    navigate('/app');
  }, [navigate]);

  const handleActionReady = useCallback((trigger: (action: WorkspaceAction) => void) => {
    actionTriggerRef.current = trigger;
  }, []);

  const handleWorkspaceAction = useCallback((action: WorkspaceAction) => {
    actionTriggerRef.current?.(action);
  }, []);

  useKeyboardShortcut({ key: 'b', ctrl: true }, toggleSidebar);
  useKeyboardShortcut({ key: 'n', ctrl: true }, handleNewChat);

  useEffect(() => {
    const syncSidebarToViewport = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };

    syncSidebarToViewport();
    window.addEventListener('resize', syncSidebarToViewport);
    return () => window.removeEventListener('resize', syncSidebarToViewport);
  }, [setSidebarOpen]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');

    return () => {
      const savedPreference = localStorage.getItem('theme-preference') || 'system';
      let activeTheme = 'dark';
      if (savedPreference === 'system') {
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        activeTheme = systemIsDark ? 'dark' : 'light';
      } else {
        activeTheme = savedPreference;
      }
      
      if (activeTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    };
  }, []);


  const workspaceActionsNode = (
    <WorkspaceActions onAction={handleWorkspaceAction} />
  );

  return (
    <div className="app-shell">
      <Sidebar onNewChat={handleNewChat} />

      <div className="app-main">
        <Header onNewChat={handleNewChat} workspaceActions={workspaceActionsNode} />
        <main className="app-scroll">
          {React.isValidElement(children)
            ? React.cloneElement(children as React.ReactElement<any>, { onActionReady: handleActionReady })
            : children}
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface-1)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            fontSize: '13px',
            backdropFilter: 'blur(16px)',
          },
        }}
      />
    </div>
  );
}
