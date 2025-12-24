import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: null;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
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
      map((response) => {
        // Check if response is a paginated result
        if (
          response &&
          typeof response === 'object' &&
          'data' in response &&
          'meta' in response
        ) {
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
}
