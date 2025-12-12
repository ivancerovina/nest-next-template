import { builtInRoutes } from "@common/plugin-sdk/shared";
import { httpClient } from "@/lib/http-client";

/**
 * Clocks in the current user.
 * @returns The attendance log on success, or false on failure
 */
export async function clockIn() {
  const response = await httpClient.post(
    builtInRoutes.attendance.clockIn.path(),
    {},
  );

  const json = await response.json(
    builtInRoutes.attendance.clockIn.response.raw,
  );

  return json.success ? json.data : false;
}

/**
 * Clocks out the current user.
 * @returns The attendance log on success, or false on failure
 */
export async function clockOut() {
  const response = await httpClient.post(
    builtInRoutes.attendance.clockOut.path(),
    {},
  );

  const json = await response.json(
    builtInRoutes.attendance.clockOut.response.raw,
  );

  return json.success ? json.data : false;
}

/**
 * Starts a pause for the current user.
 * @returns The pause log on success, or false on failure
 */
export async function startPause() {
  const response = await httpClient.post(
    builtInRoutes.attendance.pause.path(),
    {},
  );

  const json = await response.json(builtInRoutes.attendance.pause.response.raw);

  return json.success ? json.data : false;
}

/**
 * Ends the current pause for the current user.
 * @returns The pause log on success, or false on failure
 */
export async function endPause() {
  const response = await httpClient.post(
    builtInRoutes.attendance.unpause.path(),
    {},
  );

  const json = await response.json(
    builtInRoutes.attendance.unpause.response.raw,
  );

  return json.success ? json.data : false;
}

/**
 * Gets the current attendance status for the current user.
 * @returns The attendance status on success, or false on failure
 */
export async function getStatus() {
  const response = await httpClient.get(builtInRoutes.attendance.status.path());

  const json = await response.json(
    builtInRoutes.attendance.status.response.raw,
  );

  return json.success ? json.data : false;
}
