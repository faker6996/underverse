import React, { useEffect, useRef, useState } from "react";
import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { UEDITOR_TABLE_LAYOUT_CHANGE_EVENT } from "./table-dom-utils";

const MIN_IMAGE_SIZE_PX = 40;
const IMAGE_LAYOUTS = new Set(["block", "left", "right"] as const);
const IMAGE_WIDTH_PRESETS = new Set(["sm", "md", "lg"] as const);
type ImageLayout = "block" | "left" | "right";
type ImageWidthPreset = "sm" | "md" | "lg";

function toNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseImageLayout(value: unknown): ImageLayout {
  if (typeof value === "string" && IMAGE_LAYOUTS.has(value as ImageLayout)) {
    return value as ImageLayout;
  }
  return "block";
}

function parseImageWidthPreset(value: unknown): ImageWidthPreset | null {
  if (typeof value === "string" && IMAGE_WIDTH_PRESETS.has(value as ImageWidthPreset)) {
    return value as ImageWidthPreset;
  }
  return null;
}

function getImageLayoutStyles(layout: ImageLayout) {
  if (layout === "left") {
    return {
      "data-image-layout": "left",
      style: "float:left;display:block;margin:0.25rem 1rem 0.75rem 0;",
    };
  }

  if (layout === "right") {
    return {
      "data-image-layout": "right",
      style: "float:right;display:block;margin:0.25rem 0 0.75rem 1rem;",
    };
  }

  return {};
}

function getAspectRatio({
  img,
  widthAttr,
  heightAttr,
  fallbackWidth,
  fallbackHeight,
}: {
  img: HTMLImageElement;
  widthAttr: number | null;
  heightAttr: number | null;
  fallbackWidth: number;
  fallbackHeight: number;
}) {
  if (widthAttr && heightAttr) return widthAttr / heightAttr;
  if (img.naturalWidth > 0 && img.naturalHeight > 0) return img.naturalWidth / img.naturalHeight;
  if (fallbackWidth > 0 && fallbackHeight > 0) return fallbackWidth / fallbackHeight;
  return 1;
}

function sizeFromWidth(width: number, aspect: number, maxWidth: number) {
  let nextW = clamp(width, MIN_IMAGE_SIZE_PX, maxWidth);
  let nextH = nextW / aspect;

  if (nextH < MIN_IMAGE_SIZE_PX) {
    nextH = MIN_IMAGE_SIZE_PX;
    nextW = clamp(nextH * aspect, MIN_IMAGE_SIZE_PX, maxWidth);
    nextH = nextW / aspect;
  }

  return { width: nextW, height: nextH };
}

function sizeFromHeight(height: number, aspect: number, maxWidth: number) {
  let nextH = Math.max(MIN_IMAGE_SIZE_PX, height);
  let nextW = nextH * aspect;

  if (nextW > maxWidth) {
    nextW = maxWidth;
    nextH = nextW / aspect;
  }

  if (nextW < MIN_IMAGE_SIZE_PX) {
    nextW = MIN_IMAGE_SIZE_PX;
    nextH = nextW / aspect;
  }

  return { width: nextW, height: nextH };
}

