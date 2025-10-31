// components/UpdateTaskDialog.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

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


interface UpdateTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask: Task | null;
  onUpdateTask: (task: Task) => Promise<void>;
}

export function UpdateTaskDialog({ isOpen, onOpenChange, editingTask, onUpdateTask }: UpdateTaskDialogProps) {
  const [currentEditingTask, setCurrentEditingTask] = useState<Task | null>(editingTask);

  useEffect(() => {
    setCurrentEditingTask(editingTask);
  }, [editingTask]);

  const handleEditingChecklistItemChange = (index: number, value: string) => {
    setCurrentEditingTask((prev) => {
      if (!prev) return null;
      const updatedChecklistItems = [...(prev.checklist_items ?? [])];
      if (updatedChecklistItems[index]) {
        updatedChecklistItems[index] = { ...updatedChecklistItems[index], text: value };
      }
      return { ...prev, checklist_items: updatedChecklistItems };
    });
  };

  const handleAddEditingChecklistItem = () => {
    setCurrentEditingTask((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        checklist_items: [...(prev.checklist_items ?? []), { text: '', completed: false }],
      };
    });
  };

  const handleRemoveEditingChecklistItem = (index: number) => {
    setCurrentEditingTask((prev) => {
      if (!prev) return null;
      const updatedChecklistItems = (prev.checklist_items ?? []).filter((_, i) => i !== index);
      return { ...prev, checklist_items: updatedChecklistItems };
    });
  };

  const handleSave = async () => {
    if (currentEditingTask) {
      await onUpdateTask(currentEditingTask);
      onOpenChange(false);
    }
  };

  if (!currentEditingTask) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              value={currentEditingTask.title}
              onChange={(e) =>
                setCurrentEditingTask((prev) => (prev ? { ...prev, title: e.target.value } : null))
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
              value={currentEditingTask.description}
              onChange={(e) =>
                setCurrentEditingTask((prev) => (prev ? { ...prev, description: e.target.value } : null))
              }
              rows={4}
              className="col-span-3 dark:bg-gray-700 dark:text-white dark:border-gray-600 resize-y"
            />
          </div>
          <div className='checklist'>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Checklist</h3>
            {(currentEditingTask.checklist_items ?? []).map((item, index) => (
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
            onClick={() => onOpenChange(false)}
            className="dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white dark:focus:ring-offset-gray-800"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}