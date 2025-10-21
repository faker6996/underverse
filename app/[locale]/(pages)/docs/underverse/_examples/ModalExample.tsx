"use client";

import React from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import CodeBlock from "../_components/CodeBlock";

export default function ModalExample() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="space-y-3">
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
      <CodeBlock
        code={`import { Button, Modal } from '@underverse-ui/underverse'\n\nconst [open, setOpen] = useState(false)\n\n<Button onClick={() => setOpen(true)}>Open</Button>\n<Modal isOpen={open} onClose={() => setOpen(false)} title='Demo'>...content...</Modal>`}
      />
    </div>
  );
}