function ResizableImageNodeView(props: NodeViewProps) {
  const { node, selected, updateAttributes, editor, getPos } = props;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const resizePreviewRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const widthAttr = toNullableNumber((node.attrs as Record<string, unknown>)["width"]);
  const heightAttr = toNullableNumber((node.attrs as Record<string, unknown>)["height"]);
  const textAlign = String((node.attrs as Record<string, unknown>)["textAlign"] ?? "");
  const imageLayout = parseImageLayout((node.attrs as Record<string, unknown>)["imageLayout"]);

  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    aspect: number;
    maxW: number;
    previewBaseW: number;
    previewBaseH: number;
    pendingW: number;
    pendingH: number;
    frameId: number | null;
  } | null>(null);

  const dispatchTableLayoutChange = () => {
    editor.view.dom.dispatchEvent(new CustomEvent(UEDITOR_TABLE_LAYOUT_CHANGE_EVENT, { bubbles: true }));
  };

  const getImageDisplayStyle = (width: number | null, height: number | null): React.CSSProperties => ({
    width: width ? `${width}px` : undefined,
    height: width && height ? "auto" : height ? `${height}px` : undefined,
    aspectRatio: width && height ? `${width} / ${height}` : undefined,
  });

  const setResizePreviewStyle = (width: number, height: number, visible: boolean, resetBase = false) => {
    const preview = resizePreviewRef.current;
    if (!preview) return;

    const drag = dragStateRef.current;
    const baseW = resetBase || !drag ? Math.max(MIN_IMAGE_SIZE_PX, Math.round(width)) : drag.previewBaseW;
    const baseH = resetBase || !drag ? Math.max(MIN_IMAGE_SIZE_PX, Math.round(height)) : drag.previewBaseH;
    const scaleX = width / baseW;
    const scaleY = height / baseH;

    if (resetBase) {
      preview.style.width = `${baseW}px`;
      preview.style.height = `${baseH}px`;
    }

    preview.style.maxWidth = "none";
    preview.style.maxHeight = "none";
    preview.style.transform = visible ? `translateZ(0) scale(${scaleX}, ${scaleY})` : "translateZ(0) scale(1)";
    preview.style.display = visible ? "block" : "none";
  };

  const applyPendingResizeFrame = () => {
    const drag = dragStateRef.current;
    if (!drag) return;

    drag.frameId = null;
    setResizePreviewStyle(drag.pendingW, drag.pendingH, true);
  };

  const scheduleResizeFrame = () => {
    const drag = dragStateRef.current;
    if (!drag || drag.frameId !== null) return;

    drag.frameId = window.requestAnimationFrame(applyPendingResizeFrame);
  };

  useEffect(() => {
    return () => {
      const drag = dragStateRef.current;
      if (drag && drag.frameId !== null) {
        window.cancelAnimationFrame(drag.frameId);
      }
      dragStateRef.current = null;
      document.body.style.cursor = "";
    };
  }, []);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const displayStyle = getImageDisplayStyle(widthAttr, heightAttr);
    img.style.width = typeof displayStyle.width === "string" ? displayStyle.width : "";
    img.style.height = typeof displayStyle.height === "string" ? displayStyle.height : "";
    img.style.aspectRatio = typeof displayStyle.aspectRatio === "string" ? displayStyle.aspectRatio : "";
  }, [widthAttr, heightAttr]);

  const selectNode = () => {
    const pos = typeof getPos === "function" ? getPos() : null;
    if (typeof pos === "number") editor.commands.setNodeSelection(pos);
  };

  const onResizePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const img = imgRef.current;
    const wrapper = wrapperRef.current;
    if (!img || !wrapper) return;

    selectNode();

    const rect = img.getBoundingClientRect();
    const editorEl = wrapper.closest(".ProseMirror") as HTMLElement | null;
    const maxW = editorEl ? editorEl.getBoundingClientRect().width : Number.POSITIVE_INFINITY;

    const startW = Math.max(MIN_IMAGE_SIZE_PX, rect.width);
    const startH = Math.max(MIN_IMAGE_SIZE_PX, rect.height);
    const aspect = getAspectRatio({
      img,
      widthAttr,
      heightAttr,
      fallbackWidth: startW,
      fallbackHeight: startH,
    });

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startW,
      startH,
      aspect,
      maxW: Math.max(MIN_IMAGE_SIZE_PX, maxW),
      previewBaseW: Math.max(MIN_IMAGE_SIZE_PX, Math.round(startW)),
      previewBaseH: Math.max(MIN_IMAGE_SIZE_PX, Math.round(startH)),
      pendingW: startW,
      pendingH: startH,
      frameId: null,
    };

    setIsResizing(true);
    setResizePreviewStyle(startW, startH, true, true);
    document.body.style.cursor = "nwse-resize";
    (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
  };

  const onResizePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    const img = imgRef.current;
    if (!drag || !img) return;
    if (event.pointerId !== drag.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    const nextSize = Math.abs(dx) >= Math.abs(dy)
      ? sizeFromWidth(drag.startW + dx, drag.aspect, drag.maxW)
      : sizeFromHeight(drag.startH + dy, drag.aspect, drag.maxW);
    const nextW = nextSize.width;
    const nextH = nextSize.height;

    drag.pendingW = nextW;
    drag.pendingH = nextH;
    scheduleResizeFrame();
  };

  const finishResize = () => {
    const drag = dragStateRef.current;
    dragStateRef.current = null;
    setIsResizing(false);
    document.body.style.cursor = "";
    if (!drag) return;

    if (drag.frameId !== null) {
      window.cancelAnimationFrame(drag.frameId);
      drag.frameId = null;
    }

    const img = imgRef.current;
    const nextW = Math.round(drag.pendingW);
    const nextH = Math.round(drag.pendingH);
    setResizePreviewStyle(nextW, nextH, false);
    if (img) {
      img.style.width = `${nextW}px`;
      img.style.height = "auto";
      img.style.aspectRatio = `${nextW} / ${nextH}`;
    }
    dispatchTableLayoutChange();

    updateAttributes({
      width: nextW,
      height: nextH,
      imageWidthPreset: null,
    });
  };

  const onResizePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    finishResize();
  };

  const onResizePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    finishResize();
  };

  const showHandle = selected || isHovered || isResizing;
  const wrapperAlignClass =
    imageLayout === "block"
      ? textAlign === "center"
        ? "mx-auto"
        : textAlign === "right"
          ? "ml-auto"
          : textAlign === "justify"
            ? "mx-auto"
            : ""
      : "";
  const wrapperLayoutClass =
    imageLayout === "left"
      ? "float-left mr-4 mb-3 mt-1 clear-none max-w-[min(45%,20rem)]"
      : imageLayout === "right"
        ? "float-right ml-4 mb-3 mt-1 clear-none max-w-[min(45%,20rem)]"
        : "w-fit";

  return (
    <NodeViewWrapper
      as="div"
      ref={wrapperRef}
      data-image-layout={imageLayout}
      className={["relative block align-middle max-w-full my-4", wrapperLayoutClass, wrapperAlignClass].filter(Boolean).join(" ")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        selectNode();
      }}
      contentEditable={false}
    >
      <img
        ref={imgRef}
        src={String((node.attrs as Record<string, unknown>)["src"] ?? "")}
        alt={String((node.attrs as Record<string, unknown>)["alt"] ?? "")}
        title={String((node.attrs as Record<string, unknown>)["title"] ?? "")}
        draggable="true"
        className={[
          "block rounded-lg max-w-full",
          selected ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-background" : "",
          isResizing ? "select-none" : "",
        ].join(" ")}
        style={getImageDisplayStyle(widthAttr, heightAttr)}
      />

      <div
        ref={resizePreviewRef}
        aria-hidden="true"
        data-ueditor-image-resize-preview=""
        className={[
          "pointer-events-none absolute left-0 top-0 z-20 hidden rounded-lg",
          "border border-primary/70 bg-background/30 bg-center bg-no-repeat bg-[length:100%_100%]",
          "opacity-45 shadow-md ring-2 ring-primary/25 will-change-transform",
          "select-none",
        ].join(" ")}
        style={{
          width: widthAttr ? `${widthAttr}px` : undefined,
          height: heightAttr ? `${heightAttr}px` : undefined,
          maxWidth: "none",
          maxHeight: "none",
          backgroundImage: `url("${String((node.attrs as Record<string, unknown>)["src"] ?? "").replace(/"/g, "%22")}")`,
          transform: "translateZ(0) scale(1)",
          transformOrigin: "top left",
          display: isResizing ? "block" : "none",
        }}
      />

      {showHandle && (
        <div
          aria-hidden="true"
          data-ueditor-image-resize-handle=""
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={onResizePointerUp}
          onPointerCancel={onResizePointerCancel}
          className={[
            "absolute -right-1 -bottom-1 h-3 w-3 rounded-sm",
            "bg-primary border border-background shadow-sm",
            "cursor-nwse-resize",
            "opacity-90 hover:opacity-100",
          ].join(" ")}
        />
      )}
    </NodeViewWrapper>
  );
}

