import type { PropsWithChildren } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../hooks";

export function RequireUnauth({ children }: PropsWithChildren) {
  const { loading, user } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/hub" replace />;
  }

  return children;
}
