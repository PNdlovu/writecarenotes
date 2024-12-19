import prisma from './prisma';
import { Document } from '@prisma/client';

export type SearchParams = {
  query?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  organizationId: string;
  staffId?: string;
  page?: number;
  limit?: number;
};

export type SearchResult = {
  documents: Document[];
  total: number;
  page: number;
  totalPages: number;
};

export async function searchDocuments({
  query,
  category,
  dateFrom,
  dateTo,
  tags,
  organizationId,
  staffId,
  page = 1,
  limit = 10,
}: SearchParams): Promise<SearchResult> {
  const where: any = {
    organizationId,
  };

  // Full-text search on title and description
  if (query) {
    where.OR = [
      {
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        tags: {
          hasSome: [query],
        },
      },
    ];
  }

  // Filter by category
  if (category) {
    where.category = category;
  }

  // Filter by staff
  if (staffId) {
    where.staffId = staffId;
  }

  // Filter by date range
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = dateFrom;
    }
    if (dateTo) {
      where.createdAt.lte = dateTo;
    }
  }

  // Filter by tags
  if (tags && tags.length > 0) {
    where.tags = {
      hasSome: tags,
    };
  }

  // Get total count for pagination
  const total = await prisma.document.count({ where });
  const totalPages = Math.ceil(total / limit);

  // Get paginated results
  const documents = await prisma.document.findMany({
    where,
    include: {
      metadata: true,
      signatures: {
        orderBy: {
          signedAt: 'desc',
        },
      },
      auditTrail: {
        orderBy: {
          timestamp: 'desc',
        },
        take: 5,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    documents,
    total,
    page,
    totalPages,
  };
}


