import React from "react";
import { UnderverseConfigProvider, Button, Input, Combobox, Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@underverse-ui/underverse";
import CodeBlock from "../_components/CodeBlock";

export default function ConfigProviderExample() {
  const code = `import { UnderverseConfigProvider, Button, Input, Combobox, Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@underverse-ui/underverse";

function App() {
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
        }
      }}
    >
      <div className="space-y-4 p-4 border rounded-xl bg-muted/20">
        <Input placeholder="Inherits 'md' from input config" />
        <Button className="w-full">Inherits '2xl' from button config</Button>
        <Combobox 
          placeholder="Inherits 'xl' from global config" 
          options={[{ value: '1', label: 'Option 1' }]} 
          onChange={() => {}} 
        />
        <Button borderMode="sm" variant="outline" className="w-full">
          Direct prop override (borderMode="sm")
        </Button>
        
        <Card title="Card Component" description="Inherits 'md' from card config" />
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Table Component</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Inherits 'md' from table config</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </UnderverseConfigProvider>
  );
}`;

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
          }
        }}
      >
        <div className="space-y-4 p-6 border rounded-xl bg-background/50 backdrop-blur-sm max-w-sm mx-auto shadow-sm">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground ml-1">Input (Config: md)</span>
            <Input placeholder="Input element" />
          </div>
          
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground ml-1">Button (Config: 2xl)</span>
            <Button className="w-full">Button element</Button>
          </div>
          
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground ml-1">Combobox (Fallback to global: xl)</span>
            <Combobox 
              placeholder="Combobox element" 
              options={[{ value: '1', label: 'Option 1' }]} 
              onChange={() => {}} 
            />
          </div>
          
          <div className="pt-4 border-t">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground ml-1">Button (Direct Prop: sm)</span>
              <Button borderMode="sm" variant="outline" className="w-full">
                Override Prop
              </Button>
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

      {/* Demo Display */}
      <div className="rounded-xl border border-border/50 bg-muted/10 p-6 md:p-8">
        {demo}
      </div>

      {/* Source Code */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Code Example</h4>
        <CodeBlock code={code} />
      </div>
    </div>
  );
}
