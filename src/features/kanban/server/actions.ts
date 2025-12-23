'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '@/core/lib/mongodb';
import { Task } from '@/types/models';
import { z } from 'zod';

// Define a schema for the input to ensure type safety
const updateTaskStatusSchema = z.object({
  taskId: z.string(),
  newStatus: z.enum(['todo', 'in-progress', 'done']),
});

export async function updateTaskStatus(taskId: string, newStatus: 'todo' | 'in-progress' | 'done') {
  const validatedFields = updateTaskStatusSchema.safeParse({
    taskId,
    newStatus,
  });

  if (!validatedFields.success) {
    console.error('Validation Error:', validatedFields.error.flatten().fieldErrors);
    throw new Error('Invalid input for updating task status.');
  }

  await connectDB();

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { status: newStatus },
      { new: true }
    );

    revalidatePath('/'); // Or the specific page path where the board is displayed
    return { success: true, data: JSON.parse(JSON.stringify(updatedTask)) };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update task.');
  }
}