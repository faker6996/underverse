"use client";

import React from "react";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";
import { useTranslations } from "next-intl";

// Note: This example shows how to use TranslationProvider in standalone React apps (Vite, CRA, etc.)
// In Next.js with next-intl, you don't need TranslationProvider - components auto-detect next-intl

export default function TranslationProviderExample() {
  const td = useTranslations("DocsUnderverse");

  const standaloneReactCode = `// For Standalone React (Vite, CRA, etc.)
import { TranslationProvider, DatePicker, Button, Pagination } from '@underverse-ui/underverse'

function App() {
  const [date, setDate] = React.useState<Date>()
  const [page, setPage] = React.useState(1)

  return (
    <TranslationProvider locale="ko">
      {/* All components inside will use Korean translations */}
      <DatePicker 
        value={date} 
        onChange={setDate} 
        label="배송일"
        // placeholder will show: 날짜 선택
        // today button: 오늘
        // clear button: 지우기
      />

      <Pagination
        page={page}
        totalPages={10}
        onChange={setPage}
        showInfo
        totalItems={100}
        // Will show: 1 - 10 / 100 항목
      />
    </TranslationProvider>
  )
}`;

  const multiLocaleCode = `// Dynamic locale switching
import { TranslationProvider, DatePicker } from '@underverse-ui/underverse'
import { useState } from 'react'

type Locale = 'en' | 'vi' | 'ko' | 'ja'

function App() {
  const [locale, setLocale] = useState<Locale>('en')
  const [date, setDate] = useState<Date>()

  return (
    <div>
      {/* Locale selector */}
      <select 
        value={locale} 
        onChange={(e) => setLocale(e.target.value as Locale)}
      >
        <option value="en">🇺🇸 English</option>
        <option value="vi">🇻🇳 Tiếng Việt</option>
        <option value="ko">🇰🇷 한국어</option>
        <option value="ja">🇯🇵 日本語</option>
      </select>

      {/* Components will re-render with new locale */}
      <TranslationProvider locale={locale}>
        <DatePicker value={date} onChange={setDate} />
      </TranslationProvider>
    </div>
  )
}`;

  const customTranslationsCode = `// Override default translations
import { TranslationProvider, DatePicker } from '@underverse-ui/underverse'

function App() {
  const [date, setDate] = React.useState<Date>()

  return (
    <TranslationProvider 
      locale="ja"
      translations={{
        DatePicker: {
          placeholder: "日付を選んでください (custom)",
          today: "本日",
          clear: "クリア",
        },
        Common: {
          close: "閉じる (custom)",
        },
      }}
    >
      <DatePicker value={date} onChange={setDate} />
    </TranslationProvider>
  )
}`;

  const nextjsCode = `// For Next.js with next-intl
// No TranslationProvider needed! Components auto-detect next-intl

// 1. Merge underverse messages in layout.tsx
import { NextIntlClientProvider, getMessages } from 'next-intl/server'
import { underverseMessages } from '@underverse-ui/underverse'

export default async function RootLayout({ children, params }) {
  const locale = params.locale || 'vi'
  const appMessages = await getMessages()
  const uvMessages = underverseMessages[locale] || underverseMessages.en
  
  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={{ ...uvMessages, ...appMessages }}
    >
      {children}
    </NextIntlClientProvider>
  )
}

// 2. Use components directly - they auto-detect next-intl
import { DatePicker, Pagination } from '@underverse-ui/underverse'

function MyPage() {
  const [date, setDate] = React.useState<Date>()
  
  return (
    <DatePicker value={date} onChange={setDate} />
    // Will use translations from NextIntlClientProvider
  )
}`;

  const propsRows: PropsRow[] = [
    { property: "locale", type: '"en" | "vi" | "ko" | "ja"', default: '"en"', description: "Active locale for translations" },
    { property: "translations", type: "Translations", default: "undefined", description: "Custom translation overrides (merged with defaults)" },
    { property: "children", type: "ReactNode", default: "-", description: "Child components that will use translations" },
  ];

  const tabItems: { label: string; value: string; content: React.ReactNode }[] = [
    {
      label: td("tabs.demo"),
      value: "demo",
      content: (
        <div className="space-y-8 p-4">
          {/* Standalone React Usage */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Standalone React (Vite, CRA, etc.)</h3>
            <p className="text-sm text-muted-foreground">Wrap your app with TranslationProvider to enable i18n for all underverse components.</p>
            <CodeBlock code={standaloneReactCode} />
          </div>

          {/* Dynamic Locale Switching */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dynamic Locale Switching</h3>
            <p className="text-sm text-muted-foreground">You can dynamically change the locale by updating the TranslationProvider's locale prop.</p>
            <CodeBlock code={multiLocaleCode} />
          </div>

          {/* Custom Translations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Custom Translations</h3>
            <p className="text-sm text-muted-foreground">Override default translations with your own via the translations prop.</p>
            <CodeBlock code={customTranslationsCode} />
          </div>

          {/* Next.js Usage */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Next.js with next-intl</h3>
            <p className="text-sm text-muted-foreground">
              In Next.js projects using next-intl, you don't need TranslationProvider. Components auto-detect and use next-intl's translations.
            </p>
            <CodeBlock code={nextjsCode} />
          </div>

          {/* Supported Locales Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Supported Locales</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border rounded-lg">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left">Locale</th>
                    <th className="px-4 py-2 text-left">Language</th>
                    <th className="px-4 py-2 text-left">Flag</th>
                    <th className="px-4 py-2 text-left">Example: DatePicker Placeholder</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-2 font-mono">en</td>
                    <td className="px-4 py-2">English</td>
                    <td className="px-4 py-2">🇺🇸</td>
                    <td className="px-4 py-2">Select a date</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2 font-mono">vi</td>
                    <td className="px-4 py-2">Tiếng Việt</td>
                    <td className="px-4 py-2">🇻🇳</td>
                    <td className="px-4 py-2">Chọn ngày</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2 font-mono">ko</td>
                    <td className="px-4 py-2">한국어</td>
                    <td className="px-4 py-2">🇰🇷</td>
                    <td className="px-4 py-2">날짜 선택</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2 font-mono">ja</td>
                    <td className="px-4 py-2">日本語</td>
                    <td className="px-4 py-2">🇯🇵</td>
                    <td className="px-4 py-2">日付を選択</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Props",
      value: "props",
      content: <PropsDocsTable rows={propsRows} />,
    },
  ];

  return (
    <section id="translation-provider" className="scroll-mt-20 space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">TranslationProvider</h2>
      <p className="text-muted-foreground">Context provider for i18n in standalone React apps. For Next.js with next-intl, this is not needed.</p>
      <Tabs tabs={tabItems} defaultValue="demo" />
    </section>
  );
}
