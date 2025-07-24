/**
 * Calculate pagination values
 * @param {number} page - Current page number (1-based)
 * @param {number} limit - Items per page
 * @returns {object} Pagination values
 */
export const getPagination = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

/**
 * Create pagination metadata
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {object} Pagination metadata
 */
export const createPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null,
  };
};

/**
 * Build MongoDB aggregation pipeline for pagination
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {array} Aggregation pipeline stages
 */
export const getPaginationPipeline = (page = 1, limit = 10) => {
  const { skip, limit: pageLimit } = getPagination(page, limit);
  
  return [
    { $skip: skip },
    { $limit: pageLimit },
  ];
};

/**
 * Add pagination to aggregation pipeline
 * @param {array} pipeline - Existing aggregation pipeline
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {array} Pipeline with pagination stages
 */
export const addPaginationToPipeline = (pipeline, page = 1, limit = 10) => {
  const paginationStages = getPaginationPipeline(page, limit);
  return [...pipeline, ...paginationStages];
};

