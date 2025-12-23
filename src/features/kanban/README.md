# Kanban Feature

This directory contains all the code related to the drag-and-drop Kanban board feature.

## Architecture and State Management

The Kanban board follows a modern, hybrid state management approach that leverages the best of server and client capabilities in the Next.js App Router.

### Database State: Next.js Server Actions

- **Single Source of Truth**: The MongoDB database is the ultimate source of truth for all task data (e.g., status, order).
- **Mutations**: All changes to the database are handled exclusively through **Next.js Server Actions**, located in `src/features/kanban/server/actions.ts`.
- **Optimistic Updates**: The client-side `KanbanBoard` component uses React's `useOptimistic` hook. When a user drags a task to a new column, the UI updates instantly. The server action is then called in the background to sync the change with the database. This provides a fast, responsive user experience.

### UI State: Zustand

- **Purpose**: Zustand is used for managing ephemeral, client-side-only UI state.
- **State Managed**: It holds transient state that doesn't need to be persisted, such as the ID of the task currently being dragged (`draggedTaskId`).
- **Location**: The store is defined in `src/features/kanban/store/kanban-store.ts`.

This separation ensures that our application remains fast and responsive on the client while maintaining data integrity and security on the server.
