import type { PropsWithChildren, ReactNode } from "react";
import { useHasPermission } from "../hooks/use-has-permission";

export function RequirePermission({
  code,
  fallback = null,
  children,
}: PropsWithChildren<{
  code: string;
  fallback?: ReactNode;
}>) {
  const query = useHasPermission(code);

  if (query.isLoading) {
    return fallback;
  }

  return children;
}
