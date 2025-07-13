// app/page.tsx (or wherever your main page component is)
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { arrayMove } from '@dnd-kit/sortable'; // Import arrayMove
import { TaskList } from '@/components/sortablecard'; // Import the new TaskList component
import { User } from '@supabase/supabase-js'; // Import User type
import Link from 'next/link';

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
  order_index: number;
  check_completed: boolean;
  due_date: string;
  user_id: string; // Change to string as Supabase user IDs are UUIDs
}

const ORDER_INDEX_STEP = 1000; // Define a step for order indices

export default function TaskPage() {
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null); // State to store the logged-in user

  // Function to fetch the current user
  const fetchUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching user:', error.message);
      setUser(null); // Ensure user is null on error
    } else {
      setUser(user);
    }
  };

  const fetchTasks = async () => {
    if (!user) { // Only fetch tasks if a user is logged in
      setTasks([]); // Clear tasks if no user
      return;
    }
    // Always order by order_index when fetching
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id) // Filter tasks by the current user's ID
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching tasks: ', error.message);
      return;
    }
    const tasksWithOrder = data.map((task) => ({
      ...task,
      order_index: task.order_index ?? 0,
    }));
    setTasks(tasksWithOrder);
  };

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
      .insert({ ...newTask, user_id: user.id, order_index: nextOrderIndex }) // Assign user.id
      .select()
      .single();

    if (error) {
      console.error('Error adding task: ', error.message);
      return;
    }

    setNewTask({ title: '', description: '' });
    setTasks((prevTasks) =>
      [...prevTasks, data].sort((a, b) => a.order_index - b.order_index)
    );
  };

  const handleDeleteTask = async (id: number) => {
    if (!user) { // Prevent deletion if not logged in
      alert('You must be logged in to delete a task.');
      return;
    }
    const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id); // Add user_id to deletion condition

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

    // Get the current time as an ISO 8601 string (e.g., "2025-07-12T23:16:51.404Z")
    // The 'Z' indicates UTC, which is ideal for timestamptz.
    const currentTimeISO = new Date().toISOString();

    const { error } = await supabase
      .from('tasks')
      .update({
        title: editingTask.title,
        description: editingTask.description,
        updated_at: currentTimeISO // Send the ISO 8601 string
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

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && user) { // Ensure user is logged in for drag and drop
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over?.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const newOrderedTasks = arrayMove(tasks, oldIndex, newIndex);

      let newOrderIndexForMovedTask: number;
      const movedTask = newOrderedTasks[newIndex];

      if (newIndex === 0) {
        newOrderIndexForMovedTask = newOrderedTasks[1]?.order_index / 2 || ORDER_INDEX_STEP / 2; // Handle case with only one task after move
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
        .eq('user_id', user.id); // Add user_id to update condition

      if (error) {
        console.error('Error updating task order in database: ', error.message);
        fetchTasks();
      }
    }
  };

  useEffect(() => {
    fetchUser(); // Fetch user on component mount
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []); // Run once on mount

  useEffect(() => {
    // Fetch tasks whenever the user state changes
    fetchTasks();
  }, [user]); // Re-fetch tasks when user state changes


  // You might want to add a loading state or redirect if no user
  if (user === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 animate-fadeIn">
          Welcome to Your Task Manager! 🚀
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-md">
          It looks like you're not logged in. Please log in or sign up to view and manage your tasks.
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
      <form
        onSubmit={handleSubmit}
        className="mt-15 w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl space-y-4 md:sticky md:top-4"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
          Add New Task
        </h2>
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
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-300 ease-in-out"
        >
          Add Task
        </Button>
      </form>

      {/* Task List Component */}
      <TaskList
        tasks={tasks}
        onEditTask={(editedTask) => {
          setEditingTask(editedTask);
          setIsUpdateModalOpen(true);
        }}
        onDeleteTask={handleDeleteTask}
        onDragEnd={handleDragEnd}
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