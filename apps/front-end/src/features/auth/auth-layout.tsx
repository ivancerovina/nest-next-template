import { Link, Navigate, Outlet } from "react-router";
import CompanyLogo from "@/assets/logo.png";
import { RequireUnauth } from "./components/require-unauth";
import { useAuth } from "./hooks";

export function AuthLayout() {
  const auth = useAuth();
  if (auth.user) {
    return <Navigate to="/hub" replace />;
  }

  return (
    <RequireUnauth>
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <img src={CompanyLogo} alt="Company logo" />
            </div>
            {import.meta.env.VITE_COMPANY_NAME}
          </Link>
          <Outlet />
        </div>
      </div>
    </RequireUnauth>
  );
}
