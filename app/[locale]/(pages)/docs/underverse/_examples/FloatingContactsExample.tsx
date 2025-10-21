"use client";

import CodeBlock from "../_components/CodeBlock";

export default function FloatingContactsExample() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Floating Contacts</h3>
        <p className="text-sm text-muted-foreground">
          Floating contact buttons for Zalo, Messenger, Instagram, and Phone (hotline).
        </p>
      </div>

      <div className="text-sm text-muted-foreground space-y-2">
        <p className="font-medium">Features:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Fixed position floating buttons on the bottom-right corner</li>
          <li>Phone/Hotline button with expandable menu</li>
          <li>Zalo, Messenger, Instagram quick links</li>
          <li>Auto-hide on admin pages</li>
          <li>Configurable via environment variables</li>
          <li>Responsive design with smooth animations</li>
        </ul>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Environment Variables:</p>
        <CodeBlock
          code={`NEXT_PUBLIC_HOTLINE=0962209870
NEXT_PUBLIC_ZALO=0356611301
NEXT_PUBLIC_MESSENGER_URL=https://m.me/thejojoflowers
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/thejojoflowers`}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Usage:</p>
        <CodeBlock
          code={`import FloatingContacts from '@/components/ui/FloatingContacts';

// Add to your layout or page
<FloatingContacts />`}
        />
      </div>

      <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-900 dark:text-amber-100">
          <strong>Note:</strong> This component is typically placed in the root layout and automatically
          hides on admin pages. It's not rendered in this demo to avoid conflicts with the actual
          floating contacts on the site.
        </p>
      </div>
    </div>
  );
}
