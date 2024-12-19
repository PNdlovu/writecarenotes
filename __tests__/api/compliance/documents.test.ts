import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { GET, POST, PUT } from '@/app/api/compliance/documents/route';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/prisma');

describe('Compliance Documents API', () => {
  const mockSession = {
    user: { id: 'test-user-id' }
  };

  const mockOrganization = {
    id: 'test-org-id',
    name: 'Test Care Home'
  };

  const mockDocuments = [
    {
      id: '1',
      name: 'Safety Policy',
      category: 'POLICY',
      type: 'SAFETY',
      status: 'ACTIVE',
      metadata: { region: 'england' },
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Care Protocol',
      category: 'PROTOCOL',
      type: 'CARE',
      status: 'DRAFT',
      metadata: { region: 'england' },
      updatedAt: new Date('2024-01-02')
    }
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.organization.findFirst as jest.Mock).mockResolvedValue(mockOrganization);
    (prisma.document.findMany as jest.Mock).mockResolvedValue(mockDocuments);
  });

  describe('GET', () => {
    it('should return 401 if not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost/api/compliance/documents?region=england');
      const response = await GET(request);
      
      expect(response.status).toBe(401);
      expect(await response.text()).toBe('Unauthorized');
    });

    it('should return 400 if region is missing', async () => {
      const request = new NextRequest('http://localhost/api/compliance/documents');
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Region is required');
    });

    it('should return 404 if organization not found', async () => {
      (prisma.organization.findFirst as jest.Mock).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost/api/compliance/documents?region=england');
      const response = await GET(request);
      
      expect(response.status).toBe(404);
      expect(await response.text()).toBe('Organization not found');
    });

    it('should return filtered documents by category', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/documents?region=england&category=POLICY'
      );
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].category).toBe('POLICY');
    });

    it('should return filtered documents by type', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/documents?region=england&type=SAFETY'
      );
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].type).toBe('SAFETY');
    });

    it('should return filtered documents by status', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/documents?region=england&status=DRAFT'
      );
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].status).toBe('DRAFT');
    });
  });

  describe('POST', () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const mockDocumentData = {
      name: 'New Policy',
      category: 'POLICY',
      type: 'SAFETY'
    };

    it('should create a new document', async () => {
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('data', JSON.stringify(mockDocumentData));

      const request = new NextRequest(
        'http://localhost/api/compliance/documents',
        {
          method: 'POST',
          body: formData
        }
      );

      (prisma.document.create as jest.Mock).mockResolvedValue({
        id: '3',
        ...mockDocumentData,
        status: 'DRAFT'
      });

      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.name).toBe(mockDocumentData.name);
      expect(data.status).toBe('DRAFT');
      expect(prisma.document.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...mockDocumentData,
          organizationId: mockOrganization.id,
          createdBy: mockSession.user.id,
          status: 'DRAFT'
        })
      });
    });

    it('should return 400 if file is missing', async () => {
      const formData = new FormData();
      formData.append('data', JSON.stringify(mockDocumentData));

      const request = new NextRequest(
        'http://localhost/api/compliance/documents',
        {
          method: 'POST',
          body: formData
        }
      );

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('File and document data are required');
    });

    it('should return 400 if document data is missing', async () => {
      const formData = new FormData();
      formData.append('file', mockFile);

      const request = new NextRequest(
        'http://localhost/api/compliance/documents',
        {
          method: 'POST',
          body: formData
        }
      );

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('File and document data are required');
    });
  });

  describe('PUT', () => {
    const mockUpdates = {
      name: 'Updated Policy',
      status: 'ACTIVE'
    };

    it('should update document metadata', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/documents',
        {
          method: 'PUT',
          body: JSON.stringify({
            id: '1',
            updates: mockUpdates
          })
        }
      );

      (prisma.document.update as jest.Mock).mockResolvedValue({
        id: '1',
        ...mockUpdates
      });

      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.name).toBe(mockUpdates.name);
      expect(data.status).toBe(mockUpdates.status);
      expect(prisma.document.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({
          ...mockUpdates,
          updatedBy: mockSession.user.id
        })
      });
    });

    it('should return 400 if document ID is missing', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/documents',
        {
          method: 'PUT',
          body: JSON.stringify({
            updates: mockUpdates
          })
        }
      );

      const response = await PUT(request);
      
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Document ID and updates are required');
    });

    it('should return 400 if updates are missing', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/documents',
        {
          method: 'PUT',
          body: JSON.stringify({
            id: '1'
          })
        }
      );

      const response = await PUT(request);
      
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Document ID and updates are required');
    });
  });
}); 