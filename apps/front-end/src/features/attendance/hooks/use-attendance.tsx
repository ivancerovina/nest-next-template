import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { match } from "ts-pattern";
import {
  clockIn as clockInApi,
  clockOut as clockOutApi,
  endPause,
  getStatus,
  startPause,
} from "../lib/attendance-api";
import { attendanceQueryKeys } from "../query-keys";

export function useAttendance() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: attendanceQueryKeys.status,
    queryFn: getStatus,
    refetchInterval: 60000,
  });

  const invalidateStatus = () => {
    queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.status });
  };

  const clockIn = useMutation({
    mutationFn: clockInApi,
    onSuccess: invalidateStatus,
  });

  const clockOut = useMutation({
    mutationFn: clockOutApi,
    onSuccess: invalidateStatus,
  });

  const pause = useMutation({
    mutationFn: startPause,
    onSuccess: invalidateStatus,
  });

  const unpause = useMutation({
    mutationFn: endPause,
    onSuccess: invalidateStatus,
  });

  const state = query.data
    ? match({ pause: query.data.paused, clockedIn: query.data.clockedIn })
        .with({ clockedIn: true, pause: false }, () => "clocked_in" as const)
        .with({ clockedIn: true, pause: true }, () => "paused" as const)
        .with({ clockedIn: false, pause: false }, () => "clocked_out" as const)
        .otherwise(() => "error" as const)
    : ("loading" as const);

  return { state, query, clockIn, clockOut, pause, unpause };
}
