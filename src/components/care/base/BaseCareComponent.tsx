import React from 'react';
import { BasePerson, CareType } from '../../../types/care';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface BaseCareProps {
  person: BasePerson;
  careType: CareType;
}

export const BaseCareComponent: React.FC<BaseCareProps> = ({ person, careType }) => {
  return (
    <div className="space-y-6">
      {/* Common Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {person.firstName} {person.lastName}
          </h2>
          <p className="text-muted-foreground">
            ID: {person.id}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Edit</Button>
          <Button>Care Plan</Button>
        </div>
      </div>

      {/* Common Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="font-medium mb-4">Personal Information</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Date of Birth</dt>
                <dd>{new Date(person.dateOfBirth).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Gender</dt>
                <dd>{person.gender}</dd>
              </div>
              {person.nhsNumber && (
                <div>
                  <dt className="text-sm text-muted-foreground">NHS Number</dt>
                  <dd>{person.nhsNumber}</dd>
                </div>
              )}
            </dl>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="font-medium mb-4">Care Status</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Status</dt>
                <dd className="capitalize">{person.status}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Care Type</dt>
                <dd className="capitalize">{careType.replace('-', ' ')}</dd>
              </div>
            </dl>
          </div>
        </Card>
      </div>
    </div>
  );
};
