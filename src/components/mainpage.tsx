'use client'
import { useState, useEffect } from 'react';
import { supabase } from "@/supabase-client";
import { Button } from "@/components/ui/button"; // Assuming you have shadcn button component
import { Input } from "@/components/ui/input"; // Assuming you have shadcn input component
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; // Import Dialog components for update modal

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export default function Home() {
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null); // State for the task being edited
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // State to control update modal visibility

  const fetchTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching tasks: ", error.message);
      return;
    }
    setTasks(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.title.trim()) {
      alert("Task title cannot be empty.");
      return;
    }

    const { error } = await supabase.from("tasks").insert(newTask).single();

    if (error) {
      console.error("Error adding task: ", error.message);
      return;
    }

    setNewTask({ title: "", description: "" }); // Clear form fields
    fetchTasks(); // Refresh tasks after adding
  };

  const handleDeleteTask = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error("Error deleting task: ", error.message);
      return;
    }
    fetchTasks(); // Refresh tasks after deleting
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    if (!editingTask.title.trim()) {
      alert("Task title cannot be empty.");
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .update({ title: editingTask.title, description: editingTask.description })
      .eq("id", editingTask.id);

    if (error) {
      console.error("Error updating task: ", error.message);
      return;
    }

    setIsUpdateModalOpen(false); // Close the modal
    setEditingTask(null); // Clear editing task state
    fetchTasks(); // Refresh tasks after updating
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-start justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 gap-8">
      
      {/* Add New Task Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl space-y-4 md:sticky md:top-4"
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
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, title: e.target.value }))
            }
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

      {/* Task List */}
      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
        {tasks.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center col-span-full">No tasks found. Add a new task to get started!</p>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="w-full h-full flex flex-col justify-between dark:bg-gray-800 dark:text-white border dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">{task.title}</CardTitle>
                <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                  Created: {new Date(task.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-700 dark:text-gray-300">{task.description}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingTask(task);
                    setIsUpdateModalOpen(true);
                  }}
                  className="hover:bg-blue-100 dark:hover:bg-blue-900 dark:text-blue-400 dark:border-blue-700"
                >
                  Update
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteTask(task.id)}
                  className="hover:bg-red-700 dark:hover:bg-red-800"
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Update Task Modal */}
      {editingTask && (
        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Edit Task</DialogTitle>
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
              <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)} className="dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                Cancel
              </Button>
              <Button type="submit" onClick={handleUpdateTask} className="bg-blue-600 hover:bg-blue-700 text-white dark:focus:ring-offset-gray-800">
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}