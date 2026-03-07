# FloatingContacts

Source: `components/ui/FloatingContacts.tsx`

Status:
- App-only component
- Not exported from `@underverse-ui/underverse`

Reason:
- Depends on Next.js routing APIs and app-specific environment variables.

Use it only from the app source:

```tsx
import FloatingContacts from "@/components/ui/FloatingContacts";

export function Example() {
  return <FloatingContacts />;
}
```

```ts
interface FloatingContactsProps {
  className?: string;
}
```
