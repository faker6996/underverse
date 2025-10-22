"use client";

import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function TableExample() {
  const rows = [
    { name: "Alice", role: "Admin" },
    { name: "Bob", role: "User" },
  ];

  const code =
    `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@underverse-ui/underverse'\n\n` +
    `const rows = [\n` +
    `  { name: "Alice", role: "Admin" },\n` +
    `  { name: "Bob", role: "User" },\n` +
    `]\n\n` +
    `<Table containerClassName="max-w-xl">\n` +
    `  <TableHeader>\n` +
    `    <TableRow>\n` +
    `      <TableHead>Name</TableHead>\n` +
    `      <TableHead>Role</TableHead>\n` +
    `    </TableRow>\n` +
    `  </TableHeader>\n` +
    `  <TableBody>\n` +
    `    {rows.map((r, i) => (\n` +
    `      <TableRow key={i}>\n` +
    `        <TableCell>{r.name}</TableCell>\n` +
    `        <TableCell>{r.role}</TableCell>\n` +
    `      </TableRow>\n` +
    `    ))}\n` +
    `  </TableBody>\n` +
    `</Table>`;

  const demo = (
    <div>
      <Table containerClassName="max-w-xl">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.role}</TableCell>
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

