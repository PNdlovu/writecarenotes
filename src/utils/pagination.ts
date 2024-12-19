export interface PaginationParams {
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface PaginatedResult<T> {
  data: T[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const paginateData = <T>(
  data: T[],
  params: PaginationParams
): PaginatedResult<T> => {
  const { page, pageSize, totalItems } = params;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    data: paginatedData,
    metadata: {
      currentPage: page,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};


