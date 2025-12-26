export interface PaginationMeta {
  page: number;

  limit: number;

  total: number;

  totalPages: number;

  hasNext: boolean;

  hasPrevious: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export class PaginationHelper {
  static createMeta(
    page: number,
    limit: number,
    total: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  static getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
