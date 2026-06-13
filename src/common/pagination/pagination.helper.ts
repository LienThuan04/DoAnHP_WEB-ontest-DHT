export const getPaginationParams = (page: number = 1, limit: number = 10) => {
  const safePage: number = Math.max(1, page);
  const safeLimit: number = Math.max(1, Math.min(limit, 100));

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
};

export const buildPaginationMeta = (
  page: number,
  limit: number,
  totalItems: number,
) => {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};
