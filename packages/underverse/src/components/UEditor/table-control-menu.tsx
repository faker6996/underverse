import { MoreHorizontal } from "lucide-react";
import type React from "react";
import { cn } from "../../utils/cn";
import { DropdownMenu } from "../DropdownMenu";
import { Tooltip } from "../Tooltip";

export function TableControlMenu({
  controlsVisible,
  isOpen,
  items,
  label,
  left,
  menuVisible,
  onOpenChange,
  top,
}: {
  controlsVisible: boolean;
  isOpen: boolean;
  items: React.ComponentProps<typeof DropdownMenu>["items"];
  label: string;
  left: number;
  menuVisible: boolean;
  onOpenChange: (open: boolean) => void;
  top: number;
}) {
  const shown = controlsVisible || menuVisible || isOpen;

  return (
    <div
      className="absolute z-30"
      data-table-control="table-menu"
      style={{
        top,
        left,
      }}
    >
      <Tooltip
        placement="top"
        disabled={isOpen}
        content={<span className="text-xs font-medium">{label}</span>}
      >
        <span className="inline-flex">
          <DropdownMenu
            placement="bottom-start"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            contentClassName="p-2"
            items={items}
            trigger={(
              <button
                type="button"
                aria-label={label}
                onMouseDown={(event) => event.preventDefault()}
                className={cn(
                  "pointer-events-auto inline-flex h-7 w-7 items-center justify-center rounded-full",
                  "border border-border/70 bg-background/95 text-muted-foreground shadow-sm backdrop-blur",
                  "transition-[opacity,transform,colors] duration-150 hover:bg-accent hover:text-foreground",
                )}
                style={{
                  opacity: shown ? 1 : 0,
                  transform: shown ? "scale(1)" : "scale(0.82)",
                  pointerEvents: shown ? "auto" : "none",
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            )}
          />
        </span>
      </Tooltip>
    </div>
  );
}
