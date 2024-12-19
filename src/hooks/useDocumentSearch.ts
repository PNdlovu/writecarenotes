import { useQuery } from '@tanstack/react-query';
import { Document } from '@/features/staff/types';

interface SearchParams {
  query?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  staffId: string;
  page?: number;
  limit?: number;
}

interface SearchResponse {
  documents: Document[];
  total: number;
  page: number;
  totalPages: number;
}

export function useDocumentSearch({
  query,
  category,
  dateFrom,
  dateTo,
  tags,
  staffId,
  page = 1,
  limit = 10,
}: SearchParams) {
  return useQuery<SearchResponse>({
    queryKey: ['documents', staffId, { query, category, dateFrom, dateTo, tags, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (query) params.append('query', query);
      if (category) params.append('category', category);
      if (dateFrom) params.append('dateFrom', dateFrom.toISOString());
      if (dateTo) params.append('dateTo', dateTo.toISOString());
      if (tags?.length) params.append('tags', tags.join(','));
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await fetch(`/api/staff/${staffId}/documents?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      return response.json();
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDocument(staffId: string, documentId: string) {
  return useQuery({
    queryKey: ['document', staffId, documentId],
    queryFn: async () => {
      const response = await fetch(`/api/staff/${staffId}/documents/${documentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDocumentVersions(staffId: string, documentId: string) {
  return useQuery({
    queryKey: ['document-versions', staffId, documentId],
    queryFn: async () => {
      const response = await fetch(`/api/staff/${staffId}/documents/${documentId}/versions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch document versions');
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDocumentTemplates(organizationId: string) {
  return useQuery({
    queryKey: ['document-templates', organizationId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/templates?organizationId=${organizationId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch document templates');
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}


