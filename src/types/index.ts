import { z } from 'zod';

export const UserNotificationSettingsSchema = z.object({
  taskMentions: z.array(z.enum(['email', 'in-app'])).default(['in-app']),
  deadlineReminders: z.array(z.enum(['email', 'in-app'])).default(['email', 'in-app']),
});

export const UserPersonalizationSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  accentColor: z.string().default('#007AFF'),
  sidebarDensity: z.enum(['compact', 'default', 'comfortable']).default('default'),
});

export const UserSettingsSchema = z.object({
  notifications: UserNotificationSettingsSchema,
  personalization: UserPersonalizationSettingsSchema,
});

export const UserSchema = z.object({
  _id: z.any().optional(), 
  name: z.string().min(2, { message: "Name must be at least 2 characters long." }),
  email: z.string().email({ message: "Invalid email address." }),
  image: z.string().url().optional(),
  settings: UserSettingsSchema,
}).transform((doc) => {
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest };
});

export type User = z.infer<typeof UserSchema>;
export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const SubtaskSchema = z.object({
  _id: z.any().optional(),
  title: z.string().min(1, { message: "Subtask title cannot be empty." }),
  isCompleted: z.boolean().default(false),
}).transform((doc) => {
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest };
});

export type Subtask = z.infer<typeof SubtaskSchema>;

export const TaskSchema = z.object({
  _id: z.any().optional(),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignedTo: z.string().optional(), 
  subtasks: z.array(SubtaskSchema).default([]),
}).transform((doc) => {
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest };
});

export type Task = z.infer<typeof TaskSchema>;

export const ProjectSchema = z.object({
  _id: z.any().optional(),
  name: z.string().min(1, { message: "Project name is required." }),
  slug: z.string().min(1, { message: "Slug is required." }),
  ownerId: z.string(), 
  members: z.array(z.string()).default([]),
}).transform((doc) => {
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest };
});

export type Project = z.infer<typeof ProjectSchema>;