import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import type z from "zod";
import { builtInRoutes } from "../../../shared";
import { HttpError, ValidateResponse, ZodValidationPipe } from "../../utils";
import { EmployeeService } from "../employee";
import { AuthService } from "./auth.service";

const authSchemas = builtInRoutes.auth;

type TLoginBody = z.infer<typeof authSchemas.login.body>;
type TLoginResponse = z.infer<typeof authSchemas.login.response.data>;
type TSessionResponse = z.infer<typeof authSchemas.session.response.data>;
type TLogoutResponse = z.infer<typeof authSchemas.logout.response.data>;

/**
 * Controller handling authentication endpoints.
 */
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly employeeService: EmployeeService,
  ) {}

  /**
   * Authenticates an employee and creates a session.
   */
  @Post("login")
  @ValidateResponse(authSchemas.login.response.raw)
  async login(
    @Body(new ZodValidationPipe(authSchemas.login.body)) body: TLoginBody,
    @Req() req: Request,
  ): Promise<TLoginResponse> {
    const employee = await this.authService.validateCredentials(
      body.identifier,
      body.password,
    );

    if (!employee) {
      throw new HttpError({
        statusCode: 401,
        message: "Invalid credentials",
        errorCode: "INVALID_CREDENTIALS",
      });
    }

    req.session.user = {
      id: employee.id,
    };

    return { employee };
  }

  /**
   * Destroys the current session and logs out the user.
   */
  @Post("logout")
  async logout(@Req() req: Request): Promise<TLogoutResponse> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Returns the current session data if authenticated.
   */
  @Get("session")
  @ValidateResponse(authSchemas.session.response.raw)
  async session(@Req() req: Request): Promise<TSessionResponse> {
    if (!req.session.user) {
      throw new HttpError({
        statusCode: 401,
        message: "Not authenticated",
        errorCode: "UNAUTHORIZED",
      });
    }

    const employee = await this.employeeService.getById(req.session.user.id, [
      "id",
      "username",
      "email",
      "first_name",
      "last_name",
      "is_admin",
      "disabled_at",
    ]);

    if (!employee || employee.disabled_at) {
      req.session.destroy(() => {});
      throw new HttpError({
        statusCode: 404,
        message: "User not found",
        errorCode: "USER_NOT_FOUND",
      });
    }

    return { employee };
  }
}
