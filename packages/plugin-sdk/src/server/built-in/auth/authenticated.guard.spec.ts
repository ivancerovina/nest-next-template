import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthenticatedGuard } from "./authenticated.guard";

describe("AuthenticatedGuard", () => {
  let guard: AuthenticatedGuard;

  beforeEach(() => {
    guard = new AuthenticatedGuard();
  });

  const createMockExecutionContext = (session: unknown) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          session,
        }),
      }),
    } as ExecutionContext;
  };

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    it("should return true when session has user", () => {
      const context = createMockExecutionContext({ user: { id: "test-id" } });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("should throw UnauthorizedException when session exists but has no user", () => {
      const context = createMockExecutionContext({});

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException when session user is null", () => {
      const context = createMockExecutionContext({ user: null });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it("should throw with correct message when not authenticated", () => {
      const context = createMockExecutionContext({});

      try {
        guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as UnauthorizedException).message).toBe(
          "User is not authenticated",
        );
      }
    });
  });
});
