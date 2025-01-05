import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface Training {
  id: string;
  title: string;
  description: string;
  type: 'onboarding' | 'certification' | 'skills' | 'compliance';
  startDate: Date;
  endDate: Date;
  instructor?: string;
  location?: string;
  capacity: number;
  enrolled: number;
  prerequisites?: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  materials?: { id: string; name: string; url: string }[];
}

interface TraineeProgress {
  userId: string;
  userName: string;
  trainingId: string;
  progress: number;
  status: 'enrolled' | 'in-progress' | 'completed' | 'failed';
  lastActivity?: Date;
  certification?: {
    issued?: Date;
    expires?: Date;
    status: 'active' | 'expired' | 'pending';
  };
}

export const TrainingSchedule: React.FC = () => {
  const [selectedType, setSelectedType] = useState<Training['type']>('onboarding');

  const { data: trainings } = useQuery<Training[]>(
    ['trainings', selectedType],
    () => scheduleAPI.getTrainings(selectedType),
  );

  const { data: progress } = useQuery<TraineeProgress[]>(
    ['training-progress'],
    () => scheduleAPI.getTrainingProgress(),
  );

  const enrollMutation = useMutation(
    (trainingId: string) => scheduleAPI.enrollInTraining(trainingId),
  );

  const getStatusColor = (status: Training['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
    }
  };

  const getProgressColor = (status: TraineeProgress['status']) => {
    switch (status) {
      case 'enrolled':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          {(['onboarding', 'certification', 'skills', 'compliance'] as Training['type'][]).map(
            (type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg ${
                  selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            )
          )}
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Schedule Training
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Upcoming Trainings</h3>
            <div className="space-y-4">
              {trainings?.map((training) => (
                <div key={training.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{training.title}</h4>
                      <p className="text-sm text-gray-600">{training.description}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        training.status
                      )}`}
                    >
                      {training.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-3">
                    <div>
                      <div>Start: {new Date(training.startDate).toLocaleDateString()}</div>
                      <div>End: {new Date(training.endDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div>Instructor: {training.instructor}</div>
                      <div>Location: {training.location}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm text-gray-600 mb-1">
                      Enrollment: {training.enrolled}/{training.capacity}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(training.enrolled / training.capacity) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  {training.prerequisites && training.prerequisites.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm text-gray-600 mb-1">Prerequisites:</div>
                      <div className="flex flex-wrap gap-2">
                        {training.prerequisites.map((prereq) => (
                          <span
                            key={prereq}
                            className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                          >
                            {prereq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {training.materials && training.materials.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm text-gray-600 mb-1">Materials:</div>
                      <div className="flex flex-wrap gap-2">
                        {training.materials.map((material) => (
                          <a
                            key={material.id}
                            href={material.url}
                            className="text-blue-600 hover:underline text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {material.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-4">
                    <button
                      onClick={() => enrollMutation.mutate(training.id)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      disabled={training.enrolled >= training.capacity}
                    >
                      {training.enrolled >= training.capacity ? 'Full' : 'Enroll'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
            <div className="space-y-4">
              {progress?.map((item) => (
                <div key={item.trainingId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{item.userName}</div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getProgressColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-600 mb-1">
                      Progress: {item.progress}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  {item.lastActivity && (
                    <div className="mt-2 text-sm text-gray-600">
                      Last activity: {new Date(item.lastActivity).toLocaleString()}
                    </div>
                  )}
                  {item.certification && (
                    <div className="mt-2 text-sm">
                      <div
                        className={`${
                          item.certification.status === 'active'
                            ? 'text-green-600'
                            : item.certification.status === 'expired'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }`}
                      >
                        Certification: {item.certification.status}
                      </div>
                      {item.certification.issued && (
                        <div className="text-gray-600">
                          Issued: {new Date(item.certification.issued).toLocaleDateString()}
                        </div>
                      )}
                      {item.certification.expires && (
                        <div className="text-gray-600">
                          Expires: {new Date(item.certification.expires).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
