"use client";

import React from 'react';
import { LanguageSwitcher } from '@underverse-ui/underverse';
import { useRouter, usePathname } from 'next/navigation';
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

const locales = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export default function LanguageSwitcherHeadlessExample() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = React.useMemo(() => pathname.split('/')[1] || 'vi', [pathname]);

  const onSwitch = (code: string) => {
    const segs = pathname.split('/');
    segs[1] = code;
    router.push(segs.join('/'));
  };

  const code =
    `import { LanguageSwitcher } from '@underverse-ui/underverse'\n` +
    `import { useRouter, usePathname } from 'next/navigation'\n\n` +
    `const locales = [\n` +
    `  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },\n` +
    `  { code: 'en', name: 'English', flag: '🇺🇸' },\n` +
    `  { code: 'ko', name: '한국어', flag: '🇰🇷' },\n` +
    `  { code: 'ja', name: '日本語', flag: '🇯🇵' },\n` +
    `]\n\n` +
    `const router = useRouter()\n` +
    `const pathname = usePathname()\n` +
    `const currentLocale = useMemo(() => pathname.split('/')[1] || 'vi', [pathname])\n\n` +
    `const onSwitch = (code: string) => {\n` +
    `  const segs = pathname.split('/')\n` +
    `  segs[1] = code\n` +
    `  router.push(segs.join('/'))\n` +
    `}\n\n` +
    `<LanguageSwitcher locales={locales} currentLocale={currentLocale} onSwitch={onSwitch} />`;

  const demo = (
    <div>
      <LanguageSwitcher locales={locales} currentLocale={currentLocale} onSwitch={onSwitch} />
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

