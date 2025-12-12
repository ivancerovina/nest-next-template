import { Button } from "@common/ui";
import { RefreshCcw } from "lucide-react";

type SystemUnavailableErrorProps = {
  tryAgain: () => void | Promise<void>;
};

export function SystemUnavailableError({
  tryAgain,
}: SystemUnavailableErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">System Unavailable</h1>
      <p className="text-lg">
        We're sorry, but the system is currently unavailable.
      </p>
      {tryAgain && (
        <Button type="button" onClick={tryAgain} className="mt-4">
          <RefreshCcw /> Try again
        </Button>
      )}
    </div>
  );
}
