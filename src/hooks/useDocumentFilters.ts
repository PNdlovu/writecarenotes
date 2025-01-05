import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DocumentType, DocumentStatus } from '@prisma/client';

interface DocumentFilters {
  query?: string;
  type?: DocumentType;
  status?: DocumentStatus;
  categoryId?: string;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
}

export function useDocumentFilters() {
  const router = useRouter();
  const [filters, setFilters] = useState<DocumentFilters>({});

  // Initialize filters from URL query parameters
  useEffect(() => {
    const {
      query,
      type,
      status,
      categoryId,
      tags,
      startDate,
      endDate,
    } = router.query;

    setFilters({
      query: query as string,
      type: type as DocumentType,
      status: status as DocumentStatus,
      categoryId: categoryId as string,
      tags: typeof tags === 'string' ? [tags] : (tags as string[]),
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const query = {
      ...router.query,
      ...filters,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    };

    // Remove undefined values
    Object.keys(query).forEach(
      (key) => query[key] === undefined && delete query[key]
    );

    router.replace(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  }, [filters]);

  const clearFilters = () => {
    setFilters({});
  };

  return {
    filters,
    setFilters,
    clearFilters,
  };
}


