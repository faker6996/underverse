"use client";

import React from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function ModalExample() {
  const [open, setOpen] = React.useState(false);

  const code =
    `import { Button, Modal } from '@underverse-ui/underverse'\n\n` +
    `const [open, setOpen] = useState(false)\n\n` +
    `<Button variant="primary" onClick={() => setOpen(true)}>\n` +
    `  Mở Modal\n` +
    `</Button>\n` +
    `<Modal isOpen={open} onClose={() => setOpen(false)} title="Ví dụ Modal">\n` +
    `  <div className="space-y-3">\n` +
    `    <p>Đây là nội dung trong modal.</p>\n` +
    `    <div className="flex justify-end gap-2">\n` +
    `      <Button variant="outline" onClick={() => setOpen(false)}>\n` +
    `        Đóng\n` +
    `      </Button>\n` +
    `      <Button variant="primary" onClick={() => setOpen(false)}>\n` +
    `        Xác nhận\n` +
    `      </Button>\n` +
    `    </div>\n` +
    `  </div>\n` +
    `</Modal>`;

  const demo = (
    <div>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Mở Modal
      </Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Ví dụ Modal">
        <div className="space-y-3">
          <p>Đây là nội dung trong modal.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Đóng
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );

  return (
    <Tabs
      tabs={[
        { value: "preview", label: "Preview", content: <div className="p-1">{demo}</div> },
        { value: "code", label: "Code", content: <CodeBlock code={code} /> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}

