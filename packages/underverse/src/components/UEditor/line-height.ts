import { Extension } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

const LineHeight = Extension.create({
  name: "lineHeight",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.lineHeight || null,
            renderHTML: (attributes: Record<string, unknown>) => {
              const lineHeight = typeof attributes.lineHeight === "string" ? attributes.lineHeight.trim() : "";
              if (!lineHeight) return {};
              return { style: `line-height: ${lineHeight}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { lineHeight }).run(),
      unsetLineHeight:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { lineHeight: null }).removeEmptyTextStyle().run(),
    };
  },
});

export default LineHeight;
