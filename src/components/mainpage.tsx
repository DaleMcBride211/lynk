// app/page.tsx (or wherever your main page component is)
'use client';
import { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { supabase } from '@/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { arrayMove } from '@dnd-kit/sortable';
import { TaskList } from '@/components/sortablecard';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { DragEndEvent } from '@dnd-kit/core';

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
  check_completed: boolean;
  due_date: string;
  user_id: string;
  checklist_items?: ChecklistItem[];
}

const ORDER_INDEX_STEP = 1000;

export default function TaskPage() {
  const [newTask, setNewTask] = useState({ title: '', description: '', checklist_items: [] as ChecklistItem[], check_completed: false });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  // Initialize user as undefined to indicate loading state
  const [user, setUser] = useState<User | null | undefined>(undefined);

  // No longer need fetchUser as a separate function, onAuthStateChange handles it
  // const fetchUser = async () => {
  //   const { data: { user }, error } = await supabase.auth.getUser();
  //   if (error) {
  //     console.error('Error fetching user:', error.message);
  //     setUser(null);
  //   } else {
  //     setUser(user);
  //   }
  // };

  // Use useCallback to memoize fetchTasks
  const fetchTasks = useCallback(async () => {
    // Only fetch tasks if user is not null (i.e., logged in)
    if (!user) {
      setTasks([]);
      return;
    }
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching tasks: ', error.message);
      return;
    }
    const tasksWithOrder = data.map((task) => ({
      ...task,
      order_index: task.order_index ?? 0,
      checklist_items: task.checklist_items?.map((item: string | ChecklistItem) =>
        typeof item === 'string' ? { text: item, completed: false } : item
      ) ?? [],
    }));
    setTasks(tasksWithOrder);
  }, [user]); // Dependency array for useCallback

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('You must be logged in to add a task.');
      return;
    }

    if (!newTask.title.trim()) {
      alert('Task title cannot be empty.');
      return;
    }

    let nextOrderIndex: number;
    if (tasks.length === 0) {
      nextOrderIndex = ORDER_INDEX_STEP;
    } else {
      const lastTaskOrderIndex = tasks[tasks.length - 1].order_index;
      nextOrderIndex = lastTaskOrderIndex + ORDER_INDEX_STEP;
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...newTask, user_id: user.id, order_index: nextOrderIndex })
      .select()
      .single();

    if (error) {
      console.error('Error adding task: ', error.message);
      return;
    }

    setNewTask({ title: '', description: '', checklist_items: [], check_completed: false });
    setTasks((prevTasks) =>
      [...prevTasks, data].sort((a, b) => a.order_index - b.order_index)
    );
  };

  const handleDeleteTask = async (id: number) => {
    if (!user) {
      alert('You must be logged in to delete a task.');
      return;
    }
    const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id);

    if (error) {
      console.error('Error deleting task: ', error.message);
      return;
    }
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !user) return;

    if (!editingTask.title.trim()) {
      alert('Task title cannot be empty.');
      return;
    }

    const currentTimeISO = new Date().toISOString();

    const { error } = await supabase
      .from('tasks')
      .update({
        title: editingTask.title,
        description: editingTask.description,
        updated_at: currentTimeISO,
        checklist_items: editingTask.checklist_items ?? [],
      })
      .eq('id', editingTask.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating task: ', error.message);
      return;
    }

    setIsUpdateModalOpen(false);
    setEditingTask(null);
    fetchTasks();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && user) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over?.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const newOrderedTasks = arrayMove(tasks, oldIndex, newIndex);

      let newOrderIndexForMovedTask: number;
      const movedTask = newOrderedTasks[newIndex];

      if (newIndex === 0) {
        newOrderIndexForMovedTask = newOrderedTasks[1]?.order_index / 2 || ORDER_INDEX_STEP / 2;
      } else if (newIndex === newOrderedTasks.length - 1) {
        newOrderIndexForMovedTask = newOrderedTasks[newIndex - 1].order_index + ORDER_INDEX_STEP;
      } else {
        const prevTaskOrder = newOrderedTasks[newIndex - 1].order_index;
        const nextTaskOrder = newOrderedTasks[newIndex + 1].order_index;
        newOrderIndexForMovedTask = (prevTaskOrder + nextTaskOrder) / 2;
      }

      const updatedTasks = tasks.map(task =>
        task.id === movedTask.id ? { ...task, order_index: newOrderIndexForMovedTask } : task
      ).sort((a, b) => a.order_index - b.order_index);

      setTasks(updatedTasks);

      const { error } = await supabase
        .from('tasks')
        .update({ order_index: newOrderIndexForMovedTask })
        .eq('id', movedTask.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating task order in database: ', error.message);
        fetchTasks();
      }
    }
  };

  const handleAddChecklistItem = () => {
    setNewTask((prev) => ({
      ...prev,
      checklist_items: [...(prev.checklist_items ?? []), { text: '', completed: false }],
    }));
  };

  const handleNewChecklistItemChange = (index: number, value: string) => {
    setNewTask((prev) => {
      const updatedChecklistItems = [...(prev.checklist_items ?? [])];
      if (updatedChecklistItems[index]) {
        updatedChecklistItems[index] = { ...updatedChecklistItems[index], text: value };
      }
      return { ...prev, checklist_items: updatedChecklistItems };
    });
  };

  const handleRemoveNewChecklistItem = (index: number) => {
    setNewTask((prev) => {
      const updatedChecklistItems = (prev.checklist_items ?? []).filter((_, i) => i !== index);
      return { ...prev, checklist_items: updatedChecklistItems };
    });
  };

  const handleEditingChecklistItemChange = (index: number, value: string) => {
    setEditingTask((prev) => {
      if (!prev) return null;
      const updatedChecklistItems = [...(prev.checklist_items ?? [])];
      if (updatedChecklistItems[index]) {
        updatedChecklistItems[index] = { ...updatedChecklistItems[index], text: value };
      }
      return { ...prev, checklist_items: updatedChecklistItems };
    });
  };

  const handleAddEditingChecklistItem = () => {
    setEditingTask((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        checklist_items: [...(prev.checklist_items ?? []), { text: '', completed: false }],
      };
    });
  };

  const handleRemoveEditingChecklistItem = (index: number) => {
    setEditingTask((prev) => {
      if (!prev) return null;
      const updatedChecklistItems = (prev.checklist_items ?? []).filter((_, i) => i !== index);
      return { ...prev, checklist_items: updatedChecklistItems };
    });
  };

  const handleToggleChecklistItem = async (taskId: number, itemIndex: number, isChecked: boolean) => {
    if (!user) {
      alert('You must be logged in to update a task.');
      return;
    }

    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    const updatedChecklistItems = [...(taskToUpdate.checklist_items ?? [])];
    if (updatedChecklistItems[itemIndex]) {
      updatedChecklistItems[itemIndex] = {
        ...updatedChecklistItems[itemIndex],
        completed: isChecked,
      };

      const { error } = await supabase
        .from('tasks')
        .update({ checklist_items: updatedChecklistItems })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating checklist item: ', error.message);
        return;
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, checklist_items: updatedChecklistItems } : task
        )
      );
    }
  };

  // Effect to listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null); // Set user to User object or null
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount

  // Effect to fetch tasks when user state is resolved (not undefined)
  useEffect(() => {
    if (user !== undefined) { // Only run if user state is resolved
      fetchTasks();
    }
  }, [user, fetchTasks]); // fetchTasks is now a stable dependency due to useCallback

  // Show loading or login message based on user state
  if (user === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 animate-fadeIn">
          Loading User Session...
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-md">
          Please wait while we check your authentication status.
        </p>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 animate-fadeIn">
          Welcome to Your Task Manager! 🚀
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-md">
          It looks like you&apos;re not logged in. Please log in or sign up to view and manage your tasks.
        </p>
        <Link href='/' passHref>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
            Go to Homepage / Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-start justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 gap-8">
      {/* Add New Task Form */}
      <div className="mt-12">
        <TooltipProvider>
          <Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button className="text-3xl text-center p-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                    +
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Task</p>
              </TooltipContent>
            </Tooltip>
            <DialogContent>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white text-center">Add New Task</DialogTitle>
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-md p-6 dark:bg-gray-800 space-y-4 md:sticky md:top-4"
              >
                <div>
                  <label htmlFor="taskTitle" className="sr-only">
                    Task Title
                  </label>
                  <Input
                    id="taskTitle"
                    type="text"
                    placeholder="Task Title"
                    value={newTask.title}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="taskDescription" className="sr-only">
                    Task Description
                  </label>
                  <Textarea
                    id="taskDescription"
                    placeholder="Task Description"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask((prev) => ({ ...prev, description: e.target.value }))
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white resize-y"
                  />
                </div>
                <div className='checklist'>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Checklist</h3>
                  {(newTask.checklist_items ?? []).map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <Input
                        type="text"
                        placeholder={`Checklist Item ${index + 1}`}
                        value={item.text}
                        onChange={(e) => handleNewChecklistItemChange(index, e.target.value)}
                        className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveNewChecklistItem(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" onClick={handleAddChecklistItem} className="cursor-pointer">
                    Add Checklist Item
                  </Button>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-300 ease-in-out"
                >
                  Add Task
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </TooltipProvider>
      </div>

      {/* Task List Component */}
      <TaskList
        tasks={tasks}
        onEditTask={(editedTask) => {
          setEditingTask({
            ...editedTask,
            checklist_items: editedTask.checklist_items?.map((item: string | ChecklistItem) =>
              typeof item === 'string' ? { text: item, completed: false } : item
            ) ?? [],
          });
          setIsUpdateModalOpen(true);
        }}
        onDeleteTask={handleDeleteTask}
        onDragEnd={handleDragEnd}
        onToggleChecklistItem={handleToggleChecklistItem}
      />

      {/* Update Task Modal */}
      {editingTask && (
        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Task
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="editTitle" className="text-right text-gray-700 dark:text-gray-300">
                  Title
                </label>
                <Input
                  id="editTitle"
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask((prev) => (prev ? { ...prev, title: e.target.value } : null))
                  }
                  className="col-span-3 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="editDescription" className="text-right text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <Textarea
                  id="editDescription"
                  value={editingTask.description}
                  onChange={(e) =>
                    setEditingTask((prev) => (prev ? { ...prev, description: e.target.value } : null))
                  }
                  rows={4}
                  className="col-span-3 dark:bg-gray-700 dark:text-white dark:border-gray-600 resize-y"
                />
              </div>
              <div className='checklist'>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Checklist</h3>
                {(editingTask.checklist_items ?? []).map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      type="text"
                      placeholder={`Checklist Item ${index + 1}`}
                      value={item.text}
                      onChange={(e) => handleEditingChecklistItemChange(index, e.target.value)}
                      className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveEditingChecklistItem(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={handleAddEditingChecklistItem} className="cursor-pointer">
                  Add Checklist Item
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUpdateModalOpen(false)}
                className="dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleUpdateTask}
                className="bg-blue-600 hover:bg-blue-700 text-white dark:focus:ring-offset-gray-800"
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}