// components/AddTaskDialog.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface ChecklistItem {
  text: string;
  completed: boolean;
}

interface AddTaskDialogProps {
  onAddTask: (task: { title: string; description: string; checklist_items: ChecklistItem[] }) => Promise<void>;
}

export function AddTaskDialog({ onAddTask }: AddTaskDialogProps) {
  const [newTask, setNewTask] = useState({ title: '', description: '', checklist_items: [] as ChecklistItem[] });
  const [isOpen, setIsOpen] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddTask(newTask);
    setNewTask({ title: '', description: '', checklist_items: [] }); 
    setIsOpen(false); 
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button className="text-3xl leading-tight">
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
  );
}