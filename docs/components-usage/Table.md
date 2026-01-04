# Table

Source: `components/ui/Table.tsx`

Exports:
- Table
- TableHeader
- TableBody
- TableFooter
- TableHead
- TableRow
- TableCell
- TableCaption

Note: Usage snippets are minimal; fill required props from the props type below.

## Table

Props type: `TableProps`

```tsx
import { Table } from "@underverse-ui/underverse";

export function Example() {
  return <Table />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ten</TableHead>
          <TableHead>Gia</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>San pham A</TableCell>
          <TableCell>120.000d</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

```ts
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
}
```

## TableHeader

Props type: `TableHeaderProps`

```tsx
import { TableHeader } from "@underverse-ui/underverse";

export function Example() {
  return <TableHeader />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ten</TableHead>
          <TableHead>Gia</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>San pham A</TableCell>
          <TableCell>120.000d</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

```ts
interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  filterRow?: React.ReactNode;
}
```

## TableBody

Props type: `React.HTMLAttributes<HTMLTableSectionElement>`

```tsx
import { TableBody } from "@underverse-ui/underverse";

export function Example() {
  return <TableBody />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ten</TableHead>
          <TableHead>Gia</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>San pham A</TableCell>
          <TableCell>120.000d</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

## TableFooter

Props type: `React.HTMLAttributes<HTMLTableSectionElement>`

```tsx
import { TableFooter } from "@underverse-ui/underverse";

export function Example() {
  return <TableFooter />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Table, TableFooter, TableRow, TableCell } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Table>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Tong: 360.000d</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
```

## TableHead

Props type: `React.ThHTMLAttributes<HTMLTableCellElement>`

```tsx
import { TableHead } from "@underverse-ui/underverse";

export function Example() {
  return <TableHead />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ten</TableHead>
          <TableHead>Gia</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>San pham A</TableCell>
          <TableCell>120.000d</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

## TableRow

Props type: `React.HTMLAttributes<HTMLTableRowElement>`

```tsx
import { TableRow } from "@underverse-ui/underverse";

export function Example() {
  return <TableRow />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ten</TableHead>
          <TableHead>Gia</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>San pham A</TableCell>
          <TableCell>120.000d</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

## TableCell

Props type: `React.TdHTMLAttributes<HTMLTableCellElement>`

```tsx
import { TableCell } from "@underverse-ui/underverse";

export function Example() {
  return <TableCell />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ten</TableHead>
          <TableHead>Gia</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>San pham A</TableCell>
          <TableCell>120.000d</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

## TableCaption

Props type: `React.HTMLAttributes<HTMLTableCaptionElement>`

```tsx
import { TableCaption } from "@underverse-ui/underverse";

export function Example() {
  return <TableCaption />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Table, TableCaption } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Table>
      <TableCaption>Danh sach san pham</TableCaption>
    </Table>
  );
}
```
