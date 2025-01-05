import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  isOnCall: boolean;
  lastContactAttempt?: Date;
  responseStatus?: 'pending' | 'accepted' | 'declined';
}

interface EmergencyShift {
  id: string;
  type: 'emergency' | 'on-call' | 'backup';
  startTime: Date;
  endTime: Date;
  assignedTo?: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed';
}

export const EmergencyRoster: React.FC = () => {
  const [selectedShift, setSelectedShift] = useState<string | null>(null);

  const { data: emergencyContacts } = useQuery<EmergencyContact[]>(
    ['emergency', 'contacts'],
    () => scheduleAPI.getEmergencyContacts(),
  );

  const { data: emergencyShifts } = useQuery<EmergencyShift[]>(
    ['emergency', 'shifts'],
    () => scheduleAPI.getEmergencyShifts(),
  );

  const contactMutation = useMutation(
    (contactId: string) => scheduleAPI.contactEmergencyStaff(contactId),
  );

  const assignShiftMutation = useMutation(
    ({ shiftId, contactId }: { shiftId: string; contactId: string }) =>
      scheduleAPI.assignEmergencyShift(shiftId, contactId),
  );

  const getStatusColor = (status: EmergencyShift['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Emergency Shifts</h3>
        <div className="space-y-4">
          {emergencyShifts?.map((shift) => (
            <div
              key={shift.id}
              className={`border rounded-lg p-4 ${
                selectedShift === shift.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedShift(shift.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">
                    {shift.type.charAt(0).toUpperCase() + shift.type.slice(1)} Shift
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(shift.startTime).toLocaleString()} -{' '}
                    {new Date(shift.endTime).toLocaleString()}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                    shift.status
                  )}`}
                >
                  {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                </span>
              </div>
              {shift.assignedTo && (
                <div className="mt-2 text-sm text-gray-600">
                  Assigned to: {shift.assignedTo}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Available Staff</h3>
          <button
            onClick={() => {}}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Broadcast Alert
          </button>
        </div>
        <div className="space-y-4">
          {emergencyContacts?.map((contact) => (
            <div key={contact.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm text-gray-600">{contact.role}</div>
                  <div className="text-sm text-gray-600">
                    {contact.phone} | {contact.email}
                  </div>
                </div>
                <div className="space-x-2">
                  {selectedShift && (
                    <button
                      onClick={() =>
                        assignShiftMutation.mutate({
                          shiftId: selectedShift,
                          contactId: contact.id,
                        })
                      }
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Assign
                    </button>
                  )}
                  <button
                    onClick={() => contactMutation.mutate(contact.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Contact
                  </button>
                </div>
              </div>
              {contact.lastContactAttempt && (
                <div className="mt-2 text-sm text-gray-500">
                  Last contacted: {new Date(contact.lastContactAttempt).toLocaleString()}
                  {contact.responseStatus && (
                    <span
                      className={`ml-2 ${
                        contact.responseStatus === 'accepted'
                          ? 'text-green-600'
                          : contact.responseStatus === 'declined'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      ({contact.responseStatus})
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
