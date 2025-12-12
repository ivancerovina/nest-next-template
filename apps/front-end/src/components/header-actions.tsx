import { Button } from "@common/ui";
import { Clock4 } from "lucide-react";
import { AttendanceMenu } from "@/features/attendance";

export function HeaderActions() {
  return (
    <div className="flex flex-row gap-2">
      <AttendanceMenu asChild>
        <Button type="button" variant="ghost" size="icon">
          <Clock4 />
        </Button>
      </AttendanceMenu>
    </div>
  );
}
