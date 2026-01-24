"use client";

import React from "react";
import { useTranslations } from "next-intl";
import DropdownMenu, { DropdownMenuItem, DropdownMenuSeparator, SelectDropdown } from "@/components/ui/DropdownMenu";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { Edit, Trash2, Settings, User } from "lucide-react";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function DropdownMenuExample() {
  const t = useTranslations("DocsUnderverse");
  const [openControlled, setOpenControlled] = React.useState(false);

  const code =
    `import DropdownMenu, { DropdownMenuItem, DropdownMenuSeparator, SelectDropdown } from '@underverse-ui/underverse'\n` +
    `import Button from '@underverse-ui/underverse'\n` +
    `import { Edit, Trash2, Settings, User } from 'lucide-react'\n\n` +
    `// 1) Items API (with icons, disabled, destructive)\n` +
    `<DropdownMenu\n` +
    `  trigger={<Button variant=\"outline\">Open menu</Button>}\n` +
    `  items={[\n` +
    `    { label: 'Edit', icon: Edit, onClick: () => {} },\n` +
    `    { label: 'Settings', icon: Settings, onClick: () => {} },\n` +
    `    { label: 'Delete', icon: Trash2, destructive: true, onClick: () => {} },\n` +
    `  ]}\n` +
    `/>\n\n` +
    `// 2) Children API (custom layout)\n` +
    `<DropdownMenu trigger={<Button>Custom content</Button>}>\n` +
    `  <DropdownMenuItem onClick={() => {}}><User className='w-4 h-4'/> Profile</DropdownMenuItem>\n` +
    `  <DropdownMenuItem onClick={() => {}}><Settings className='w-4 h-4'/> Settings</DropdownMenuItem>\n` +
    `  <DropdownMenuSeparator />\n` +
    `  <DropdownMenuItem destructive onClick={() => {}}><Trash2 className='w-4 h-4'/> Delete</DropdownMenuItem>\n` +
    `</DropdownMenu>\n\n` +
    `// 3) Placements\n` +
    `<DropdownMenu placement=\"bottom-end\" trigger={<Button variant=\"outline\">Bottom-end</Button>} items={[{label:'Item', onClick:()=>{}}]} />\n` +
    `<DropdownMenu placement=\"top-start\" trigger={<Button variant=\"outline\">Top-start</Button>} items={[{label:'Item', onClick:()=>{}}]} />\n` +
    `<DropdownMenu placement=\"right\" trigger={<Button variant=\"outline\">Right</Button>} items={[{label:'Item', onClick:()=>{}}]} />\n\n` +
    `// 4) Controlled open\n` +
    `<DropdownMenu trigger={<Button>Controlled</Button>} isOpen={open} onOpenChange={setOpen} items={[{label:'Toggle', onClick:()=>{}}]} />\n\n` +
    `// 5) SelectDropdown helper\n` +
    `<SelectDropdown options={["All", "Active", "Archived"]} value={'Active'} onChange={(v)=>{}} />`;

  const demo = (
    <div className="space-y-6">
      {/* 1) Items API */}
      <DropdownMenu
        trigger={<Button variant="outline">Open menu</Button>}
        items={[
          { label: "Edit", icon: Edit, onClick: () => {} },
          { label: "Settings", icon: Settings, onClick: () => {} },
          { label: "Delete", icon: Trash2, destructive: true, onClick: () => {} },
        ]}
      />

      {/* 2) Children API */}
      <DropdownMenu trigger={<Button>Custom content</Button>}>
        <DropdownMenuItem onClick={() => {}}>
          <User className="w-4 h-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}}>
          <Settings className="w-4 h-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onClick={() => {}}>
          <Trash2 className="w-4 h-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenu>

      {/* 3) Placements */}
      <div className="flex flex-wrap gap-3">
        <DropdownMenu placement="bottom-end" trigger={<Button variant="outline">Bottom-end</Button>} items={[{ label: "Item", onClick: () => {} }]} />
        <DropdownMenu placement="top-start" trigger={<Button variant="outline">Top-start</Button>} items={[{ label: "Item", onClick: () => {} }]} />
        <DropdownMenu placement="right" trigger={<Button variant="outline">Right</Button>} items={[{ label: "Item", onClick: () => {} }]} />
      </div>

      {/* 4) Controlled open */}
      <DropdownMenu
        trigger={<Button onClick={() => setOpenControlled((o) => !o)}>Controlled</Button>}
        isOpen={openControlled}
        onOpenChange={setOpenControlled}
        items={[{ label: "Toggle", onClick: () => {} }]}
      />

      {/* 5) SelectDropdown helper */}
      <div className="flex items-center gap-3">
        <SelectDropdown options={["All", "Active", "Archived"]} value={"Active"} onChange={() => {}} />
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "trigger", description: t("props.dropdownMenu.trigger"), type: "React.ReactElement", default: "-" },
    { property: "children", description: t("props.dropdownMenu.children"), type: "React.ReactNode", default: "-" },
    { property: "className", description: t("props.dropdownMenu.className"), type: "string", default: "-" },
    { property: "contentClassName", description: t("props.dropdownMenu.contentClassName"), type: "string", default: "-" },
    { property: "placement", description: t("props.dropdownMenu.placement"), type: '"top" | "bottom" | "left" | "right" | "top-start" | "bottom-start" | "top-end" | "bottom-end"', default: '"bottom-start"' },
    { property: "closeOnSelect", description: t("props.dropdownMenu.closeOnSelect"), type: "boolean", default: "true" },
    { property: "disabled", description: t("props.dropdownMenu.disabled"), type: "boolean", default: "false" },
    { property: "isOpen", description: t("props.dropdownMenu.isOpen"), type: "boolean", default: "-" },
    { property: "onOpenChange", description: t("props.dropdownMenu.onOpenChange"), type: "(open: boolean) => void", default: "-" },
    { property: "items", description: t("props.dropdownMenu.items"), type: "Array<{ label: string; icon?: React.ComponentType; onClick: () => void; disabled?: boolean; destructive?: boolean }>", default: "-" },
  ];
  const order = ["trigger","children","className","contentClassName","placement","closeOnSelect","disabled","isOpen","onOpenChange","items"];
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="DropdownMenu.md" />;

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
