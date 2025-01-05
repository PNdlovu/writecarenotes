import { BasePerson } from '@/types/care';
import { mockOfstedData } from './ofstedData';

export const mockPerson: BasePerson = {
  id: "123",
  name: "Test Child",
  dateOfBirth: new Date("2010-01-01"),
  gender: "MALE",
  status: "active",
  createdAt: new Date("2023-01-01"),
  updatedAt: new Date("2023-06-01"),
  ofstedRequirements: mockOfstedData,
  // Add other required fields as needed
};
