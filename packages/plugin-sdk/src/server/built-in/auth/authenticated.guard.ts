import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

/**
 * Guard that checks if user is authenticated via session.
 * Use this guard on protected endpoints.
 */
@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.session.user) {
      return true;
    }

    throw new UnauthorizedException("User is not authenticated");
  }
}
