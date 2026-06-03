import { cn } from "../../utils/cn";
import { Tooltip } from "../Tooltip";
import type { TableControlLayout } from "./table-layout-model";

const ADD_COLUMN_RAIL_GAP = 4;
const ADD_ROW_RAIL_GAP = 4;

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
  const visibleTableWidth = Math.min(layout.tableWidth, layout.viewportWidth);
  const visibleTableHeight = Math.min(layout.tableHeight, layout.viewportHeight);
  const columnRailTop = layout.tableTop;
  const columnRailLeft = layout.tableLeft + visibleTableWidth + ADD_COLUMN_RAIL_GAP;
  const rowRailTop = layout.tableTop + visibleTableHeight + ADD_ROW_RAIL_GAP;
  const rowRailLeft = layout.tableLeft;
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
            "transition-[opacity,transform,colors] duration-150 hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed",
          )}
          style={{
            top: showColumnRail ? columnRailTop : columnRailTop + Math.max(0, visibleTableHeight / 2 - 24),
            left: columnRailLeft,
            width: showColumnRail ? 18 : 12,
            height: showColumnRail ? visibleTableHeight : 48,
            opacity: showColumnRail ? 1 : 0,
            transform: showColumnRail ? "scale(1)" : "scale(0.92)",
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
            "transition-[opacity,transform,colors] duration-150 hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed",
          )}
          style={{
            top: rowRailTop,
            left: showRowRail ? rowRailLeft : rowRailLeft + Math.max(0, visibleTableWidth / 2 - 24),
            width: showRowRail ? visibleTableWidth : 48,
            height: showRowRail ? 16 : 12,
            opacity: showRowRail ? 1 : 0,
            transform: showRowRail ? "scale(1)" : "scale(0.92)",
            pointerEvents: showRowRail ? "auto" : "none",
          }}
        >
          <span className="text-sm font-medium leading-none">+</span>
        </button>
      </Tooltip>
    </>
  );
}

