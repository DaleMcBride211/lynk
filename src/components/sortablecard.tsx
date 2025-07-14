// components/TaskList.tsx
'use client';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox'; // Ensure Checkbox is imported

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
  order_index: number;
  check_completed: boolean;
  due_date: string;
  user_id: string;
  checklist_items?: { text: string; completed: boolean; }[]; // Updated interface for checklist items
}

interface SortableTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  // NEW PROP: Handler for toggling checklist item completion
  onToggleChecklistItem: (taskId: number, itemIndex: number, isChecked: boolean) => void;
}

function SortableTaskCard({ task, onEdit, onDelete, onToggleChecklistItem }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging
      ? '0px 8px 16px rgba(0, 0, 0, 0.2)'
      : '0px 4px 8px rgba(0, 0, 0, 0.1)',
    cursor: isDragging ? 'grabbing' : 'grab', // Visual cue for dragging
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners} // Listeners are on the main draggable div
      className="w-full h-full flex flex-col justify-between dark:bg-gray-800 dark:text-white border dark:border-gray-700 rounded-lg shadow-md"
    >
      <Card className="w-full h-full flex flex-col justify-between dark:bg-gray-800 dark:text-white border dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{task.title}</CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
            Created: {new Date(task.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {task.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-2">{task.description}</p>
          )}

          {/* Display Checklist Items with Checkboxes */}
          {(task.checklist_items && task.checklist_items.length > 0) && (
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Checklist:</h4>
              <ul className="space-y-1">
                {task.checklist_items.map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                    <Checkbox
                      id={`task-${task.id}-item-${index}`} // Unique ID for accessibility
                      checked={item.completed} // Bind checked state to item.completed
                      onCheckedChange={(isChecked: boolean) => onToggleChecklistItem(task.id, index, isChecked)} // Handle change
                      className="mr-2"
                    />
                    <label
                      htmlFor={`task-${task.id}-item-${index}`} // Link label to checkbox
                      className={`cursor-pointer ${item.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}
                    >
                      {item.text}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </CardContent>
        <CardFooter
          className="flex justify-end gap-2"
          data-dndkit-ignore-pointer-events="true" // Prevents drag from being initiated by button clicks
        >
          <Button
            variant="outline"
            onClick={() => onEdit(task)}
            className="hover:bg-blue-100 dark:hover:bg-blue-900 dark:text-blue-400 dark:border-blue-700"
          >
            Update
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(task.id)}
            className="hover:bg-red-700 dark:hover:bg-red-800"
          >
            Delete
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  onDragEnd: (event: DragEndEvent) => void;
  // NEW PROP: Pass the toggle handler down
  onToggleChecklistItem: (taskId: number, itemIndex: number, isChecked: boolean) => void;
}

export function TaskList({
  tasks,
  onEditTask,
  onDeleteTask,
  onDragEnd,
  onToggleChecklistItem, // Destructure the new prop
}: TaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires pointer to move 8 pixels before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="mt-12 flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
          {tasks.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center col-span-full">
              No tasks found. Add a new task to get started!
            </p>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onToggleChecklistItem={onToggleChecklistItem} // Pass the new handler
              />
            ))
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}