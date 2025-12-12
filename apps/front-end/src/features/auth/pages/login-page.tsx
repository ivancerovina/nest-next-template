import { cn, Spinner } from "@common/ui";
import { useCallback, useEffect, useState } from "react";
import { CreateFirstUserForm } from "../components/create-first-user-form";
import { LoginForm } from "../components/login-form";
import { firstEmployeeExists } from "../lib";

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasEmployee, setHasEmployee] = useState<boolean | null>(null);

  useEffect(() => {
    firstEmployeeExists()
      .then(setHasEmployee)
      .finally(() => setIsLoading(false));
  }, []);

  const handleFirstUserCreated = useCallback(() => {
    setHasEmployee(true);
  }, []);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center")}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6 items-center")}>
      {hasEmployee ? (
        <LoginForm />
      ) : (
        <CreateFirstUserForm onSuccess={handleFirstUserCreated} />
      )}
    </div>
  );
}
