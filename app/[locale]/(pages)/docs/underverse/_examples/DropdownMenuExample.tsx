"use client";

import React from "react";
import DropdownMenu from "@/components/ui/DropdownMenu";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";

export default function DropdownMenuExample() {
  return (
    <div className="space-y-3">
      <DropdownMenu
        trigger={<Button variant="outline">Open menu</Button>}
        items={[
          { label: "Action 1", onClick: () => console.log("Action 1") },
          { label: "Action 2", onClick: () => console.log("Action 2") },
        ]}
      />
      <CodeBlock
        code={`import { DropdownMenu, Button } from '@underverse-ui/underverse'\n\n<DropdownMenu trigger={<Button variant='outline'>Open menu</Button>} items={[{label:'Action 1', onClick:()=>{}},{label:'Action 2', onClick:()=>{}}]} />`}
      />
    </div>
  );}
