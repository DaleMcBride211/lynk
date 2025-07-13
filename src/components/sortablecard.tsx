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

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
  order_index: number;
  check_completed: boolean;
  due_date: string;
  user_id: string;
}

interface SortableTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

function SortableTaskCard({ task, onEdit, onDelete }: SortableTaskCardProps) {
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
          <p className="text-gray-700 dark:text-gray-300">{task.description}</p>
        </CardContent>
        <CardFooter
          className="flex justify-end gap-2"
          // Keep this, as it's good practice. The activationConstraint is the primary fix.
          data-dndkit-ignore-pointer-events="true"
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
}

export function TaskList({
  tasks,
  onEditTask,
  onDeleteTask,
  onDragEnd,
}: TaskListProps) {
  // DND Kit Sensors
  // Implemented activationConstraint on PointerSensor
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires the pointer to move at least 8 pixels before a drag is initiated
        // delay: 100, // Optional: Add a small delay (in ms) before drag activates
        // tolerance: 5, // Optional: pixels of pointer movement before delay is triggered
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
        <div className="mt-15 flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
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
              />
            ))
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}