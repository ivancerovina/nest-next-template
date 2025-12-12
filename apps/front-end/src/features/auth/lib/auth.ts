import { JotaiStore } from "@common/plugin-sdk/client";
import { builtInRoutes } from "@common/plugin-sdk/shared";
import type z from "zod";
import { httpClient } from "@/lib/http-client";
import { authAtom } from "../atoms";

type LoginBody = z.infer<typeof builtInRoutes.auth.login.body>;
type CreateFirstEmployeeBody = z.infer<
  typeof builtInRoutes.employees.createFirstEmployee.body
>;

/**
 * Authenticates a user with email and password.
 * @param credentials - The login credentials (email and password)
 * @returns The authenticated user data on success, or false on failure
 */
export async function login(credentials: LoginBody) {
  const response = await httpClient.post(
    builtInRoutes.auth.login.path(),
    credentials,
    {
      throwHttpErrors: false,
      cache: "no-store",
    },
  );

  const json = await response.json(builtInRoutes.auth.login.response.raw);

  if (json.success) {
    JotaiStore.set(authAtom, { loading: false, user: json.data.employee });
  }

  return json.success ? json.data : false;
}

/**
 * Logs out the current user by destroying the session.
 * @returns true on success, false on failure
 */
export async function logout() {
  const response = await httpClient.post(
    builtInRoutes.auth.logout.path(),
    {},
    {
      throwHttpErrors: false,
    },
  );

  const json = await response.json(builtInRoutes.auth.logout.response.raw);

  if (json.success) {
    JotaiStore.set(authAtom, { loading: false, user: undefined });
  }

  return json.success;
}

/**
 * Fetches the current session data.
 * @returns The session data with user info on success, or false if not authenticated
 */
export async function getSession() {
  try {
    const response = await httpClient.get(builtInRoutes.auth.session.path(), {
      throwHttpErrors: false,
      cache: "no-store",
    });

    const json = await response.json(builtInRoutes.auth.session.response.raw);

    return json.success ? json.data : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Checks if any employee exists in the system.
 * @returns true if at least one employee exists, false otherwise
 */
export async function firstEmployeeExists() {
  const response = await httpClient.post(
    builtInRoutes.employees.firstEmployeeExists.path(),
    {},
    {
      throwHttpErrors: false,
    },
  );

  const json = await response.json(
    builtInRoutes.employees.firstEmployeeExists.response.raw,
  );

  return json.success ? json.data.firstEmployeeExists : false;
}

/**
 * Creates the first employee (admin) account.
 * @param data - The employee data
 * @returns The created employee ID on success, or false on failure
 */
export async function createFirstEmployee(data: CreateFirstEmployeeBody) {
  const response = await httpClient.post(
    builtInRoutes.employees.createFirstEmployee.path(),
    data,
    {
      throwHttpErrors: false,
    },
  );

  const json = await response.json(
    builtInRoutes.employees.createFirstEmployee.response.raw,
  );

  return json.success ? json.data : false;
}
