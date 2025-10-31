import React from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { TaskList } from '@/components/sortablecard';

interface ChecklistItem {
  text: string;
  completed: boolean;
}

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
  order_index: number;

  completed: boolean;
  due_date: string;
  user_id: string;
  checklist_items?: ChecklistItem[];
}


interface TaskListContainerProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => Promise<void>;
  onDragEnd: (event: DragEndEvent) => Promise<void>;
  onToggleChecklistItem: (taskId: number, itemIndex: number, isChecked: boolean) => Promise<void>;
  onToggleTaskCompletion: (taskId: number, isCompleted: boolean) => Promise<void>;
}

export function TaskListContainer({
  tasks,
  onEditTask,
  onDeleteTask,
  onDragEnd,
  onToggleChecklistItem,
  onToggleTaskCompletion, 
}: TaskListContainerProps) {
  return (
    <TaskList
      tasks={tasks}
      onEditTask={onEditTask}
      onDeleteTask={onDeleteTask}
      onDragEnd={onDragEnd}
      onToggleChecklistItem={onToggleChecklistItem}
      onToggleTaskCompletion={onToggleTaskCompletion} 
    />
  );
}