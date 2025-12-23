import { z } from 'zod';

// --- User Schemas ---

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
  name: z.string().min(2, { message: "Name must be at least 2 characters long." }),
  email: z.string().email({ message: "Invalid email address." }),
  image: z.string().url().optional(),
  settings: UserSettingsSchema,
});

export type User = z.infer<typeof UserSchema>;
export type UserSettings = z.infer<typeof UserSettingsSchema>; // This now includes both sub-schemas

// --- Task Schemas ---

export const SubtaskSchema = z.object({
  // Mongoose sub-documents have an _id of type ObjectId.
  _id: z.any().optional(),
  title: z.string().min(1, { message: "Subtask title cannot be empty." }),
  isCompleted: z.boolean().default(false),
}).transform((doc) => {
  // Transform the document to replace _id with a string 'id' for application use.
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
});

export const TaskSchema = z.object({
  _id: z.any().optional(),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignedTo: z.string().optional(), // Corresponds to User's ObjectId as a string
  subtasks: z.array(SubtaskSchema).default([]),
}).transform((doc) => {
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest };
});

export type Task = z.infer<typeof TaskSchema>;
export type Subtask = z.infer<typeof SubtaskSchema>;

// --- Project Schemas ---

export const ProjectSchema = z.object({
  _id: z.any().optional(),
  name: z.string().min(1, { message: "Project name is required." }),
  slug: z.string().min(1, { message: "Slug is required." }),
  ownerId: z.string(), // Corresponds to User's ObjectId as a string
  members: z.array(z.string()).default([]), // Array of User ObjectIds as strings
}).transform((doc) => {
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest };
});

export type Project = z.infer<typeof ProjectSchema>;
