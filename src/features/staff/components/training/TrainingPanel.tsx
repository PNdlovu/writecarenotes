import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format, isAfter } from 'date-fns';

interface Training {
  id: number;
  title: string;
  type: string;
  status: string;
  dueDate: string;
  description: string;
}

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  training: {
    completed: Training[];
    required: Training[];
  };
}

export default function TrainingPanel() {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTraining, setNewTraining] = useState({
    title: '',
    type: '',
    dueDate: '',
    description: ''
  });
  const [isUpdateRequiredOpen, setIsUpdateRequiredOpen] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      training: {
        completed: [
          {
            id: 1,
            title: "Safety Procedures",
            type: "Mandatory",
            status: "Completed",
            dueDate: "2024-03-15",
            description: "Annual safety procedures training"
          }
        ],
        required: [
          {
            id: 2,
            title: "Customer Service Excellence",
            type: "Optional",
            status: "Pending",
            dueDate: "2024-04-01",
            description: "Advanced customer service techniques"
          }
        ]
      }
    }
  ]);

  const handleAddTraining = () => {
    const training = {
      id: selectedStaff?.training.completed.length + 1,
      ...newTraining,
      status: 'Completed'
    };
    setSelectedStaff({
      ...selectedStaff!,
      training: {
        ...selectedStaff!.training,
        completed: [...selectedStaff!.training.completed, training]
      }
    });
    setIsAddDialogOpen(false);
    setNewTraining({ title: '', type: '', dueDate: '', description: '' });
  };

  const handleUpdateRequiredTraining = (trainingId: number) => {
    const training = selectedStaff?.training.required.find(t => t.id === trainingId);
    if (training) {
      setSelectedStaff({
        ...selectedStaff!,
        training: {
          ...selectedStaff!.training,
          required: selectedStaff!.training.required.map(t => t.id === trainingId ? { ...t, status: 'Completed' } : t)
        }
      });
    }
    setIsUpdateRequiredOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Staff Training Management</h2>
      </div>

      <div className="grid gap-4">
        {staffMembers.map((staff) => (
          <div
            key={staff.id}
            className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{staff.firstName} {staff.lastName}</h3>
              </div>
            </div>
            <div className="flex gap-4 mt-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Completed Trainings:</span> {staff.training.completed.length}
              </div>
              <div>
                <span className="font-medium">Required Trainings:</span> {staff.training.required.length}
              </div>
            </div>
            <Button onClick={() => setSelectedStaff(staff)}>View Trainings</Button>
          </div>
        ))}
      </div>

      {selectedStaff && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Trainings for {selectedStaff.firstName} {selectedStaff.lastName}</h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Training</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Training</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                    <Input
                      id="title"
                      value={newTraining.title}
                      onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="type" className="text-sm font-medium">Type</label>
                    <Select
                      value={newTraining.type}
                      onValueChange={(value) => setNewTraining({ ...newTraining, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mandatory">Mandatory</SelectItem>
                        <SelectItem value="Optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="dueDate" className="text-sm font-medium">Due Date</label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTraining.dueDate}
                      onChange={(e) => setNewTraining({ ...newTraining, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="description" className="text-sm font-medium">Description</label>
                    <Input
                      id="description"
                      value={newTraining.description}
                      onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTraining}>Add Training</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Completed Trainings</h3>
                </div>
              </div>
              <div className="grid gap-4">
                {selectedStaff.training.completed.map((training) => (
                  <div
                    key={training.id}
                    className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{training.title}</h3>
                        <p className="text-sm text-gray-500">{training.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Type:</span> {training.type}
                      </div>
                      <div>
                        <span className="font-medium">Due Date:</span>{' '}
                        {format(new Date(training.dueDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Required Trainings</h3>
                </div>
              </div>
              <div className="grid gap-4">
                {selectedStaff.training.required.map((training) => (
                  <div
                    key={training.id}
                    className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{training.title}</h3>
                        <p className="text-sm text-gray-500">{training.description}</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(training.status)}>
                        {training.status}
                      </Badge>
                    </div>
                    <div className="flex gap-4 mt-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Type:</span> {training.type}
                      </div>
                      <div>
                        <span className="font-medium">Due Date:</span>{' '}
                        {format(new Date(training.dueDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <Button onClick={() => handleUpdateRequiredTraining(training.id)}>Mark as Completed</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


