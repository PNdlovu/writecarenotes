import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '@/services/staffService';
import { StaffMember, StaffRole, EmploymentStatus } from '@/features/staff/types';
import { toast } from '@/components/ui/UseToast';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Form/Input';
import { Label } from '@/components/ui/Form/Label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export const StaffDirectoryPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<StaffRole | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<EmploymentStatus | ''>('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: staffMembers, isLoading } = useQuery({
    queryKey: ['staffMembers', selectedRole, selectedStatus, searchTerm],
    queryFn: () =>
      staffService.getStaffMembers({
        role: selectedRole || undefined,
        status: selectedStatus || undefined,
        search: searchTerm || undefined,
      }),
  });

  const updateStaffMutation = useMutation({
    mutationFn: ({ id, update }: { id: string; update: Partial<StaffMember> }) =>
      staffService.updateStaffMember(id, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffMembers'] });
      toast.success('Staff member updated successfully');
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update staff member');
      console.error('Update error:', error);
    },
  });

  const terminateStaffMutation = useMutation({
    mutationFn: (id: string) =>
      staffService.terminateStaffMember(id, new Date().toISOString(), 'Employment terminated'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffMembers'] });
      toast.success('Staff member terminated successfully');
    },
    onError: (error) => {
      toast.error('Failed to terminate staff member');
      console.error('Termination error:', error);
    },
  });

  const handleEditStaff = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsEditDialogOpen(true);
  };

  const handleUpdateStaff = (update: Partial<StaffMember>) => {
    if (selectedStaff) {
      updateStaffMutation.mutate({ id: selectedStaff.id, update });
    }
  };

  const handleTerminateStaff = (staff: StaffMember) => {
    if (window.confirm('Are you sure you want to terminate this staff member?')) {
      terminateStaffMutation.mutate(staff.id);
    }
  };

  const getRoleColor = (role: StaffRole) => {
    const colors: Record<StaffRole, string> = {
      NURSE: 'bg-green-500',
      DOCTOR: 'bg-blue-500',
      ADMIN: 'bg-purple-500',
      CAREGIVER: 'bg-orange-500',
      MAINTENANCE: 'bg-brown-500',
      KITCHEN: 'bg-red-500',
    };
    return colors[role] || 'bg-gray-500';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Staff Directory</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <Input
            type="text"
            placeholder="Search Staff"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Select
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as StaffRole)}
          >
            <option value="">All Roles</option>
            {Object.values(StaffRole).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Select
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as EmploymentStatus)}
          >
            <option value="">All Statuses</option>
            {Object.values(EmploymentStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading staff directory...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffMembers?.map((staff) => (
            <Card key={staff.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden mr-4">
                  {staff.profileImage && (
                    <img
                      src={staff.profileImage}
                      alt={`${staff.firstName} ${staff.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    {staff.firstName} {staff.lastName}
                  </h2>
                  <Badge className={`px-2 py-1 text-xs text-white rounded-full ${getRoleColor(staff.role)}`}>
                    {staff.role}
                  </Badge>
                </div>
              </div>
              <div className="text-gray-600 mb-2">{staff.email}</div>
              <div className="text-gray-600 mb-2">Department: {staff.department}</div>
              <div className="text-gray-600">Status: {staff.status}</div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  onClick={() => handleEditStaff(staff)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  <PencilIcon className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => handleTerminateStaff(staff)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <TrashIcon className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogContent className="w-full max-w-md bg-white rounded-lg p-6">
            <DialogTitle className="text-lg font-medium mb-4">
              Edit Staff Member
            </DialogTitle>
            {selectedStaff && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      defaultValue={selectedStaff.firstName}
                      onChange={(e) =>
                        handleUpdateStaff({ firstName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      defaultValue={selectedStaff.lastName}
                      onChange={(e) =>
                        handleUpdateStaff({ lastName: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    defaultValue={selectedStaff.email}
                    onChange={(e) =>
                      handleUpdateStaff({ email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Select
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={selectedStaff.department}
                    onChange={(e) =>
                      handleUpdateStaff({ department: e.target.value })
                    }
                  >
                    <option value="Nursing">Nursing</option>
                    <option value="Medical">Medical</option>
                    <option value="Administration">Administration</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Kitchen">Kitchen</option>
                  </Select>
                </div>
                <div>
                  <Label>Role</Label>
                  <Select
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={selectedStaff.role}
                    onChange={(e) =>
                      handleUpdateStaff({ role: e.target.value as StaffRole })
                    }
                  >
                    {Object.values(StaffRole).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    onClick={() => setIsEditDialogOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleUpdateStaff(selectedStaff)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </div>
      </Dialog>
    </div>
  );
};


