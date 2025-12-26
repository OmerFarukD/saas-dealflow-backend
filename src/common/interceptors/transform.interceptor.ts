import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: null;
  meta?: PaginationMeta;
}

interface PaginatedResponse<T> {
  data: T;
  meta: PaginationMeta;
}

/**
 * Response'ları standart formata dönüştürür
 * Pagination response'larını da destekler
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((response: T | PaginatedResponse<T>): ApiResponse<T> => {
        // Check if response is a paginated result
        if (this.isPaginatedResponse<T>(response)) {
          return {
            success: true,
            data: response.data,
            meta: response.meta,
            error: null,
          };
        }

        // Standard response
        return {
          success: true,
          data: response,
          error: null,
        };
      }),
    );
  }

  private isPaginatedResponse<U>(
    response: U | PaginatedResponse<U>,
  ): response is PaginatedResponse<U> {
    return (
      response !== null &&
      typeof response === 'object' &&
      'data' in response &&
      'meta' in response
    );
  }
}
