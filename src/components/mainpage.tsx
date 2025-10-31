// app/page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabase-client';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AddTaskDialog } from '@/components/addtaskdialog';
import { UpdateTaskDialog } from '@/components/updatetaskdialog';
import { TaskListContainer } from '@/components/tasklistcontainer';
import { arrayMove } from '@dnd-kit/sortable';
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
  // Renamed from check_completed to completed for consistency
  completed: boolean;
  due_date: string;
  user_id: string;
  checklist_items?: ChecklistItem[];
}

const ORDER_INDEX_STEP = 1000;

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [user, setUser] = useState<User | null | undefined>(undefined);

  const fetchTasks = useCallback(async () => {
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
     
      completed: task.completed, 
    }));
    setTasks(tasksWithOrder);
  }, [user]);

  const handleAddTask = async (newTaskData: { title: string; description: string; checklist_items: ChecklistItem[] }) => {
    if (!user) {
      alert('You must be logged in to add a task.');
      return;
    }

    if (!newTaskData.title.trim()) {
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
      .insert({ ...newTaskData, user_id: user.id, order_index: nextOrderIndex, completed: false })
      .select()
      .single();

    if (error) {
      console.error('Error adding task: ', error.message);
      return;
    }

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

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!user) {
      alert('You must be logged in to update a task.');
      return;
    }

    if (!updatedTask.title.trim()) {
      alert('Task title cannot be empty.');
      return;
    }

    const currentTimeISO = new Date().toISOString();

    const { error } = await supabase
      .from('tasks')
      .update({
        title: updatedTask.title,
        description: updatedTask.description,
        updated_at: currentTimeISO,
        checklist_items: updatedTask.checklist_items ?? [],
        completed: updatedTask.completed,
      })
      .eq('id', updatedTask.id)
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

 
  const handleToggleTaskCompletion = async (taskId: number, isCompleted: boolean) => {
    if (!user) {
      alert('You must be logged in to update a task.');
      return;
    }

    
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: isCompleted } : task
      )
    );

    const { error } = await supabase
      .from('tasks')
      .update({ completed: isCompleted })
      .eq('id', taskId)
      .eq('user_id', user.id);
    if (error) {
      console.error('Error updating task completion:', error.message);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, completed: !isCompleted } : task
        )
      );
    }
  };


  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user !== undefined) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

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
      <div className="mt-12">
        <AddTaskDialog onAddTask={handleAddTask} />
      </div>

      <TaskListContainer
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
        onToggleTaskCompletion={handleToggleTaskCompletion} 
      />

      {editingTask && (
        <UpdateTaskDialog
          isOpen={isUpdateModalOpen}
          onOpenChange={setIsUpdateModalOpen}
          editingTask={editingTask}
          onUpdateTask={handleUpdateTask}
        />
      )}
    </div>
  );
}