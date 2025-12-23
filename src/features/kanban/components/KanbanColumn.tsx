'use client';

import { useDroppable } from '@dnd-kit/core';
import { Task } from '@/types/index';
import { cn } from '@/core/lib/utils';

type KanbanColumnProps = {
  status: Task['status'];
  children: React.ReactNode;
};

const statusMap: Record<Task['status'], string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

export function KanbanColumn({ status, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'Column' },
  });

  return (
    <div ref={setNodeRef} className={cn('bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-4 transition-colors', isOver && 'bg-gray-200 dark:bg-gray-700')}>
      <h2 className="font-semibold text-lg mb-4 capitalize tracking-wide">{statusMap[status]}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}