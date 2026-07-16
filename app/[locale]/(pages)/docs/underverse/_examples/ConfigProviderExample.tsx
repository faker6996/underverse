import React, { useState } from "react";
import { UnderverseConfigProvider, Button, Input, Combobox, Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, DropdownMenu, DropdownMenuItem, ColorPicker, Modal, DateTimePicker, CategoryTreeSelect, RadioGroup, RadioGroupItem } from "@underverse-ui/underverse";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";

export default function ConfigProviderExample() {
  const t = useTranslations("DocsUnderverse");
  const code = `import { UnderverseConfigProvider, Button, Input, ColorPicker, DateTimePicker, CategoryTreeSelect, RadioGroup, RadioGroupItem, Modal } from "@underverse-ui/underverse";

function App() {
  const [open, setOpen] = useState(false);

  return (
    <UnderverseConfigProvider
      config={{
        // Global default border mode for all components
        borderMode: "xl",
        // Override specifically for inputs
        input: {
          borderMode: "md",
        },
        button: {
          borderMode: "2xl",
        },
        card: {
          borderMode: "md",
        },
        table: {
          borderMode: "md",
        },
        dropdownMenu: {
          borderMode: "md",
        },
        modal: {
          borderMode: "xl",
        }
      }}
    >
      <div className="space-y-4 p-4 border rounded-xl bg-muted/20">
        <Input placeholder="Inherits 'md' from input config" />
        <ColorPicker placeholder="Inherits 'md' from input config" />
        <DateTimePicker onChange={() => {}} placeholder="Inherits 'md' from input config" />
        
        <CategoryTreeSelect 
          categories={[{ id: 1, name: "Option 1" }]} 
          placeholder="Inherits 'xl' from global config" 
        />

        <RadioGroup value="1" onValueChange={() => {}} variant="card">
          <RadioGroupItem value="1" label="Inherits 'xl' from global config" />
        </RadioGroup>

        <Button className="w-full" onClick={() => setOpen(true)}>Inherits '2xl' from button config</Button>

        <Modal isOpen={open} onClose={() => setOpen(false)} title="Example Modal">
          <p>Inherits 'xl' from modal config</p>
        </Modal>
      </div>
    </UnderverseConfigProvider>
  );
}`;

  const [open, setOpen] = useState(false);

  const demo = (
    <div className="space-y-4">
      <UnderverseConfigProvider
        config={{
          borderMode: "xl",
          input: {
            borderMode: "md",
          },
          button: {
            borderMode: "2xl",
          },
          card: {
            borderMode: "md",
          },
          table: {
            borderMode: "md",
          },
          dropdownMenu: {
            borderMode: "md",
          },
          modal: {
            borderMode: "3xl",
          }
        }}
      >
        <div className="space-y-4 p-6 border rounded-xl bg-background/50 backdrop-blur-sm max-w-sm mx-auto shadow-sm relative z-0">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground ml-1">Input (Config: md)</span>
            <Input placeholder="Input element" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground ml-1">Color Picker (Config: input md)</span>
            <ColorPicker value="#4f46e5" onChange={() => {}} />
          </div>
          
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground ml-1">Button (Config: 2xl)</span>
            <Button className="w-full">Button element</Button>
          </div>
          
          <div className="pt-4 border-t">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground ml-1">Combobox (Fallback to global: xl)</span>
              <Combobox 
                placeholder="Combobox element" 
                options={[{ value: '1', label: 'Option 1' }]} 
                onChange={() => {}} 
              />
            </div>

            <div className="space-y-1.5 mt-4">
              <span className="text-xs font-medium text-muted-foreground ml-1">Date Time Picker (Config: input md)</span>
              <DateTimePicker 
                onChange={() => {}} 
                placeholder="Select date and time"
              />
            </div>

            <div className="space-y-1.5 mt-4">
              <span className="text-xs font-medium text-muted-foreground ml-1">Category Tree (Fallback to global: xl)</span>
              <CategoryTreeSelect 
                categories={[{ id: 1, name: "Technology" }, { id: 2, name: "Design", parent_id: 1 }]} 
                placeholder="Select category"
              />
            </div>

            <div className="space-y-1.5 mt-4">
              <span className="text-xs font-medium text-muted-foreground ml-1">Radio Group Card (Fallback to global: xl)</span>
              <RadioGroup value="1" onValueChange={() => {}} variant="card">
                <RadioGroupItem value="1" label="Option 1" description="This is a card style radio" />
              </RadioGroup>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground ml-1">Modal (Config: 3xl)</span>
              <Button borderMode="sm" variant="outline" className="w-full" onClick={() => setOpen(true)}>
                Open Modal
              </Button>
              <Modal isOpen={open} onClose={() => setOpen(false)} title="Global Config Modal">
                <div className="p-4 text-sm text-muted-foreground">
                  Notice how this modal container uses the '3xl' border radius configured in the global UnderverseUIConfig provider.
                </div>
              </Modal>
            </div>
            
            <div className="space-y-1.5 mt-4">
              <span className="text-xs font-medium text-muted-foreground ml-1">Card (Config: md)</span>
              <Card title="Card Title" description="Card Content Description" />
            </div>

            <div className="space-y-1.5 mt-4">
              <span className="text-xs font-medium text-muted-foreground ml-1">Table (Config: md)</span>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Header</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Row Data</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="space-y-1.5 mt-4">
              <span className="text-xs font-medium text-muted-foreground ml-1">DropdownMenu (Config: md)</span>
              <DropdownMenu
                trigger={<Button variant="outline" className="w-full">Open Dropdown Menu</Button>}
              >
                <DropdownMenuItem label="Option 1" />
                <DropdownMenuItem label="Option 2" />
                <DropdownMenuItem label="Option 3" />
              </DropdownMenu>
            </div>
          </div>
        </div>
      </UnderverseConfigProvider>
    </div>
  );

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Use <code>UnderverseConfigProvider</code> to set default UI styles and behaviors across all components without passing props to each one.
      </p>

      <Tabs 
        id="config-provider-tabs"
        tabs={[
          { 
            value: "preview", 
            label: t("tabs.preview"), 
            content: (
              <div className="rounded-xl border border-border/50 bg-muted/10 p-6 md:p-8 mt-4">
                {demo}
              </div>
            ) 
          },
          { 
            value: "code", 
            label: t("tabs.code"), 
            content: <div className="mt-4"><CodeBlock code={code} /></div>
          },
        ]}
        variant="underline"
        size="sm"
      />
    </div>
  );
}
