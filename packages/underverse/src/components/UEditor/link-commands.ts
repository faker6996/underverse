import type { Editor } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";

export function applyEditorLink(editor: Editor, href: string) {
  const isEditingLink = editor.isActive("link");
  const hasSelectedText = !editor.state.selection.empty;
  const chain = editor.chain().focus();

  if (isEditingLink) {
    chain.extendMarkRange("link");
  }

  chain.setLink({ href });

  if (!hasSelectedText && !isEditingLink) {
    chain.insertContent(href);
  }

  return chain
    .command(({ tr }) => {
      tr.setSelection(TextSelection.create(tr.doc, tr.selection.to));
      tr.removeStoredMark(editor.schema.marks.link);
      return true;
    })
    .run();
}
