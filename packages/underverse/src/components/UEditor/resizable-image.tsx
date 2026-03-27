import React, { useEffect, useRef, useState } from "react";
import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";

const MIN_IMAGE_SIZE_PX = 40;
const AXIS_LOCK_THRESHOLD_PX = 4;
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

function ResizableImageNodeView(props: NodeViewProps) {
  const { node, selected, updateAttributes, editor, getPos } = props;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const widthAttr = toNullableNumber((node.attrs as Record<string, unknown>)["width"]);
  const heightAttr = toNullableNumber((node.attrs as Record<string, unknown>)["height"]);
  const textAlign = String((node.attrs as Record<string, unknown>)["textAlign"] ?? "");
  const imageLayout = parseImageLayout((node.attrs as Record<string, unknown>)["imageLayout"]);
  const preserveAspectByDefault = imageLayout === "left" || imageLayout === "right";

  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    lastW: number;
    lastH: number;
    axis: "x" | "y" | null;
    aspect: number;
    maxW: number;
  } | null>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    img.style.width = widthAttr ? `${widthAttr}px` : "";
    img.style.height = heightAttr ? `${heightAttr}px` : "";
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
    const aspect = startH > 0 ? startW / startH : 1;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startW,
      startH,
      lastW: startW,
      lastH: startH,
      axis: null,
      aspect,
      maxW: Math.max(MIN_IMAGE_SIZE_PX, maxW),
    };

    setIsResizing(true);
    (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
  };

  const onResizePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    const img = imgRef.current;
    if (!drag || !img) return;
    if (event.pointerId !== drag.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    let nextW = drag.startW;
    let nextH = drag.startH;

    const shouldPreserveAspect = preserveAspectByDefault ? !event.ctrlKey : event.ctrlKey;

    if (shouldPreserveAspect) {
      if (Math.abs(dx) >= Math.abs(dy)) {
        nextW = clamp(drag.startW + dx, MIN_IMAGE_SIZE_PX, drag.maxW);
        nextH = clamp(nextW / drag.aspect, MIN_IMAGE_SIZE_PX, Number.POSITIVE_INFINITY);
      } else {
        nextH = clamp(drag.startH + dy, MIN_IMAGE_SIZE_PX, Number.POSITIVE_INFINITY);
        nextW = clamp(nextH * drag.aspect, MIN_IMAGE_SIZE_PX, drag.maxW);
      }
    } else {
      if (!drag.axis && (Math.abs(dx) > AXIS_LOCK_THRESHOLD_PX || Math.abs(dy) > AXIS_LOCK_THRESHOLD_PX)) {
        drag.axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
      }
      if (drag.axis === "x") nextW = clamp(drag.startW + dx, MIN_IMAGE_SIZE_PX, drag.maxW);
      if (drag.axis === "y") nextH = clamp(drag.startH + dy, MIN_IMAGE_SIZE_PX, Number.POSITIVE_INFINITY);
    }

    drag.lastW = nextW;
    drag.lastH = nextH;
    img.style.width = `${Math.round(nextW)}px`;
    img.style.height = `${Math.round(nextH)}px`;
  };

  const finishResize = () => {
    const drag = dragStateRef.current;
    dragStateRef.current = null;
    setIsResizing(false);
    if (!drag) return;

    updateAttributes({
      width: Math.round(drag.lastW),
      height: Math.round(drag.lastH),
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
        style={{
          width: widthAttr ? `${widthAttr}px` : undefined,
          height: heightAttr ? `${heightAttr}px` : undefined,
        }}
      />

      {showHandle && (
        <div
          aria-hidden="true"
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
