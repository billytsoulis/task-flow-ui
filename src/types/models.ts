import mongoose, { Schema } from 'mongoose';
import { User as ZodUser, Task as ZodTask, Project as ZodProject } from './index';

// Define Mongoose Document types that extend the Zod-inferred application types.
export type UserDocument = ZodUser & mongoose.Document;
export type TaskDocument = ZodTask & mongoose.Document;
export type ProjectDocument = ZodProject & mongoose.Document;

// Define types for the raw Mongoose Schema definition, where refs are ObjectIds.
// This resolves the compile-time type conflict.
type TaskSchemaType = Omit<ZodTask, 'assignedTo'> & {
  assignedTo?: mongoose.Types.ObjectId;
};

type ProjectSchemaType = Omit<ZodProject, 'ownerId' | 'members'> & {
  ownerId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
};

const UserSchema = new Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  settings: {
    notifications: {
      taskMentions: { type: [String], enum: ['email', 'in-app'], default: ['in-app'] },
      deadlineReminders: { type: [String], enum: ['email', 'in-app'], default: ['email', 'in-app'] },
    },
    personalization: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      accentColor: { type: String, default: '#007AFF' },
      sidebarDensity: { type: String, enum: ['compact', 'default', 'comfortable'], default: 'default' },
    },
  },
}, { timestamps: true });

const TaskSchema = new Schema<TaskSchemaType, mongoose.Model<TaskDocument>, {}, {}, {}, TaskDocument>({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'], // Added 'urgent'
    default: 'medium'
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    get: (v?: mongoose.Types.ObjectId) => v?.toString(),
  },
  subtasks: [{
    // Sub-documents get their own _id by default in Mongoose
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false } // Corrected from 'completed'
  }],
}, { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } });

const ProjectSchema = new Schema<ProjectSchemaType, mongoose.Model<ProjectDocument>, {}, {}, {}, ProjectDocument>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    get: (v: mongoose.Types.ObjectId) => v.toString(),
  },
  members: [{
    type: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      get: (v: mongoose.Types.ObjectId) => v.toString(),
    }
  }],
}, { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } });

// This pattern prevents model recompilation on hot reloads in a Next.js environment.
export const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
export const Task = mongoose.models.Task || mongoose.model<TaskDocument>('Task', TaskSchema);
export const Project = mongoose.models.Project || mongoose.model<ProjectDocument>('Project', ProjectSchema);