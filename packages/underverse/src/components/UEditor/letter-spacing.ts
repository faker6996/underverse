import { Extension } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    letterSpacing: {
      setLetterSpacing: (letterSpacing: string) => ReturnType;
      unsetLetterSpacing: () => ReturnType;
    };
  }
}

const LetterSpacing = Extension.create({
  name: "letterSpacing",

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
          letterSpacing: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.letterSpacing || null,
            renderHTML: (attributes: Record<string, unknown>) => {
              const letterSpacing = typeof attributes.letterSpacing === "string" ? attributes.letterSpacing.trim() : "";
              if (!letterSpacing) return {};
              return { style: `letter-spacing: ${letterSpacing}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLetterSpacing:
        (letterSpacing: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { letterSpacing }).run(),
      unsetLetterSpacing:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { letterSpacing: null }).removeEmptyTextStyle().run(),
    };
  },
});

export default LetterSpacing;
