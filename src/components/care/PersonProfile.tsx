import React from 'react';
import { BasePerson, isChildPerson } from '../../types/care';

interface PersonProfileProps {
  person: BasePerson;
}

export const PersonProfile: React.FC<PersonProfileProps> = ({ person }) => {
  // Common profile rendering for all care types
  const renderCommonDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {person.photo && (
          <img 
            src={person.photo} 
            alt={`${person.firstName} ${person.lastName}`} 
            className="h-16 w-16 rounded-full"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold">
            {person.firstName} {person.lastName}
          </h2>
          <p className="text-gray-500">
            {new Date(person.dateOfBirth).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );

  // Specialized children's home fields
  const renderChildrensDetails = () => {
    if (!isChildPerson(person)) return null;

    return (
      <div className="mt-4 space-y-4">
        {person.education && (
          <div>
            <h3 className="font-semibold">Education</h3>
            <p>School: {person.education.school}</p>
            <p>Year Group: {person.education.yearGroup}</p>
          </div>
        )}
        {person.placement && (
          <div>
            <h3 className="font-semibold">Placement</h3>
            <p>Local Authority: {person.placement.localAuthority}</p>
            <p>Social Worker: {person.placement.socialWorker.firstName} {person.placement.socialWorker.lastName}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {renderCommonDetails()}
      {/* Render care-type specific details */}
      {isChildPerson(person) && renderChildrensDetails()}
      
      {/* Common actions for all care types */}
      <div className="mt-6 flex space-x-4">
        <button className="btn-primary">Update Details</button>
        <button className="btn-secondary">View Care Plan</button>
        {isChildPerson(person) && (
          <button className="btn-secondary">Education Records</button>
        )}
      </div>
    </div>
  );
};
