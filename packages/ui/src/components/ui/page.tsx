import { ChevronLeft } from "lucide-react";
import { ComponentProps, ReactNode, useCallback } from "react";
import { useNavigate } from "react-router";
import { cn } from "../../lib";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
export function Page({ className, ...rest }: ComponentProps<"div">) {
  return (
    <div
      className={cn("p-2 md:p-4 lg:p-6 space-y-4 lg:space-y-6", className)}
      {...rest}
    />
  );
}

export function PageHeader({
  className,
  withBackButton,
  ...rest
}: ComponentProps<"div"> & { withBackButton?: boolean | ReactNode }) {
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    if (window.history.length > 0) {
      navigate(-1);
      return;
    }

    navigate("/hub");
  }, [navigate]);

  if (withBackButton) {
    return (
      <div className="flex flex-row gap-2">
        {typeof withBackButton === "boolean" ? (
          <Tooltip delayDuration={350}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={goBack}
              >
                <ChevronLeft />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back</TooltipContent>
          </Tooltip>
        ) : (
          withBackButton
        )}
        <div className={cn("space-y-0", className)} {...rest} />
      </div>
    );
  }
  return <div className={cn("space-y-0", className)} {...rest} />;
}

export function PageTitle({ className, ...rest }: ComponentProps<"h1">) {
  return <h1 className={cn("text-2xl font-bold", className)} {...rest} />;
}

export function PageDescription({ className, ...rest }: ComponentProps<"p">) {
  return <p className={cn("text-sm text-gray-500", className)} {...rest} />;
}

export function PageContent({ className, ...rest }: ComponentProps<"div">) {
  return (
    <div
      className={cn("space-y-2 md:space-y-4 lg:space-y-6", className)}
      {...rest}
    />
  );
}
