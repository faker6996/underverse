import { cn } from "../../utils/cn";
import { Tooltip } from "../Tooltip";
import { getVisibleTableBounds, type TableControlLayout } from "./table-layout-model";

const ADD_COLUMN_RAIL_GAP = 4;
const ADD_ROW_RAIL_GAP = 4;
const BUTTON_LONG_SIZE = 36;
const BUTTON_SHORT_SIZE = 14;

export function TableAddRails({
  addColumnVisible,
  addRowVisible,
  canExpandTable,
  controlsVisible,
  layout,
  onStartAddColumn,
  onStartAddRow,
  quickAddColumnLabel,
  quickAddRowLabel,
}: {
  addColumnVisible: boolean;
  addRowVisible: boolean;
  canExpandTable: boolean;
  controlsVisible: boolean;
  layout: TableControlLayout;
  onStartAddColumn: () => void;
  onStartAddRow: () => void;
  quickAddColumnLabel: string;
  quickAddRowLabel: string;
}) {
  const visibleBounds = getVisibleTableBounds(layout);
  const columnRailTop = visibleBounds.top + Math.max(0, (visibleBounds.height - BUTTON_LONG_SIZE) / 2);
  const columnRailLeft = visibleBounds.right + ADD_COLUMN_RAIL_GAP;
  const rowRailTop = layout.wrapperTop + layout.wrapperHeight + ADD_ROW_RAIL_GAP;
  const rowRailLeft = visibleBounds.left + Math.max(0, (visibleBounds.width - BUTTON_LONG_SIZE) / 2);
  const showColumnRail = controlsVisible || addColumnVisible;
  const showRowRail = controlsVisible || addRowVisible;

  return (
    <>
      <Tooltip
        placement="right"
        content={<span className="text-xs font-medium">{quickAddColumnLabel}</span>}
      >
        <button
          type="button"
          data-table-control="add-column"
          aria-label={quickAddColumnLabel}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!canExpandTable) return;
            onStartAddColumn();
          }}
          disabled={!canExpandTable}
          className={cn(
            "absolute z-30 inline-flex items-center justify-center rounded-md",
            "border border-border/70 bg-muted/40 text-muted-foreground shadow-sm backdrop-blur",
            "transition-[opacity,transform,colors] duration-200 delay-100 ease-out cursor-pointer hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed",
          )}
          style={{
            top: columnRailTop,
            left: columnRailLeft,
            width: BUTTON_SHORT_SIZE,
            height: BUTTON_LONG_SIZE,
            opacity: showColumnRail ? 1 : 0,
            transform: showColumnRail ? "scale(1)" : "scale(0.85)",
            pointerEvents: showColumnRail ? "auto" : "none",
          }}
        >
          <span className="text-sm font-medium leading-none">+</span>
        </button>
      </Tooltip>

      <Tooltip
        placement="bottom"
        content={<span className="text-xs font-medium">{quickAddRowLabel}</span>}
      >
        <button
          type="button"
          data-table-control="add-row"
          aria-label={quickAddRowLabel}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!canExpandTable) return;
            onStartAddRow();
          }}
          disabled={!canExpandTable}
          className={cn(
            "absolute z-30 inline-flex items-center justify-center rounded-md",
            "border border-border/70 bg-muted/40 text-muted-foreground shadow-sm backdrop-blur",
            "transition-[opacity,transform,colors] duration-200 delay-100 ease-out cursor-pointer hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed",
          )}
          style={{
            top: rowRailTop,
            left: rowRailLeft,
            width: BUTTON_LONG_SIZE,
            height: BUTTON_SHORT_SIZE,
            opacity: showRowRail ? 1 : 0,
            transform: showRowRail ? "scale(1)" : "scale(0.85)",
            pointerEvents: showRowRail ? "auto" : "none",
          }}
        >
          <span className="text-sm font-medium leading-none">+</span>
        </button>
      </Tooltip>
    </>
  );
}
