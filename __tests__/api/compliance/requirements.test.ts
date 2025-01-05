import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { GET, POST, PUT } from '@/app/api/compliance/requirements/route';
import { prisma } from '@/lib/prisma';
import { regulatoryCompliance } from '@/lib/services/regulatory-compliance';
import { ComplianceCategory } from '@/types/compliance';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/prisma');
jest.mock('@/lib/services/regulatory-compliance');

describe('Compliance Requirements API', () => {
  const mockSession = {
    user: { id: 'test-user-id' }
  };

  const mockOrganization = {
    id: 'test-org-id',
    name: 'Test Care Home'
  };

  const mockRequirements = [
    {
      id: '1',
      name: 'Safety Protocol',
      description: 'Standard safety measures',
      category: ComplianceCategory.SAFETY,
      status: 'COMPLIANT'
    },
    {
      id: '2',
      name: 'Care Standards',
      description: 'Basic care requirements',
      category: ComplianceCategory.CARE,
      status: 'NON_COMPLIANT'
    }
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.organization.findFirst as jest.Mock).mockResolvedValue(mockOrganization);
    (regulatoryCompliance.getRequirements as jest.Mock).mockResolvedValue(mockRequirements);
  });

  describe('GET', () => {
    it('should return 401 if not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost/api/compliance/requirements?region=england');
      const response = await GET(request);
      
      expect(response.status).toBe(401);
      expect(await response.text()).toBe('Unauthorized');
    });

    it('should return 400 if region is missing', async () => {
      const request = new NextRequest('http://localhost/api/compliance/requirements');
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Region is required');
    });

    it('should return filtered requirements when category is specified', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/requirements?region=england&category=SAFETY'
      );
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.requirements).toHaveLength(1);
      expect(data.requirements[0].category).toBe(ComplianceCategory.SAFETY);
    });

    it('should return search filtered requirements', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/requirements?region=england&search=safety'
      );
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.requirements).toHaveLength(1);
      expect(data.requirements[0].name).toContain('Safety');
    });
  });

  describe('POST', () => {
    const mockRequirement = {
      name: 'New Requirement',
      description: 'Test description',
      category: ComplianceCategory.SAFETY
    };

    it('should create a new requirement', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/requirements',
        {
          method: 'POST',
          body: JSON.stringify({
            region: 'england',
            requirement: mockRequirement
          })
        }
      );

      (prisma.complianceRequirement.create as jest.Mock).mockResolvedValue({
        id: '3',
        ...mockRequirement
      });

      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.name).toBe(mockRequirement.name);
      expect(prisma.complianceRequirement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...mockRequirement,
          region: 'england',
          organizationId: mockOrganization.id
        })
      });
    });

    it('should return 400 if requirement data is missing', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/requirements',
        {
          method: 'POST',
          body: JSON.stringify({ region: 'england' })
        }
      );

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Region and requirement data are required');
    });
  });

  describe('PUT', () => {
    const mockUpdates = {
      name: 'Updated Requirement',
      status: 'COMPLIANT'
    };

    it('should update an existing requirement', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/requirements',
        {
          method: 'PUT',
          body: JSON.stringify({
            id: '1',
            updates: mockUpdates
          })
        }
      );

      (prisma.complianceRequirement.update as jest.Mock).mockResolvedValue({
        id: '1',
        ...mockUpdates
      });

      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.name).toBe(mockUpdates.name);
      expect(prisma.complianceRequirement.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: mockUpdates
      });
    });

    it('should return 400 if update data is missing', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/requirements',
        {
          method: 'PUT',
          body: JSON.stringify({ id: '1' })
        }
      );

      const response = await PUT(request);
      
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Requirement ID and updates are required');
    });
  });
}); 