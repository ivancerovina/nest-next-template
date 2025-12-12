import { Button, Popover, PopoverContent, PopoverTrigger } from "@common/ui";
import { LogIn, LogOut, Pause, Play } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { match } from "ts-pattern";
import { useAttendanceTimer } from "@/features/attendance";
import { RequirePermission } from "@/features/permissions/components/require-permission";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function DataItem({
  label,
  value,
}: {
  label: string;
  value: string | ReactNode;
}) {
  return (
    <div className="flex flex-row justify-between gap-2">
      <span>{label}</span>
      <span className="font-mono uppercase">{value}</span>
    </div>
  );
}

export function AttendanceMenu(props: ComponentProps<typeof PopoverTrigger>) {
  const {
    state,
    totalWorkTime,
    totalPauseTime,
    clockIn,
    clockOut,
    pause,
    unpause,
  } = useAttendanceTimer();

  return (
    <RequirePermission code="attendance">
      <Popover>
        <PopoverTrigger {...props} />
        <PopoverContent className="space-y-4">
          <h1 className="font-bold">Workday</h1>

          <div className="flex flex-col gap-2">
            <DataItem
              label="Status"
              value={match(state)
                .with("clocked_out", () => (
                  <span className="text-red-500">Clocked out</span>
                ))
                .with("paused", () => (
                  <span className="text-amber-500">On pause</span>
                ))
                .with("clocked_in", () => (
                  <span className="text-green-500">Clocked in</span>
                ))
                .with("loading", () => (
                  <span className="text-muted-foreground">Loading...</span>
                ))
                .with("error", () => (
                  <span className="text-red-500">Error</span>
                ))
                .exhaustive()}
            />
            <DataItem label="Today's time" value={formatTime(totalWorkTime)} />
            {(state === "clocked_in" || state === "paused") && (
              <DataItem label="Pause time" value={formatTime(totalPauseTime)} />
            )}
          </div>

          {match(state)
            .with("loading", () => null)
            .with("error", () => null)
            .with("clocked_out", () => (
              <Button onClick={() => clockIn.mutate()} className="w-full">
                <LogIn /> Clock In
              </Button>
            ))
            .with("paused", () => (
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => unpause.mutate()}>
                  <Play /> Unpause
                </Button>
                <Button onClick={() => clockOut.mutate()} variant="destructive">
                  <LogOut /> Clock out
                </Button>
              </div>
            ))
            .with("clocked_in", () => (
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => pause.mutate()}>
                  <Pause /> Pause
                </Button>
                <Button onClick={() => clockOut.mutate()} variant="destructive">
                  <LogOut /> Clock out
                </Button>
              </div>
            ))
            .exhaustive()}
        </PopoverContent>
      </Popover>
    </RequirePermission>
  );
}
