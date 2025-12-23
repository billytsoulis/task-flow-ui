'use client';

import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Task } from '@/types/index';
import { cn } from '@/core/lib/utils';

type TaskCardProps = {
  task: Task & { isOptimistic?: boolean };
};

export function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { type: 'Task', task },
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layoutId={task.id} // This is the key for the smooth animation!
      className={cn('bg-white dark:bg-gray-900 p-4 rounded-md shadow-sm cursor-grab active:cursor-grabbing', task.isOptimistic && 'opacity-50')}
    >
      <h3 className="font-medium">{task.title}</h3>
    </motion.div>
  );
}
