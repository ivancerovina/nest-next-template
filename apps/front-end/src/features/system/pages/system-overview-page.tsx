import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
  Skeleton,
} from "@common/ui";
import { useQuery } from "@tanstack/react-query";
import { fetchSystemInfo } from "../lib/system-info";

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(" ");
}

function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

function StatCard({
  title,
  description,
  value,
  isLoading,
}: {
  title: string;
  description: string;
  value: string;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function SystemOverviewPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["system", "info"],
    queryFn: fetchSystemInfo,
    refetchInterval: 10000,
  });

  if (error) {
    return (
      <Page>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>Failed to load system information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Unknown error occurred"}
            </p>
          </CardContent>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader withBackButton>
        <PageTitle className="text-2xl font-bold">System Overview</PageTitle>
        <PageDescription>
          Monitor your system's health and resource usage
        </PageDescription>
      </PageHeader>
      <PageContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Uptime"
            description="Server running time"
            value={data ? formatUptime(data.uptime) : ""}
            isLoading={isLoading}
          />
          <StatCard
            title="RSS Memory"
            description="Resident Set Size"
            value={data ? formatBytes(data.memory.rss) : ""}
            isLoading={isLoading}
          />
          <StatCard
            title="Heap Total"
            description="Total heap allocated"
            value={data ? formatBytes(data.memory.heapTotal) : ""}
            isLoading={isLoading}
          />
          <StatCard
            title="Heap Used"
            description="Heap memory in use"
            value={data ? formatBytes(data.memory.heapUsed) : ""}
            isLoading={isLoading}
          />
        </div>
      </PageContent>
    </Page>
  );
}
