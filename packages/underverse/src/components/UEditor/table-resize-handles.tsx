import type React from "react";
import { MoveDiagonal2 } from "lucide-react";
import { cn } from "../../utils/cn";
import type { TableControlLayout } from "./table-layout-model";

const HANDLE_BASE_CLASS = cn(
  "pointer-events-auto absolute z-10 inline-flex touch-none items-center justify-center rounded-md",
  "bg-background/95 text-primary shadow-sm backdrop-blur-sm",
  "transition-[color,background-color,box-shadow,transform] duration-150",
  "hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-95",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

export function TableResizeHandles({
  active,
  ctrlHint,
  frameRef,
  layout,
  onStartResize,
  resizeBothLabel,
}: {
  active: boolean;
  ctrlHint: string;
  frameRef: React.RefObject<HTMLDivElement | null>;
  layout: TableControlLayout;
  onStartResize: (event: React.PointerEvent<HTMLButtonElement>) => void;
  resizeBothLabel: string;
}) {
  return (
    <div
      ref={frameRef}
      data-table-resize-frame=""
      data-resizing={active ? "true" : "false"}
      className={cn(
        "pointer-events-none absolute z-[38] box-border border border-primary/55",
        active && "border-primary bg-primary/[0.03]",
      )}
      style={{
        left: layout.tableLeft,
        top: layout.tableTop,
        width: layout.tableWidth,
        height: layout.tableHeight,
      }}
    >
      <button
        type="button"
        aria-label={resizeBothLabel}
        title={`${resizeBothLabel}. ${ctrlHint}`}
        data-table-resize-handle="both"
        className={cn(
          HANDLE_BASE_CLASS,
          "bottom-[-28px] right-[-30px] h-6 w-6 cursor-nwse-resize",
          active && "bg-primary text-primary-foreground shadow-md",
        )}
        onPointerDown={onStartResize}
      >
        <MoveDiagonal2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.25} />
      </button>
      {active ? (
        <span
          role="status"
          aria-live="polite"
          data-table-resize-dimensions=""
          className="absolute bottom-2 right-2 rounded bg-foreground/85 px-1.5 py-0.5 text-[10px] font-medium text-background shadow-sm"
        >
          {`${Math.round(layout.tableWidth)} × ${Math.round(layout.tableHeight)}`}
        </span>
      ) : null}
    </div>
  );
}
