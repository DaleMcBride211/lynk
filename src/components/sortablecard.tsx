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
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
  order_index: number;
  // Use 'completed' for the main task completion status
  completed: boolean; // Renamed from check_completed for clarity
  due_date: string;
  user_id: string;
  checklist_items?: { text: string; completed: boolean; }[];
}

interface SortableTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onToggleChecklistItem: (taskId: number, itemIndex: number, isChecked: boolean) => void;
  // NEW PROP: Handler for toggling task completion
  onToggleTaskCompletion: (taskId: number, isCompleted: boolean) => void;
}

function SortableTaskCard({ task, onEdit, onDelete, onToggleChecklistItem, onToggleTaskCompletion }: SortableTaskCardProps) {
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
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`w-full h-full flex flex-col justify-between dark:bg-gray-800 dark:text-white border dark:border-gray-700 rounded-lg shadow-md ${task.completed ? 'opacity-70 line-through' : ''}`}
    >
      <Card className="w-full h-full flex flex-col justify-between dark:bg-gray-800 dark:text-white border-none">
        <Dialog>
          <DialogTrigger asChild>
            <CardHeader
              className={`flex flex-row items-center justify-between space-x-4 pr-6 ${task.completed ? 'line-through' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`task-${task.id}-completed`}
                  checked={task.completed}
                  onCheckedChange={(isChecked: boolean) => onToggleTaskCompletion(task.id, isChecked)}
                  className="w-5 h-5 flex-shrink-0"
                  // Prevent drag from starting when interacting with the checkbox
                  onClick={(e) => e.stopPropagation()}
                />
                <CardTitle className={`text-xl font-semibold ${task.completed ? 'text-gray-500 dark:text-gray-400' : ''}`}>
                  {task.title}
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                Created: {new Date(task.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
          </DialogTrigger>

          <DialogContent className="max-w-md md:max-w-lg lg:max-w-xl dark:bg-gray-800 dark:text-white border dark:border-gray-700 rounded-lg shadow-lg">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">{task.title}</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              Created: {new Date(task.created_at).toLocaleDateString()}
            </DialogDescription>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              {task.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{task.description}</p>
              )}

              {(task.checklist_items && task.checklist_items.length > 0) && (
                <div className="mt-4">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 border-b pb-2">Checklist:</h4>
                  <ul className="space-y-2">
                    {task.checklist_items.map((item, index) => (
                      <li key={index} className="flex items-start text-gray-700 dark:text-gray-300">
                        <Checkbox
                          id={`task-${task.id}-item-${index}`}
                          checked={item.completed}
                          onCheckedChange={(isChecked: boolean) => onToggleChecklistItem(task.id, index, isChecked)}
                          className="mr-3 mt-1 flex-shrink-0"
                        />
                        <label
                          htmlFor={`task-${task.id}-item-${index}`}
                          className={`flex-grow cursor-pointer text-base ${item.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}
                        >
                          {item.text}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <CardFooter
              className="flex justify-end gap-3 pt-4"
              data-dndkit-ignore-pointer-events="true"
            >
              <Button
                variant="outline"
                onClick={() => onEdit(task)}
                className="hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 transition-colors"
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => onDelete(task.id)}
                className="hover:bg-red-700 dark:hover:bg-red-800 bg-red-600 text-white transition-colors"
              >
                Delete
              </Button>
            </CardFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onToggleChecklistItem: (taskId: number, itemIndex: number, isChecked: boolean) => void;
  onToggleTaskCompletion: (taskId: number, isCompleted: boolean) => void;
}

export function TaskList({
  tasks,
  onEditTask,
  onDeleteTask,
  onDragEnd,
  onToggleChecklistItem,
  onToggleTaskCompletion,
}: TaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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
                onToggleChecklistItem={onToggleChecklistItem}
                onToggleTaskCompletion={onToggleTaskCompletion} // Pass the new handler
              />
            ))
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}