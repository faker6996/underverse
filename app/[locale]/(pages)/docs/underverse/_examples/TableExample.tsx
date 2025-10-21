"use client";

import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import CodeBlock from "../_components/CodeBlock";

export default function TableExample() {
  const rows = [
    { name: "Alice", role: "Admin" },
    { name: "Bob", role: "User" },
  ];
  return (
    <div className="space-y-3">
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
      <CodeBlock
        code={`import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@underverse-ui/underverse'\n\n<Table>...rows...</Table>`}
      />
    </div>
  );
}

