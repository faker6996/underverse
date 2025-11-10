"use client";

import React from 'react';
import { LanguageSwitcher } from '@underverse-ui/underverse';
import { useRouter, usePathname } from 'next/navigation';
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";
import { useTranslations } from "next-intl";

const localesWithFlags = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

const localesNoFlags = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'English' },
  { code: 'ko', name: '한국어' },
  { code: 'ja', name: '日本語' },
];

export default function LanguageSwitcherHeadlessExample() {
  const td = useTranslations('DocsUnderverse');
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
    `const localesWithFlags = [\n` +
    `  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },\n` +
    `  { code: 'en', name: 'English', flag: '🇺🇸' },\n` +
    `  { code: 'ko', name: '한국어', flag: '🇰🇷' },\n` +
    `  { code: 'ja', name: '日本語', flag: '🇯🇵' },\n` +
    `]\n` +
    `const localesNoFlags = [\n` +
    `  { code: 'vi', name: 'Tiếng Việt' },\n` +
    `  { code: 'en', name: 'English' },\n` +
    `  { code: 'ko', name: '한국어' },\n` +
    `  { code: 'ja', name: '日本語' },\n` +
    `]\n\n` +
    `const router = useRouter()\n` +
    `const pathname = usePathname()\n` +
    `const currentLocale = useMemo(() => pathname.split('/')[1] || 'vi', [pathname])\n` +
    `const onSwitch = (code: string) => { const segs = pathname.split('/'); segs[1] = code; router.push(segs.join('/')) }\n\n` +
    `// 1) Basic (with flags)\n` +
    `<LanguageSwitcher locales={localesWithFlags} currentLocale={currentLocale} onSwitch={onSwitch} />\n\n` +
    `// 2) Custom heading label\n` +
    `<LanguageSwitcher locales={localesWithFlags} currentLocale={currentLocale} onSwitch={onSwitch} labels={{ heading: 'Language' }} />\n\n` +
    `// 3) Without flags\n` +
    `<LanguageSwitcher locales={localesNoFlags} currentLocale={currentLocale} onSwitch={onSwitch} />\n\n` +
    `// 4) In toolbar/header\n` +
    `<header className='flex items-center justify-between p-3 border rounded-lg'>\n` +
    `  <span className='text-sm font-medium'>Toolbar</span>\n` +
    `  <LanguageSwitcher locales={localesWithFlags} currentLocale={currentLocale} onSwitch={onSwitch} />\n` +
    `</header>\n\n` +
    `// 5) Multiple instances\n` +
    `<div className='flex items-center gap-2'>\n` +
    `  <LanguageSwitcher locales={localesWithFlags} currentLocale={currentLocale} onSwitch={onSwitch} />\n` +
    `  <LanguageSwitcher locales={localesWithFlags} currentLocale={currentLocale} onSwitch={onSwitch} />\n` +
    `</div>`;

  const demo = (
    <div className="space-y-6">
      {/* 1) Basic (with flags) */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Basic (with flags)</h3>
        <LanguageSwitcher locales={localesWithFlags} currentLocale={currentLocale} onSwitch={onSwitch} />
      </div>

      {/* 2) Custom heading */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Custom heading label</h3>
        <LanguageSwitcher locales={localesWithFlags} currentLocale={currentLocale} onSwitch={onSwitch} labels={{ heading: 'Language' }} />
      </div>

      {/* 3) Without flags */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Without flags</h3>
        <LanguageSwitcher locales={localesNoFlags} currentLocale={currentLocale} onSwitch={onSwitch} />
      </div>

      {/* 4) In toolbar/header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Header Toolbar</h3>
        <header className="flex items-center justify-between p-3 border rounded-lg">
          <span className="text-sm font-medium">Toolbar</span>
          <LanguageSwitcher locales={localesWithFlags} currentLocale={currentLocale} onSwitch={onSwitch} />
        </header>
      </div>

      {/* 5) Multiple instances */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Multiple Switchers</h3>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locales={localesWithFlags} currentLocale={currentLocale} onSwitch={onSwitch} />
          <LanguageSwitcher locales={localesWithFlags} currentLocale={currentLocale} onSwitch={onSwitch} />
        </div>
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: 'locales', description: td('props.languageSwitcher.locales'), type: '{ code: string; name: string; flag?: string; }[]', default: '-' },
    { property: 'currentLocale', description: td('props.languageSwitcher.currentLocale'), type: 'string', default: '-' },
    { property: 'onSwitch', description: td('props.languageSwitcher.onSwitch'), type: '(code: string) => void', default: '-' },
    { property: 'labels.heading', description: td('props.languageSwitcher.labels.heading'), type: 'string', default: '"Language"' },
    { property: 'className', description: td('props.languageSwitcher.className'), type: 'string', default: '-' },
  ];
  const docs = <PropsDocsTable rows={rows} order={rows.map(r=>r.property)} />;

  return (
    <Tabs
      tabs={[
        { value: "preview", label: td('tabs.preview'), content: <div className="p-1">{demo}</div> },
        { value: "code", label: td('tabs.code'), content: <CodeBlock code={code} /> },
        { value: "docs", label: td('tabs.document'), content: <div className="p-1">{docs}</div> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
