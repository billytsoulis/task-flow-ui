"use client";
import { create } from 'zustand';

type KanbanState = {
  draggedTaskId: string | null;
  setDraggedTaskId: (taskId: string | null) => void;
};

export const useKanbanStore = create<KanbanState>((set) => ({
  draggedTaskId: null,
  setDraggedTaskId: (taskId) => set({ draggedTaskId: taskId }),
}));