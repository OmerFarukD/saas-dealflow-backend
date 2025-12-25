import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ValidationError {
  field: string;
  message: string;
}

interface ErrorResponseBody {
  success: boolean;
  data: null;
  error: {
    code: string;
    message: string;
    timestamp: string;
    path: string;
    details?: ValidationError[];
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extract error details
    let message = 'Internal server error';
    let details: ValidationError[] | null = null;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        // Simple string message
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, any>;

        // Handle message based on type
        if (typeof responseObj.message === 'string') {
          message = responseObj.message;
        } else if (Array.isArray(responseObj.message)) {
          // Handle array of messages (validation errors)
          const messages = responseObj.message as string[];
          message = messages[0]; // First error as main message
          details = messages.map((msg) => ({
            field: this.extractFieldFromMessage(msg),
            message: msg,
          }));
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
    );

    // Build clean response
    const errorResponse: ErrorResponseBody = {
      success: false,
      data: null,
      error: {
        code: this.getErrorCode(status),
        message: message,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    // Only add details if there are validation errors
    if (details && details.length > 1) {
      errorResponse.error.details = details;
    }

    response.status(status).json(errorResponse);
  }

  /**
   * HTTP status kodundan error code string'i oluşturur
   */
  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return errorCodes[status] || 'UNKNOWN_ERROR';
  }

  /**
   * Validation mesajından field adını çıkarmaya çalışır
   * Örnek: "companyName must be a string" -> "companyName"
   */
  private extractFieldFromMessage(message: string): string {
    const match = message.match(/^(\w+)\s/);
    return match ? match[1] : 'unknown';
  }
}
