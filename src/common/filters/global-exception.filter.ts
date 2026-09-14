import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

type ResolvedError = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
};

const CODE_BY_STATUS: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
};

function codeForStatus(status: number): string {
  return CODE_BY_STATUS[status] ?? 'ERROR';
}

function extractConstraintName(
  meta: Record<string, unknown> | undefined,
): string | undefined {
  if (!meta) {
    return undefined;
  }

  const driverAdapterError = meta.driverAdapterError as
    | { cause?: { constraint?: { index?: string } } }
    | undefined;

  if (driverAdapterError?.cause?.constraint?.index) {
    return driverAdapterError.cause.constraint.index;
  }

  if (Array.isArray(meta.target)) {
    return meta.target.join(', ');
  }

  if (typeof meta.field_name === 'string') {
    return meta.field_name;
  }

  return undefined;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const resolved = this.resolve(exception);

    if (resolved.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
      );
    }

    response.status(resolved.status).json({
      code: resolved.code,
      message: resolved.message,
      ...(resolved.details !== undefined
        ? { details: resolved.details }
        : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolve(exception: unknown): ResolvedError {
    if (exception instanceof HttpException) {
      return this.resolveHttpException(exception);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.resolvePrismaError(exception);
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    };
  }

  private resolveHttpException(exception: HttpException): ResolvedError {
    const status = exception.getStatus();
    const body = exception.getResponse();

    if (typeof body === 'string') {
      return { status, code: codeForStatus(status), message: body };
    }

    const { message } = body as { message?: string | string[] };

    if (Array.isArray(message)) {
      return {
        status,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: message,
      };
    }

    return {
      status,
      code: codeForStatus(status),
      message: message ?? exception.message,
    };
  }

  private resolvePrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): ResolvedError {
    const constraint = extractConstraintName(exception.meta);

    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          code: 'CONFLICT',
          message: 'A record with these values already exists',
          details: constraint,
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          code: 'BAD_REQUEST',
          message: 'Referenced record does not exist',
          details: constraint,
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          code: 'NOT_FOUND',
          message: 'Record not found',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
        };
    }
  }
}
