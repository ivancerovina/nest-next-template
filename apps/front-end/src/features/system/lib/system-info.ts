import { builtInRoutes } from "@common/plugin-sdk/shared";
import { httpClient } from "@/lib/http-client";

export async function fetchSystemInfo() {
  const response = await httpClient.get(
    builtInRoutes.system.systemInfo.path(),
    { throwHttpErrors: false },
  );

  const json = await response.json(
    builtInRoutes.system.systemInfo.response.raw,
  );

  if (!json.success) {
    throw new Error("Failed to fetch system info");
  }

  return json.data;
}
