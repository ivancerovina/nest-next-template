import { RESPONSE_SCHEMA_KEY } from "@common/plugin-sdk/server";
import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  InternalServerErrorException,
  Logger,
  type NestInterceptor,
} from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import type { Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import type { z } from "zod";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const schema = this.reflector.get<z.ZodSchema>(
      RESPONSE_SCHEMA_KEY,
      context.getHandler(),
    );

    if (!schema) {
      return next.handle().pipe(map((data) => this.wrapResponse(data)));
    }

    return next.handle().pipe(
      switchMap(async (data) => {
        const resolvedData = await Promise.resolve(data);

        const wrappedData = this.wrapResponse(resolvedData);
        const result = schema.safeParse(wrappedData);

        if (!result.success) {
          this.handleValidationError(context, result.error, resolvedData);
        }

        return result.data;
      }),
    );
  }

  private wrapResponse<D>(data: D): { success: boolean; data: D } {
    if (
      data &&
      typeof data === "object" &&
      "success" in data &&
      "data" in data
    ) {
      return data as { success: boolean; data: D };
    }

    return { success: true, data };
  }

  private handleValidationError(
    context: ExecutionContext,
    error: z.ZodError,
    data: unknown,
  ): never {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    this.logger.fatal(
      "Response validation failed:",
      JSON.stringify(
        {
          method: request.method,
          url: request.url,
          statusCode: response.statusCode,
          errors: error.issues.map(
            ({ path, message }) => `At key '${path.join(".")}': ${message}`,
          ),
          data,
        },
        null,
        2,
      ),
    );

    throw new InternalServerErrorException("Internal server error");
  }
}
