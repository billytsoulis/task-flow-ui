'use client';

import React, { useOptimistic } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { AnimatePresence } from 'framer-motion';

import { Task as TaskType } from '@/types';
import { updateTaskStatus } from '../server/actions';
import { useKanbanStore } from '@/features/kanban/store/kanban-store';
import { KanbanColumn } from '@/features/kanban/components/KanbanColumn';
import { TaskCard } from './TaskCard';

type KanbanBoardProps = {
  tasks: TaskType[];
};

// Define an optimistic task type that can be temporarily different from the server state
type OptimisticTask = TaskType & { isOptimistic?: boolean };

export function KanbanBoard({ tasks: initialTasks }: KanbanBoardProps) {
  // useOptimistic updates the UI instantly, then reverts to the `initialTasks` state
  // once the server action (the async part) completes.
  const [optimisticTasks, setOptimisticTasks] = useOptimistic<OptimisticTask[], TaskType[]>(
    initialTasks,
    (state, updatedTasks) => {
      // This function defines how the state should be merged.
      // Here, we simply replace the old state with the new optimistic state.
      return updatedTasks;
    }
  );

  const { setDraggedTaskId } = useKanbanStore();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const columns = {
    todo: optimisticTasks.filter((t) => t.status === 'todo'),
    'in-progress': optimisticTasks.filter((t) => t.status === 'in-progress'),
    done: optimisticTasks.filter((t) => t.status === 'done'),
  };

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedTaskId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverAColumn = over.data.current?.type === 'Column';

    // This is where the optimistic update happens.
    // We find the task being dragged and check if it's being moved to a new column.
    if (isActiveATask && isOverAColumn) {
      const activeTask = optimisticTasks.find((t) => t.id === activeId);
      const newStatus = overId as TaskType['status'];
      
      if (activeTask && activeTask.status !== newStatus) {
        // Create a new array of tasks with the updated status for the dragged task.
        const newTasks = optimisticTasks.map((t) =>
          t.id === activeId ? { ...t, status: newStatus, isOptimistic: true } : t
        );
        // Call the optimistic setter to update the UI immediately.
        setOptimisticTasks(newTasks);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setDraggedTaskId(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const newStatus = optimisticTasks.find((t) => t.id === activeId)?.status;
    const originalStatus = initialTasks.find((t) => t.id === activeId)?.status;

    // If the status has changed, call the server action to persist the change.
    if (newStatus && originalStatus && newStatus !== originalStatus) {
      // No need to `await` here if you don't need to handle the result on the client.
      // The UI has already been updated optimistically.
      updateTaskStatus(activeId, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {(['todo', 'in-progress', 'done'] as const).map((status) => (
          <KanbanColumn key={status} status={status}>
            <AnimatePresence>
              {columns[status].map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </AnimatePresence>
          </KanbanColumn>
        ))}
      </div>
    </DndContext>
  );
}