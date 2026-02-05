import { create } from "zustand";

interface UIState {
  /** Global "New entry" sheet/drawer open (dashboard, header) */
  newEntryOpen: boolean;
  setNewEntryOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  newEntryOpen: false,
  setNewEntryOpen: (open) => set({ newEntryOpen: open }),
}));
