export const painManagementDBConfig = {
  name: 'painManagement',
  version: 1,
  stores: {
    assessments: {
      keyPath: 'id',
      indexes: [
        { name: 'residentId', keyPath: 'residentId' },
        { name: 'assessmentDate', keyPath: 'assessmentDate' },
        { name: 'syncStatus', keyPath: 'syncStatus' }
      ]
    },
    plans: {
      keyPath: 'id',
      indexes: [
        { name: 'residentId', keyPath: 'residentId' },
        { name: 'active', keyPath: 'active' }
      ]
    }
  }
}; 