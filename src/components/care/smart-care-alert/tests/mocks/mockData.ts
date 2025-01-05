/**
 * @writecarenotes.com
 * @fileoverview Mock Data for Smart Care Alert Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

export const mockAlertRecords = [
    {
        id: 'alert-1',
        timestamp: new Date(),
        priority: 'urgent',
        status: 'active',
        location: {
            unit: 'A',
            floor: '1',
            room: '101'
        },
        description: 'Urgent assistance needed',
        updates: [
            {
                timestamp: new Date(),
                type: 'status',
                message: 'Alert created'
            }
        ]
    },
    {
        id: 'alert-2',
        timestamp: new Date(),
        priority: 'normal',
        status: 'active',
        location: {
            unit: 'B',
            floor: '2',
            room: '205'
        },
        description: 'Regular check requested',
        updates: []
    }
];

export const mockStaff = [
    {
        id: 'staff-1',
        name: 'John Doe',
        role: 'Care Worker',
        qualifications: ['First Aid', 'Medication Management'],
        availability: true,
        currentAssignment: null
    },
    {
        id: 'staff-2',
        name: 'Jane Smith',
        role: 'Senior Care Worker',
        qualifications: ['First Aid', 'Medication Management', 'Team Lead'],
        availability: true,
        currentAssignment: null
    }
];

export const mockOfflineData = {
    pendingAlerts: [
        {
            id: 'offline-1',
            timestamp: new Date(),
            priority: 'urgent',
            status: 'pending',
            location: {
                unit: 'C',
                floor: '1',
                room: '103'
            },
            description: 'Offline created alert',
            updates: []
        }
    ],
    pendingUpdates: [
        {
            alertId: 'alert-1',
            update: {
                timestamp: new Date(),
                type: 'status',
                message: 'Offline status update'
            }
        }
    ]
};

export const mockComplianceData = {
    cqc: {
        compliant: true,
        lastCheck: new Date(),
        requirements: [
            'Staff Training',
            'Response Times',
            'Documentation'
        ]
    },
    ofsted: {
        compliant: true,
        lastCheck: new Date(),
        requirements: [
            'Safeguarding',
            'Age-Appropriate Response',
            'Educational Integration'
        ]
    }
}; 