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
            background: 'rgba(13, 16, 23, 0.94)',
            color: '#f7f8fb',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px',
            boxShadow: '0 18px 50px rgba(0,0,0,0.36)',
            fontSize: '13px',
          },
        }}
      />
    </div>
  );
}
