import type { TableControlLayout } from "./table-layout-model";

export type TableDragPreviewState =
  | { kind: "row"; originIndex: number; targetIndex: number; targetStart: number; targetSize: number }
  | { kind: "column"; originIndex: number; targetIndex: number; targetStart: number; targetSize: number }
  | { kind: "add-row"; previewRows: number }
  | { kind: "add-column"; previewCols: number };

export function TableDragPreview({
  columnDragLabel,
  dragPreview,
  layout,
  rowDragLabel,
}: {
  columnDragLabel: string;
  dragPreview: TableDragPreviewState | null;
  layout: TableControlLayout;
  rowDragLabel: string;
}) {
  if (!dragPreview) return null;

  const expandPreviewWidth = dragPreview.kind === "add-column"
    ? layout.tableWidth + dragPreview.previewCols * layout.avgColumnWidth
    : layout.tableWidth;
  const expandPreviewHeight = dragPreview.kind === "add-row"
    ? layout.tableHeight + dragPreview.previewRows * layout.avgRowHeight
    : layout.tableHeight;
  const dragStatusText = dragPreview.kind === "row"
    ? `${rowDragLabel} ${dragPreview.originIndex + 1} -> ${dragPreview.targetIndex + 1}`
    : dragPreview.kind === "column"
      ? `${columnDragLabel} ${dragPreview.originIndex + 1} -> ${dragPreview.targetIndex + 1}`
      : dragPreview.kind === "add-row"
        ? `+${dragPreview.previewRows}R`
        : `+${dragPreview.previewCols}C`;

  return (
    <>
      {dragPreview.kind === "row" && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-20 rounded-lg border border-primary/20 bg-primary/10"
            style={{
              top: dragPreview.targetStart,
              left: layout.tableLeft,
              width: layout.tableWidth,
              height: dragPreview.targetSize,
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-20 rounded-full bg-primary/80"
            style={{
              top: dragPreview.targetStart + dragPreview.targetSize / 2 - 1,
              left: layout.tableLeft,
              width: layout.tableWidth,
              height: 2,
            }}
          />
        </>
      )}

      {dragPreview.kind === "column" && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-20 rounded-lg border border-primary/20 bg-primary/10"
            style={{
              top: layout.tableTop,
              left: dragPreview.targetStart,
              width: dragPreview.targetSize,
              height: layout.tableHeight,
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-20 rounded-full bg-primary/80"
            style={{
              top: layout.tableTop,
              left: dragPreview.targetStart + dragPreview.targetSize / 2 - 1,
              width: 2,
              height: layout.tableHeight,
            }}
          />
        </>
      )}

      {(dragPreview.kind === "add-row" || dragPreview.kind === "add-column") && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-20 rounded-xl border border-dashed border-primary/70 bg-primary/5"
          style={{
            top: layout.tableTop,
            left: layout.tableLeft,
            width: expandPreviewWidth,
            height: expandPreviewHeight,
          }}
        />
      )}

      <div
        role="status"
        className="pointer-events-none absolute z-30 rounded-full border border-primary/20 bg-background/95 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur"
        style={{
          top: dragPreview.kind === "add-row" || dragPreview.kind === "add-column" ? layout.tableTop + expandPreviewHeight + 8 : layout.tableTop - 40,
          left: dragPreview.kind === "add-row" || dragPreview.kind === "add-column"
            ? layout.tableLeft + Math.max(0, expandPreviewWidth - 84)
            : layout.tableLeft + Math.max(0, layout.tableWidth - 108),
        }}
      >
        {dragStatusText}
      </div>
    </>
  );
}
