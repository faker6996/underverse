import { cn } from "../../utils/cn";
import { Tooltip } from "../Tooltip";
import { getVisibleTableBounds, type TableControlLayout } from "./table-layout-model";

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
  const visibleBounds = getVisibleTableBounds(layout);
  const columnRailTop = visibleBounds.top;
  const columnRailLeft = visibleBounds.right + ADD_COLUMN_RAIL_GAP;
  const rowRailTop = layout.wrapperTop + layout.wrapperHeight + ADD_ROW_RAIL_GAP;
  const rowRailLeft = visibleBounds.left;
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
            top: showColumnRail ? columnRailTop : columnRailTop + Math.max(0, visibleBounds.height / 2 - 24),
            left: columnRailLeft,
            width: showColumnRail ? 18 : 12,
            height: showColumnRail ? visibleBounds.height : 48,
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
            left: showRowRail ? rowRailLeft : rowRailLeft + Math.max(0, visibleBounds.width / 2 - 24),
            width: showRowRail ? visibleBounds.width : 48,
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