const ResizableImage = Image.extend({
  addAttributes() {
    const parentAttrs = this.parent?.() ?? {};
    return {
      ...parentAttrs,
      width: {
        default: null,
        parseHTML: (element) => {
          const raw = element.getAttribute("width") || (element as HTMLElement).style.width || "";
          const parsed = Number.parseInt(raw, 10);
          return Number.isFinite(parsed) ? parsed : null;
        },
        renderHTML: (attrs) => (typeof attrs.width === "number" ? { width: attrs.width } : {}),
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const raw = element.getAttribute("height") || (element as HTMLElement).style.height || "";
          const parsed = Number.parseInt(raw, 10);
          return Number.isFinite(parsed) ? parsed : null;
        },
        renderHTML: (attrs) => (typeof attrs.height === "number" ? { height: attrs.height } : {}),
      },
      imageLayout: {
        default: "block",
        parseHTML: (element) => {
          const explicit = element.getAttribute("data-image-layout");
          if (explicit) return parseImageLayout(explicit);

          const floatValue = (element as HTMLElement).style.float;
          if (floatValue === "left" || floatValue === "right") return floatValue;

          return "block";
        },
        renderHTML: (attrs) => getImageLayoutStyles(parseImageLayout(attrs.imageLayout)),
      },
      imageWidthPreset: {
        default: null,
        parseHTML: (element) => parseImageWidthPreset(element.getAttribute("data-image-size")),
        renderHTML: (attrs) => {
          const preset = parseImageWidthPreset(attrs.imageWidthPreset);
          return preset ? { "data-image-size": preset } : {};
        },
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    // Keep compatibility: if width/height come from style, allow them to be parsed back.
    return ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView);
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: {
    class: "rounded-lg max-w-full my-4",
  },
});

export default ResizableImage;
