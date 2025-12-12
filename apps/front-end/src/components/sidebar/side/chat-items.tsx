import {
  Avatar,
  AvatarFallback,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@common/ui";

const sampleChatItems = [
  ["John", "Doe"],
  ["Jane", "Doe"],
  ["Alice", "Smith"],
  ["Bob", "Johnson"],
  ["Charlie", "Brown"],
  ["David", "Lee"],
  ["Emily", "Davis"],
];

function ActiveIndicator() {
  return (
    <div className="absolute top-0 right-0 size-2 rounded-full bg-green-500 z-3" />
  );
}

export function ChatItems() {
  return sampleChatItems.map(([first, last]) => (
    <Tooltip key={first + last}>
      <TooltipTrigger className="relative">
        <div>
          <ActiveIndicator />
          <Avatar>
            <AvatarFallback>{first[0] + last[0]}</AvatarFallback>
          </Avatar>
        </div>
      </TooltipTrigger>
      <TooltipContent align="center" side="left">
        <p>
          {first} {last}
        </p>
        <p className="text-green-500">Active</p>
      </TooltipContent>
    </Tooltip>
  ));
}
