"use client";

import React from "react";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";
import { useTranslations } from "next-intl";
import { DateUtils } from "@underverse-ui/underverse";
import { useLocale } from "@/hooks/useLocale";

export default function DateUtilsExample() {
  const td = useTranslations("DocsUnderverse");
  const currentLocale = useLocale() as "en" | "vi" | "ko" | "ja";

  // Demo values
  const now = new Date();
  const oneHourAgo = new Date(Date.now() - 3600000);
  const oneDayAgo = new Date(Date.now() - 86400000);
  const oneWeekAgo = new Date(Date.now() - 7 * 86400000);

  const code = `import { DateUtils } from '@underverse-ui/underverse'

// formatDate - Full date format
DateUtils.formatDate(new Date(), 'en')  // "January 5, 2026"
DateUtils.formatDate(new Date(), 'vi')  // "05/01/2026"
DateUtils.formatDate(new Date(), 'ko')  // "2026년 1월 5일"
DateUtils.formatDate(new Date(), 'ja')  // "2026年1月5日"

// formatTimeAgo - Relative time
DateUtils.formatTimeAgo(oneHourAgo, 'en')  // "1 hour ago"
DateUtils.formatTimeAgo(oneHourAgo, 'vi')  // "1 giờ trước"
DateUtils.formatTimeAgo(oneHourAgo, 'ko')  // "1시간 전"
DateUtils.formatTimeAgo(oneHourAgo, 'ja')  // "1時間前"

// formatDateSmart - Today/Yesterday/Full date
DateUtils.formatDateSmart(now, 'en')       // "Today 14:30"
DateUtils.formatDateSmart(yesterday, 'ko') // "어제 14:30"

// getDayOfWeek
DateUtils.getDayOfWeek(now, 'ja')  // "日曜日"

// Utility checks
DateUtils.isToday(new Date())      // true
DateUtils.isYesterday(yesterday)   // true

// Form input formatting
DateUtils.formatDateForInput(new Date())       // "2026-01-05"
DateUtils.formatDateTimeForInput(new Date())   // "2026-01-05T14:30"`;

  const functionsRows: PropsRow[] = [
    { property: "formatDate(date, locale)", type: "string", default: "-", description: "Full date format (e.g., 'January 5, 2026')" },
    { property: "formatDateShort(date, locale)", type: "string", default: "-", description: "Short date format (e.g., 'Jan 5, 2026')" },
    { property: "formatTime(date, locale)", type: "string", default: "-", description: "Time only (e.g., '14:30')" },
    { property: "formatDateTime(date, locale)", type: "string", default: "-", description: "Date + time combined" },
    { property: "formatTimeAgo(date, locale)", type: "string", default: "-", description: "Relative time (e.g., '2 hours ago')" },
    { property: "formatDateSmart(date, locale)", type: "string", default: "-", description: "Today/Yesterday + time, or full date" },
    { property: "isToday(date)", type: "boolean", default: "-", description: "Check if date is today" },
    { property: "isYesterday(date)", type: "boolean", default: "-", description: "Check if date is yesterday" },
    { property: "getDayOfWeek(date, locale)", type: "string", default: "-", description: "Localized day name (e.g., 'Sunday')" },
    { property: "formatDateForInput(date)", type: "string", default: "-", description: "YYYY-MM-DD format for <input type='date'>" },
    { property: "formatDateTimeForInput(date)", type: "string", default: "-", description: "YYYY-MM-DDTHH:mm format for datetime-local" },
  ];

  const tabItems: { label: string; value: string; content: React.ReactNode }[] = [
    {
      label: td("demo"),
      value: "demo",
      content: (
        <div className="space-y-8 p-4">
          {/* Live Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Live Demo (Current Locale: {currentLocale})</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {/* formatDate */}
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium">formatDate</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">en:</span> {DateUtils.formatDate(now, "en")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">vi:</span> {DateUtils.formatDate(now, "vi")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">ko:</span> {DateUtils.formatDate(now, "ko")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">ja:</span> {DateUtils.formatDate(now, "ja")}
                  </div>
                </div>
              </div>

              {/* formatTimeAgo */}
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium">formatTimeAgo (1 hour ago)</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">en:</span> {DateUtils.formatTimeAgo(oneHourAgo, "en")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">vi:</span> {DateUtils.formatTimeAgo(oneHourAgo, "vi")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">ko:</span> {DateUtils.formatTimeAgo(oneHourAgo, "ko")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">ja:</span> {DateUtils.formatTimeAgo(oneHourAgo, "ja")}
                  </div>
                </div>
              </div>

              {/* formatDateSmart */}
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium">formatDateSmart (Today)</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">en:</span> {DateUtils.formatDateSmart(now, "en")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">vi:</span> {DateUtils.formatDateSmart(now, "vi")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">ko:</span> {DateUtils.formatDateSmart(now, "ko")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">ja:</span> {DateUtils.formatDateSmart(now, "ja")}
                  </div>
                </div>
              </div>

              {/* getDayOfWeek */}
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium">getDayOfWeek</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">en:</span> {DateUtils.getDayOfWeek(now, "en")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">vi:</span> {DateUtils.getDayOfWeek(now, "vi")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">ko:</span> {DateUtils.getDayOfWeek(now, "ko")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">ja:</span> {DateUtils.getDayOfWeek(now, "ja")}
                  </div>
                </div>
              </div>

              {/* Utility checks */}
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium">Utility Checks</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">isToday(now):</span> {DateUtils.isToday(now) ? "✅ true" : "❌ false"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">isYesterday(now):</span> {DateUtils.isYesterday(now) ? "✅ true" : "❌ false"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">isYesterday(oneDayAgo):</span> {DateUtils.isYesterday(oneDayAgo) ? "✅ true" : "❌ false"}
                  </div>
                </div>
              </div>

              {/* Form Input Formats */}
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium">Form Input Formats</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">formatDateForInput:</span> <code>{DateUtils.formatDateForInput(now)}</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">formatDateTimeForInput:</span> <code>{DateUtils.formatDateTimeForInput(now)}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Code */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Code Example</h3>
            <CodeBlock code={code} />
          </div>

          {/* Locale Examples Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">formatTimeAgo Examples</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border rounded-lg">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left">Time Unit</th>
                    <th className="px-4 py-2 text-left">English</th>
                    <th className="px-4 py-2 text-left">Vietnamese</th>
                    <th className="px-4 py-2 text-left">Korean</th>
                    <th className="px-4 py-2 text-left">Japanese</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-2">Just now</td>
                    <td className="px-4 py-2">just now</td>
                    <td className="px-4 py-2">vừa xong</td>
                    <td className="px-4 py-2">방금</td>
                    <td className="px-4 py-2">たった今</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2">Minutes</td>
                    <td className="px-4 py-2">5 minutes ago</td>
                    <td className="px-4 py-2">5 phút trước</td>
                    <td className="px-4 py-2">5분 전</td>
                    <td className="px-4 py-2">5分前</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2">Hours</td>
                    <td className="px-4 py-2">2 hours ago</td>
                    <td className="px-4 py-2">2 giờ trước</td>
                    <td className="px-4 py-2">2시간 전</td>
                    <td className="px-4 py-2">2時間前</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2">Days</td>
                    <td className="px-4 py-2">3 days ago</td>
                    <td className="px-4 py-2">3 ngày trước</td>
                    <td className="px-4 py-2">3일 전</td>
                    <td className="px-4 py-2">3日前</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2">Weeks</td>
                    <td className="px-4 py-2">1 week ago</td>
                    <td className="px-4 py-2">1 tuần trước</td>
                    <td className="px-4 py-2">1주 전</td>
                    <td className="px-4 py-2">1週間前</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2">Months</td>
                    <td className="px-4 py-2">2 months ago</td>
                    <td className="px-4 py-2">2 tháng trước</td>
                    <td className="px-4 py-2">2개월 전</td>
                    <td className="px-4 py-2">2ヶ月前</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2">Years</td>
                    <td className="px-4 py-2">1 year ago</td>
                    <td className="px-4 py-2">1 năm trước</td>
                    <td className="px-4 py-2">1년 전</td>
                    <td className="px-4 py-2">1年前</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Functions",
      value: "functions",
      content: <PropsDocsTable rows={functionsRows} />,
    },
  ];

  return (
    <section id="date-utils" className="scroll-mt-20 space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">DateUtils</h2>
      <p className="text-muted-foreground">
        Standalone date formatting utilities with multi-locale support (en, vi, ko, ja). No Next.js dependencies.
      </p>
      <Tabs tabs={tabItems} defaultValue="demo" />
    </section>
  );
}
