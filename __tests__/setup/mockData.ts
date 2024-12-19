export const mockFacility = {
  id: 'test-facility-id',
  name: 'Test Care Home',
  address: '123 Test Street',
  city: 'Test City',
  postcode: 'TS1 1ST',
  phone: '01234567890',
  email: 'facility@test.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const mockResident = {
  id: 'test-resident-id',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1950-01-01',
  roomNumber: '101',
  facilityId: 'test-facility-id',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const mockMedication = {
  id: 'test-medication-id',
  name: 'Test Medication',
  dosage: '10mg',
  frequency: 'Daily',
  instructions: 'Take with food',
  residentId: 'test-resident-id',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const mockStaffMember = {
  id: 'test-staff-id',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@test.com',
  role: 'STAFF',
  facilityId: 'test-facility-id',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const mockSchedule = {
  id: 'test-schedule-id',
  staffId: 'test-staff-id',
  facilityId: 'test-facility-id',
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
