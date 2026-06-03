import { GripHorizontal, GripVertical } from "lucide-react";
import type React from "react";
import { cn } from "../../utils/cn";
import { DropdownMenu } from "../DropdownMenu";
import { Tooltip } from "../Tooltip";
import type { TableAxisHandle } from "./table-layout-model";

const IDLE_HANDLE_SCALE = "0.78";

type DropdownItems = React.ComponentProps<typeof DropdownMenu>["items"];

export function TableRowHandles({
  activeRowIndex,
  controlsVisible,
  getMenuItems,
  hoverRowHandleIndex,
  onOpenMenuChange,
  onStartDrag,
  openMenuKey,
  rowDragLabel,
  rowHandleLeft,
  rowHandles,
}: {
  activeRowIndex: number;
  controlsVisible: boolean;
  getMenuItems: (rowHandle: TableAxisHandle) => DropdownItems;
  hoverRowHandleIndex: number | null;
  onOpenMenuChange: (menuKey: string, open: boolean) => void;
  onStartDrag: (rowHandle: TableAxisHandle) => void;
  openMenuKey: string | null;
  rowDragLabel: string;
  rowHandleLeft: number;
  rowHandles: TableAxisHandle[];
}) {
  return (
    <>
      {rowHandles.map((rowHandle) => {
        const menuKey = `row:${rowHandle.index}`;
        const isActive = rowHandle.index === activeRowIndex;
        const visible = controlsVisible || hoverRowHandleIndex === rowHandle.index || openMenuKey === menuKey;
        const isShown = visible || isActive;

        return (
          <div
            key={`row-handle-${rowHandle.index}`}
            className="absolute z-30"
            data-row-handle-index={rowHandle.index}
            style={{
              top: Math.max(8, rowHandle.center - 12),
              left: rowHandleLeft,
            }}
          >
            <Tooltip
              placement="right"
              disabled={openMenuKey === menuKey || (!visible && isActive)}
              content={<span className="text-xs font-medium">{`${rowDragLabel} ${rowHandle.index + 1}`}</span>}
            >
              <span className="inline-flex">
                <DropdownMenu
                  placement="right"
                  isOpen={openMenuKey === menuKey}
                  onOpenChange={(open) => onOpenMenuChange(menuKey, open)}
                  contentClassName="p-2"
                  items={getMenuItems(rowHandle)}
                  trigger={(
                    <button
                      type="button"
                      aria-label={`${rowDragLabel} ${rowHandle.index + 1}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onStartDrag(rowHandle);
                      }}
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full transition-[opacity,transform,colors,border,background-color] duration-150",
                        visible
                          ? "border border-border/70 bg-background/95 text-muted-foreground shadow-sm backdrop-blur hover:bg-accent hover:text-foreground cursor-grab active:cursor-grabbing"
                          : "border-transparent bg-transparent cursor-pointer",
                      )}
                      style={{
                        opacity: isShown ? 1 : 0,
                        transform: isShown ? "scale(1)" : `scale(${IDLE_HANDLE_SCALE})`,
                        pointerEvents: isShown ? "auto" : "none",
                      }}
                    >
                      {visible ? (
                        <GripVertical className="h-3.5 w-3.5" />
                      ) : (
                        <div className="h-3 w-1 rounded-full bg-muted-foreground/50 hover:bg-muted-foreground" />
                      )}
                    </button>
                  )}
                />
              </span>
            </Tooltip>
          </div>
        );
      })}
    </>
  );
}

export function TableColumnHandles({
  activeColumnIndex,
  columnDragLabel,
  columnHandleTop,
  columnHandles,
  controlsVisible,
  getMenuItems,
  hoverColumnHandleIndex,
  onOpenMenuChange,
  onStartDrag,
  openMenuKey,
}: {
  activeColumnIndex: number;
  columnDragLabel: string;
  columnHandleTop: number;
  columnHandles: TableAxisHandle[];
  controlsVisible: boolean;
  getMenuItems: (columnHandle: TableAxisHandle) => DropdownItems;
  hoverColumnHandleIndex: number | null;
  onOpenMenuChange: (menuKey: string, open: boolean) => void;
  onStartDrag: (columnHandle: TableAxisHandle) => void;
  openMenuKey: string | null;
}) {
  return (
    <>
      {columnHandles.map((columnHandle) => {
        const menuKey = `column:${columnHandle.index}`;
        const isActive = columnHandle.index === activeColumnIndex;
        const visible = controlsVisible || hoverColumnHandleIndex === columnHandle.index || openMenuKey === menuKey;
        const isShown = visible || isActive;

        return (
          <div
            key={`column-handle-${columnHandle.index}`}
            className="absolute z-30"
            data-column-handle-index={columnHandle.index}
            style={{
              top: columnHandleTop,
              left: Math.max(8, columnHandle.center - 12),
            }}
          >
            <Tooltip
              placement="top"
              disabled={openMenuKey === menuKey || (!visible && isActive)}
              content={<span className="text-xs font-medium">{`${columnDragLabel} ${columnHandle.index + 1}`}</span>}
            >
              <span className="inline-flex">
                <DropdownMenu
                  placement="bottom-start"
                  isOpen={openMenuKey === menuKey}
                  onOpenChange={(open) => onOpenMenuChange(menuKey, open)}
                  contentClassName="p-2"
                  items={getMenuItems(columnHandle)}
                  trigger={(
                    <button
                      type="button"
                      aria-label={`${columnDragLabel} ${columnHandle.index + 1}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onStartDrag(columnHandle);
                      }}
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full transition-[opacity,transform,colors,border,background-color] duration-150",
                        visible
                          ? "border border-border/70 bg-background/95 text-muted-foreground shadow-sm backdrop-blur hover:bg-accent hover:text-foreground cursor-grab active:cursor-grabbing"
                          : "border-transparent bg-transparent cursor-pointer",
                      )}
                      style={{
                        opacity: isShown ? 1 : 0,
                        transform: isShown ? "scale(1)" : `scale(${IDLE_HANDLE_SCALE})`,
                        pointerEvents: isShown ? "auto" : "none",
                      }}
                    >
                      {visible ? (
                        <GripHorizontal className="h-3.5 w-3.5" />
                      ) : (
                        <div className="h-1 w-3 rounded-full bg-muted-foreground/50 hover:bg-muted-foreground" />
                      )}
                    </button>
                  )}
                />
              </span>
            </Tooltip>
          </div>
        );
      })}
    </>
  );
}
