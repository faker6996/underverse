"use client";

import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter, TableCaption } from "@/components/ui/Table";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function TableExample() {
  const rows = [
    { name: "Alice", role: "Admin", email: "alice@example.com" },
    { name: "Bob", role: "User", email: "bob@example.com" },
    { name: "Charlie", role: "Manager", email: "charlie@example.com" },
  ];

  const code =
    `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter, TableCaption } from '@underverse-ui/underverse'\n\n` +
    `const rows = [\n` +
    `  { name: 'Alice', role: 'Admin', email: 'alice@example.com' },\n` +
    `  { name: 'Bob', role: 'User', email: 'bob@example.com' },\n` +
    `  { name: 'Charlie', role: 'Manager', email: 'charlie@example.com' },\n` +
    `]\n\n` +
    `// 1) Basic table\n` +
    `<Table containerClassName=\"max-w-xl\">\n` +
    `  <TableHeader>\n` +
    `    <TableRow>\n` +
    `      <TableHead>Name</TableHead>\n` +
    `      <TableHead>Role</TableHead>\n` +
    `      <TableHead>Email</TableHead>\n` +
    `    </TableRow>\n` +
    `  </TableHeader>\n` +
    `  <TableBody>\n` +
    `    {rows.map((r, i) => (\n` +
    `      <TableRow key={i}>\n` +
    `        <TableCell>{r.name}</TableCell>\n` +
    `        <TableCell>{r.role}</TableCell>\n` +
    `        <TableCell>{r.email}</TableCell>\n` +
    `      </TableRow>\n` +
    `    ))}\n` +
    `  </TableBody>\n` +
    `</Table>\n\n` +
    `// 2) With caption\n` +
    `<Table containerClassName=\"max-w-xl mt-4\">\n` +
    `  <TableCaption>Company employees</TableCaption>\n` +
    `  <TableHeader>\n` +
    `    <TableRow>\n` +
    `      <TableHead>Name</TableHead>\n` +
    `      <TableHead>Role</TableHead>\n` +
    `    </TableRow>\n` +
    `  </TableHeader>\n` +
    `  <TableBody>\n` +
    `    {rows.slice(0,2).map((r, i) => (\n` +
    `      <TableRow key={i}>\n` +
    `        <TableCell>{r.name}</TableCell>\n` +
    `        <TableCell>{r.role}</TableCell>\n` +
    `      </TableRow>\n` +
    `    ))}\n` +
    `  </TableBody>\n` +
    `</Table>\n\n` +
    `// 3) With footer (summary)\n` +
    `<Table containerClassName=\"max-w-xl mt-4\">\n` +
    `  <TableHeader>\n` +
    `    <TableRow>\n` +
    `      <TableHead>Name</TableHead>\n` +
    `      <TableHead>Role</TableHead>\n` +
    `    </TableRow>\n` +
    `  </TableHeader>\n` +
    `  <TableBody>\n` +
    `    {rows.slice(0,2).map((r, i) => (\n` +
    `      <TableRow key={i}>\n` +
    `        <TableCell>{r.name}</TableCell>\n` +
    `        <TableCell>{r.role}</TableCell>\n` +
    `      </TableRow>\n` +
    `    ))}\n` +
    `  </TableBody>\n` +
    `  <TableFooter>\n` +
    `    <TableRow>\n` +
    `      <TableCell className=\"font-medium\">Total</TableCell>\n` +
    `      <TableCell>{rows.slice(0,2).length} users</TableCell>\n` +
    `    </TableRow>\n` +
    `  </TableFooter>\n` +
    `</Table>\n\n` +
    `// 4) Header with filterRow\n` +
    `<Table containerClassName=\"max-w-xl mt-4\">\n` +
    `  <TableHeader\n` +
    `    filterRow={(\n` +
    `      <TableRow>\n` +
    `        <TableCell colSpan={3}>\n` +
    `          <div className=\"flex gap-2 p-2\">\n` +
    `            <input className=\"px-2 py-1 text-sm rounded border bg-background\" placeholder=\"Filter name...\" />\n` +
    `            <input className=\"px-2 py-1 text-sm rounded border bg-background\" placeholder=\"Filter role...\" />\n` +
    `          </div>\n` +
    `        </TableCell>\n` +
    `      </TableRow>\n` +
    `    )}\n` +
    `  >\n` +
    `    <TableRow>\n` +
    `      <TableHead>Name</TableHead>\n` +
    `      <TableHead>Role</TableHead>\n` +
    `      <TableHead>Email</TableHead>\n` +
    `    </TableRow>\n` +
    `  </TableHeader>\n` +
    `  <TableBody>\n` +
    `    {rows.map((r, i) => (\n` +
    `      <TableRow key={i}>\n` +
    `        <TableCell>{r.name}</TableCell>\n` +
    `        <TableCell>{r.role}</TableCell>\n` +
    `        <TableCell>{r.email}</TableCell>\n` +
    `      </TableRow>\n` +
    `    ))}\n` +
    `  </TableBody>\n` +
    `</Table>`;

  const demo = (
    <div className="space-y-6">
      {/* 1) Basic table */}
      <Table containerClassName="max-w-xl">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.role}</TableCell>
              <TableCell>{r.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 2) With caption */}
      <Table containerClassName="max-w-xl">
        <TableCaption>Company employees</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.slice(0, 2).map((r, i) => (
            <TableRow key={i}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 3) With footer */}
      <Table containerClassName="max-w-xl">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.slice(0, 2).map((r, i) => (
            <TableRow key={i}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-medium">Total</TableCell>
            <TableCell>{rows.slice(0, 2).length} users</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {/* 4) Header filterRow */}
      <Table containerClassName="max-w-xl">
        <TableHeader
          filterRow={(
            <TableRow>
              <TableCell colSpan={3}>
                <div className="flex gap-2 p-2">
                  <input className="px-2 py-1 text-sm rounded border bg-background" placeholder="Filter name..." />
                  <input className="px-2 py-1 text-sm rounded border bg-background" placeholder="Filter role..." />
                </div>
              </TableCell>
            </TableRow>
          )}
        >
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.role}</TableCell>
              <TableCell>{r.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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

