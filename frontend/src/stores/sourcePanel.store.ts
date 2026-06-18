import { create } from 'zustand';

interface SourcePanelState {
  selectedPage: number | null;
  isSourcePanelOpen: boolean;
  openSourcePanel: (page: number) => void;
  closeSourcePanel: () => void;
  setSelectedPage: (page: number) => void;
}

export const useSourcePanelStore = create<SourcePanelState>((set) => ({
  selectedPage: null,
  isSourcePanelOpen: false,
  openSourcePanel: (page: number) => set({ selectedPage: page, isSourcePanelOpen: true }),
  closeSourcePanel: () => set({ isSourcePanelOpen: false }),
  setSelectedPage: (page: number) => set({ selectedPage: page }),
}));
