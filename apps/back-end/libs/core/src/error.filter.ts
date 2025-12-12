import { HttpError } from "@common/plugin-sdk/server";
import {
  type ArgumentsHost,
  BadRequestException,
  Catch,
  type ExceptionFilter,
  ForbiddenException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import type { Response } from "express";
import { ZodError } from "zod";

@Catch()
export class ErrorFilter<T> implements ExceptionFilter {
  private readonly logger = new Logger(ErrorFilter.name);

  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    this.logger.debug(
      exception instanceof Error
        ? `${exception.name} ${exception.message}`
        : exception,
    );

    if (exception instanceof HttpError) {
      return res.status(exception.statusCode).json({
        success: false,
        error: {
          message: exception.message,
          code: exception.errorCode,
        },
      });
    }

    if (exception instanceof ZodError) {
      const { issues } = exception;

      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          message: "Invalid request body",
          code: "BAD_REQUEST",
          issues: Object.fromEntries(
            issues.map(({ path, message }) => [path.join("."), message]),
          ),
        },
      });
    }

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();

      // Handle structured error responses (e.g., validation errors)
      if (typeof response === "object" && response !== null) {
        const errorResponse = response as {
          message: string;
          errors?: string[];
        };

        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: errorResponse.message || exception.message,
            code: "BAD_REQUEST",
            ...(errorResponse.errors && { issues: errorResponse.errors }),
          },
        });
      }

      // Handle simple string message
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          message: exception.message,
          code: "BAD_REQUEST",
        },
      });
    }

    if (exception instanceof ForbiddenException) {
      const { message } = exception;
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({ success: false, error: { message, code: "FORBIDDEN" } });
    }

    if (exception instanceof NotFoundException) {
      const { message } = exception;
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, error: { message, code: "NOT_FOUND" } });
    }

    if (exception instanceof UnauthorizedException) {
      const { message } = exception;
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, error: { message, code: "UNAUTHORIZED" } });
    }

    if (exception instanceof InternalServerErrorException) {
      const { message } = exception;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message, code: "INTERNAL_SERVER_ERROR" },
      });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: "An internal error occurred",
        code: "INTERNAL_SERVER_ERROR",
      },
    });
  }
}
