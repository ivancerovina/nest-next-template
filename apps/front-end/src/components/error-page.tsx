import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@common/ui";
import { AlertCircle, ChevronDown, Home, RefreshCw } from "lucide-react";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = "Something went wrong";
  let description = "An unexpected error occurred. Please try again.";
  let statusCode: number | null = null;
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    switch (error.status) {
      case 404:
        title = "Page not found";
        description =
          "The page you're looking for doesn't exist or has been moved.";
        break;
      case 401:
        title = "Unauthorized";
        description = "You need to be logged in to access this page.";
        break;
      case 403:
        title = "Access denied";
        description = "You don't have permission to access this page.";
        break;
      case 500:
        title = "Server error";
        description =
          "Something went wrong on our end. Please try again later.";
        break;
      default:
        title = `Error ${error.status}`;
        description = error.statusText || "An error occurred.";
    }
  } else if (error instanceof Error) {
    description = error.message;
    stack = error.stack;
  }

  return (
    <div className="flex min-h-screen w-screen items-center justify-center overflow-y-auto p-4">
      <div className="my-auto flex w-full flex-col items-center text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-8 text-destructive" />
        </div>

        {statusCode && (
          <span className="mb-2 text-sm font-medium text-muted-foreground">
            Error {statusCode}
          </span>
        )}

        <h1 className="mb-2 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mb-8 text-muted-foreground">{description}</p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <RefreshCw className="size-4" />
            Go back
          </Button>
          <Button onClick={() => navigate("/")}>
            <Home className="size-4" />
            Home
          </Button>
        </div>

        {stack && (
          <Collapsible className="mt-8 w-full transition-all">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="gap-2 text-muted-foreground">
                <ChevronDown className="size-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                Show error details
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="mt-4 whitespace-pre-wrap break-words rounded-lg border bg-muted/50 p-4 text-left font-mono">
                <code className="text-xs text-muted-foreground">{stack}</code>
              </pre>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
