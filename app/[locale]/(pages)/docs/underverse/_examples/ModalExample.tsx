"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function ModalExample() {
  const t = useTranslations("DocsUnderverse");
  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);
  const [open4, setOpen4] = React.useState(false);
  const [open5, setOpen5] = React.useState(false);
  const [open6, setOpen6] = React.useState(false);
  const [open7, setOpen7] = React.useState(false);
  const [open8, setOpen8] = React.useState(false);
  const [open9, setOpen9] = React.useState(false);
  const [open10, setOpen10] = React.useState(false);

  const code =
    `import { Button, Modal } from '@underverse-ui/underverse'\n\n` +
    `// Basic Modal\n` +
    `const [open, setOpen] = useState(false)\n` +
    `<Button variant="primary" onClick={() => setOpen(true)}>Open Modal</Button>\n` +
    `<Modal isOpen={open} onClose={() => setOpen(false)} title="Modal Title">\n` +
    `  <p>Modal content here</p>\n` +
    `</Modal>\n\n` +
    `// Sizes\n` +
    `<Modal isOpen={open} onClose={() => setOpen(false)} size="sm" title="Small">...</Modal>\n` +
    `<Modal isOpen={open} onClose={() => setOpen(false)} size="md" title="Medium">...</Modal>\n` +
    `<Modal isOpen={open} onClose={() => setOpen(false)} size="lg" title="Large">...</Modal>\n` +
    `<Modal isOpen={open} onClose={() => setOpen(false)} size="xl" title="Extra Large">...</Modal>\n` +
    `<Modal isOpen={open} onClose={() => setOpen(false)} size="full" fullWidth title="Full Width">...</Modal>\n\n` +
    `// With Description\n` +
    `<Modal\n` +
    `  isOpen={open}\n` +
    `  onClose={() => setOpen(false)}\n` +
    `  title="Confirm Action"\n` +
    `  description="This action cannot be undone"\n` +
    `>\n` +
    `  <div className="flex justify-end gap-2">\n` +
    `    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>\n` +
    `    <Button variant="danger">Delete</Button>\n` +
    `  </div>\n` +
    `</Modal>\n\n` +
    `// Without Close Button\n` +
    `<Modal isOpen={open} onClose={() => setOpen(false)} title="No Close Button" showCloseButton={false}>\n` +
    `  <p>User must click a button to close</p>\n` +
    `  <Button onClick={() => setOpen(false)}>OK</Button>\n` +
    `</Modal>\n\n` +
    `// Disable Close on Overlay Click\n` +
    `<Modal\n` +
    `  isOpen={open}\n` +
    `  onClose={() => setOpen(false)}\n` +
    `  closeOnOverlayClick={false}\n` +
    `  closeOnEsc={false}\n` +
    `>\n` +
    `  <p>Cannot close by clicking outside or pressing Esc</p>\n` +
    `</Modal>\n\n` +
    `// Custom content padding\n` +
    `<Modal isOpen={open} onClose={() => setOpen(false)} noPadding contentClassName="p-4">\n` +
    `  <YourMediaComponent />\n` +
    `</Modal>`;

  const demo = (
    <div className="space-y-6">
      {/* Basic Modal */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Basic Modal</p>
        <Button variant="primary" onClick={() => setOpen1(true)}>
          Open Basic Modal
        </Button>
        <Modal isOpen={open1} onClose={() => setOpen1(false)} title="Modal Title">
          <div className="space-y-3">
            <p>This is the modal content. You can put any React component here.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen1(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setOpen1(false)}>
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Sizes</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpen2(true)}>
            Small (sm)
          </Button>
          <Button size="sm" variant="outline" onClick={() => setOpen6(true)}>
            Medium (md)
          </Button>
          <Button size="sm" variant="outline" onClick={() => setOpen3(true)}>
            Large (lg)
          </Button>
          <Button size="sm" variant="outline" onClick={() => setOpen4(true)}>
            Extra Large (xl)
          </Button>
          <Button size="sm" variant="outline" onClick={() => setOpen9(true)}>
            Full width
          </Button>
        </div>
        <Modal isOpen={open2} onClose={() => setOpen2(false)} size="sm" title="Small Modal">
          <p className="text-sm">This is a small modal (sm)</p>
        </Modal>
        <Modal isOpen={open6} onClose={() => setOpen6(false)} size="md" title="Medium Modal">
          <p className="text-sm">This is a medium modal (md)</p>
        </Modal>
        <Modal isOpen={open3} onClose={() => setOpen3(false)} size="lg" title="Large Modal">
          <p className="text-sm">This is a large modal (lg)</p>
        </Modal>
        <Modal isOpen={open4} onClose={() => setOpen4(false)} size="xl" title="Extra Large Modal">
          <p className="text-sm">This is an extra large modal (xl)</p>
        </Modal>
        <Modal isOpen={open9} onClose={() => setOpen9(false)} size="full" fullWidth title="Full Width Modal">
          <div className="space-y-3">
            <p className="text-sm">Full width modal stretches edge to edge for immersive layouts.</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                  Panel {idx + 1}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      </div>

      {/* With Description */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Description</p>
        <Button variant="danger" onClick={() => setOpen5(true)}>
          Delete Item
        </Button>
        <Modal
          isOpen={open5}
          onClose={() => setOpen5(false)}
          title="Confirm Delete"
          description="This action cannot be undone. Are you sure you want to delete this item?"
        >
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen5(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setOpen5(false)}>
              Delete
            </Button>
          </div>
        </Modal>
      </div>

      {/* Without Close Button */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Without Close Button</p>
        <Button variant="outline" onClick={() => setOpen7(true)}>
          Open No-Close-Button Modal
        </Button>
        <Modal
          isOpen={open7}
          onClose={() => setOpen7(false)}
          title="No Close Button"
          showCloseButton={false}
        >
          <div className="space-y-3">
            <p>User must use the action buttons to close this modal.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen7(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setOpen7(false)}>
                OK
              </Button>
            </div>
          </div>
        </Modal>
      </div>

      {/* Disable Close on Overlay Click */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Disable Close on Overlay Click</p>
        <Button variant="outline" onClick={() => setOpen8(true)}>
          Open Protected Modal
        </Button>
        <Modal
          isOpen={open8}
          onClose={() => setOpen8(false)}
          title="Protected Modal"
          closeOnOverlayClick={false}
          closeOnEsc={false}
        >
          <div className="space-y-3">
            <p>Cannot close by clicking outside or pressing Esc.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen8(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>

      {/* Custom content padding */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom content padding</p>
        <Button variant="outline" onClick={() => setOpen10(true)}>
          Open Media Modal
        </Button>
        <Modal isOpen={open10} onClose={() => setOpen10(false)} title="Media Lightbox" noPadding contentClassName="bg-black">
          <div className="relative aspect-video w-full overflow-hidden rounded-b-lg">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
              <span className="text-sm text-white/80">Embed your video or image here</span>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "isOpen", description: t("props.modal.isOpen"), type: "boolean", default: "false" },
    { property: "onClose", description: t("props.modal.onClose"), type: "() => void", default: "—" },
    { property: "title", description: t("props.modal.title"), type: "string | React.ReactNode", default: "—" },
    { property: "description", description: t("props.modal.description"), type: "string | React.ReactNode", default: "—" },
    { property: "size", description: t("props.modal.size"), type: '"sm" | "md" | "lg" | "xl" | "full"', default: '"md"' },
    { property: "width", description: t("props.modal.width"), type: "string | number", default: "—" },
    { property: "height", description: t("props.modal.height"), type: "string | number", default: "—" },
    { property: "showCloseButton", description: t("props.modal.showCloseButton"), type: "boolean", default: "true" },
    { property: "closeOnOverlayClick", description: t("props.modal.closeOnOverlayClick"), type: "boolean", default: "true" },
    { property: "closeOnEsc", description: t("props.modal.closeOnEsc"), type: "boolean", default: "true" },
    { property: "contentClassName", description: t("props.modal.contentClassName"), type: "string", default: "—" },
    { property: "noPadding", description: t("props.modal.noPadding"), type: "boolean", default: "false" },
    { property: "fullWidth", description: t("props.modal.fullWidth"), type: "boolean", default: "false" },
    { property: "children", description: t("props.modal.children"), type: "React.ReactNode", default: "—" },
  ];
  const order = ["isOpen","onClose","title","description","size","width","height","showCloseButton","closeOnOverlayClick","closeOnEsc","contentClassName","noPadding","fullWidth","children"];
  const docs = <PropsDocsTable rows={rows} order={order} />;

  return (
    <Tabs
      tabs={[
        { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{demo}</div> },
        { value: "code", label: t("tabs.code"), content: <CodeBlock code={code} /> },
        { value: "docs", label: t("tabs.document"), content: <div className="p-1">{docs}</div> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
