import { Spinner } from "@common/ui";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { type PropsWithChildren, useEffect } from "react";
import { SystemUnavailableError } from "@/components/system-unavailable-error";
import { authAtom } from "../atoms";
import { getSession } from "../lib";
import { authQueryKeys } from "../query-keys";

export function SessionProvider({ children }: PropsWithChildren) {
  const [auth, setAuth] = useAtom(authAtom);
  const query = useQuery({
    queryFn: getSession,
    queryKey: authQueryKeys.getSession,
    refetchInterval: 30000,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });

  useEffect(() => {
    if (query.isLoading) {
      setAuth({ loading: true, user: undefined });
    } else if (query.isError) {
      setAuth({ loading: false, user: undefined });
    } else if (query.data !== null) {
      if (query.data === false) {
        setAuth({ loading: false, user: undefined });
      } else {
        setAuth({ loading: false, user: query.data?.employee });
      }
    }
  }, [query.data, query.isLoading, query.isError, setAuth]);

  if (query.isLoading || auth.loading) {
    return (
      <div className="w-screen h-screen bg-background flex justify-center items-center">
        <Spinner className="size-10" />
      </div>
    );
  }

  if (query.isError) {
    return <SystemUnavailableError tryAgain={() => query.refetch()} />;
  }

  return children;
}
