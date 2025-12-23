import mongoose, { Schema, Document, Types } from 'mongoose';
import { User as ZodUser, Task as ZodTask, Project as ZodProject } from './index';

export interface UserDocument extends Omit<ZodUser, 'id'>, Document {
  _id: Types.ObjectId;
}

export interface TaskDocument extends Omit<ZodTask, 'id' | 'assignedTo'>, Document {
  _id: Types.ObjectId;
  assignedTo?: Types.ObjectId;
}

export interface ProjectDocument extends Omit<ZodProject, 'id' | 'ownerId' | 'members'>, Document {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  members: Types.ObjectId[];
}

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

const TaskSchema = new Schema<TaskDocument>({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  subtasks: [{
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false }
  }],
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const ProjectSchema = new Schema<ProjectDocument>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
export const Task = mongoose.models.Task || mongoose.model<TaskDocument>('Task', TaskSchema);
export const Project = mongoose.models.Project || mongoose.model<ProjectDocument>('Project', ProjectSchema);