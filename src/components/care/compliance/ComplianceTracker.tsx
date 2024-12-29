import React from 'react';
import { ComplianceRequirement, CareType, RegulatorType } from '../../../types/care';

interface ComplianceTrackerProps {
  careType: CareType;
  regulators: RegulatorType[];
}

export const ComplianceTracker: React.FC<ComplianceTrackerProps> = ({ 
  careType,
  regulators 
}) => {
  // Example compliance requirements - in production, these would come from an API
  const requirements: ComplianceRequirement[] = [
    {
      id: 'safeguarding',
      name: 'Safeguarding',
      description: 'Ensure all safeguarding procedures are followed',
      regulators: ['CQC', 'OFSTED'],
      applicableCareTypes: ['childrens', 'elderly'],
      frequency: 'monthly',
      items: [
        {
          id: 'staff-dbs',
          title: 'Staff DBS Checks',
          description: 'Ensure all staff DBS checks are up to date',
          required: true,
          evidence: ['DBS Certificates', 'Staff Records']
        },
        // More items...
      ]
    },
    // More requirements...
  ];

  const filteredRequirements = requirements.filter(req => 
    req.applicableCareTypes.includes(careType) &&
    req.regulators.some(r => regulators.includes(r))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Compliance Tracking</h2>
          <p className="text-sm text-gray-500">
            Monitoring compliance for {regulators.join(', ')}
          </p>
        </div>
        <button className="btn-primary">Generate Report</button>
      </div>

      <div className="grid gap-6">
        {filteredRequirements.map(requirement => (
          <div key={requirement.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{requirement.name}</h3>
                <p className="text-sm text-gray-500">{requirement.description}</p>
              </div>
              <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                {requirement.frequency}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {requirement.items.map(item => (
                <div key={item.id} className="flex items-start space-x-4">
                  <input 
                    type="checkbox" 
                    className="mt-1"
                    id={item.id}
                  />
                  <div>
                    <label 
                      htmlFor={item.id}
                      className="block text-sm font-medium text-gray-900"
                    >
                      {item.title}
                    </label>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    {item.evidence.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Required evidence:</span>
                        <ul className="mt-1 text-xs text-gray-500">
                          {item.evidence.map((ev, i) => (
                            <li key={i}>• {ev}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
