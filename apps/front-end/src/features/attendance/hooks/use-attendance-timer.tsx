import { useEffect, useState } from "react";
import { useAttendance } from "./use-attendance";

export function useAttendanceTimer() {
  const { query, state, clockIn, clockOut, pause, unpause } = useAttendance();
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [totalPauseTime, setTotalPauseTime] = useState(0);

  useEffect(() => {
    if (!query.data) return;

    const { totalToday, totalPauseToday, activePause, activeLog } = query.data;

    setTotalWorkTime(totalToday);
    setTotalPauseTime(totalPauseToday);

    // Only tick if clocked in
    if (!activeLog) return;

    // Calculate delay to sync with the next second boundary
    const msOffset = totalToday % 1000;
    const delay = msOffset === 0 ? 0 : 1000 - msOffset;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const timeoutId = setTimeout(() => {
      // Tick immediately after delay
      setTotalWorkTime((prev) => prev + delay);
      if (activePause) {
        setTotalPauseTime((prev) => prev + delay);
      }

      // Start the synchronized interval
      intervalId = setInterval(() => {
        setTotalWorkTime((prev) => prev + 1000);
        if (activePause) {
          setTotalPauseTime((prev) => prev + 1000);
        }
      }, 1000);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [query.data]);

  return {
    totalWorkTime,
    totalPauseTime,
    state,
    clockIn,
    clockOut,
    pause,
    unpause,
  };
}
