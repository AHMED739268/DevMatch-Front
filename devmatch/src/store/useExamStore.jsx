import { create } from 'zustand';

export const useExamStore = create((set) => ({
  passed: false,
  setPassed: (val) => set({ passed: val }),
})); 