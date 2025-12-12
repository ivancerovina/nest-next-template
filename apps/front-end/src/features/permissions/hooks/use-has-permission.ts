import { builtInRoutes } from "@common/plugin-sdk/shared";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/lib/http-client";
import { permissionsQueryKeys } from "../query-keys";

export function useHasPermission(permissionCode: string) {
  return useQuery({
    queryKey: permissionsQueryKeys.hasPermission(permissionCode),
    queryFn: async () => {
      const response = await httpClient.get(
        builtInRoutes.permissions.hasPermission.path(permissionCode),
      );

      const json = await response.json(
        builtInRoutes.permissions.hasPermission.response.raw,
      );

      return json.success ? json.data : false;
    },
  });
}
