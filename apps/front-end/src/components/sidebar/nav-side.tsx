import { Avatar, AvatarFallback, Button, cn, Input } from "@common/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, EllipsisVertical, Send } from "lucide-react";
import { createContext, useCallback, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { ChatItems } from "./side/chat-items";

type NavSideContext = { isExpanded: boolean };

export const NavSideContext = createContext<NavSideContext | null>(null);

const FormSchema = z.object({
  message: z.string().min(1).max(256),
});

export function NavSide() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  // const [isChatExpanded, setIsChatExpanded] = useState<boolean>(false);
  const chatForm = useForm({
    defaultValues: {
      message: "",
    },
    resolver: zodResolver(FormSchema),
  });

  const handleSubmit = useCallback((data: z.infer<typeof FormSchema>) => {
    console.info(data);
  }, []);

  return (
    <NavSideContext.Provider value={{ isExpanded }}>
      <div
        className={cn(
          "flex flex-col h-full bg-sidebar transition-[width] p-2 border-l border-sidebar-border relative gap-2",
          // isExpanded ? "w-64" : "w-14",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronLeft
            className={cn(
              "transition-[rotate]",
              isExpanded ? "rotate-180" : "",
            )}
          />
        </Button>
        <div className="flex flex-col justify-center gap-2">
          <ChatItems />
          <div
            className={cn(
              "right-full flex flex-col top-0 absolute bg-neutral-900 h-full transition-[width] overflow-hidden",
              isExpanded ? "w-150" : "w-0",
            )}
          >
            <div className="p-2 border-b border-b-sidebar-border flex flex-row gap-2 justify-between items-center">
              <div className="flex flex-row gap-2 items-center">
                <Avatar>
                  <AvatarFallback>IC</AvatarFallback>
                </Avatar>
                <span className="font-bold text-nowrap">Ivan Cerovina</span>
              </div>
              <Button type="button" size="icon" variant="ghost">
                <EllipsisVertical />
              </Button>
            </div>
            <div className="flex-1">chat content</div>
            <FormProvider {...chatForm}>
              <form
                onSubmit={chatForm.handleSubmit(handleSubmit)}
                className="p-2 border-t border-t-sidebar-border flex flex-row gap-2"
              >
                <Controller
                  name="message"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="Type a message..."
                    />
                  )}
                />
                <Button
                  type="submit"
                  size="icon-sm"
                  variant="default"
                  className="rounded-full"
                >
                  <Send />
                </Button>
              </form>
            </FormProvider>
          </div>
        </div>
      </div>
    </NavSideContext.Provider>
  );
}
