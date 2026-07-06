"use client";

import React from "react";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";
import { useTranslations } from "next-intl";
import { DateUtils, LunarUtils } from "@underverse-ui/underverse";

export default function DateUtilsExample() {
  const td = useTranslations("DocsUnderverse");

  // Demo values
  const now = new Date();
  const nowTs = now.getTime();
  const oneHourAgo = new Date(nowTs - 3600000);
  const oneDayAgo = new Date(nowTs - 86400000);

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
DateUtils.formatDateTimeForInput(new Date())   // "2026-01-05T14:30"

// --- Lunar Utilities ---
const lunar = LunarUtils.solarToLunar(new Date())
LunarUtils.lunarToSolar(lunar)     // e.g., "2026-01-05"
LunarUtils.formatLunarDate(lunar)  // e.g., "17/11/2025"
LunarUtils.formatLunarBadge(new Date()) // e.g., "(L11.17)"`;

  const functionsRows: PropsRow[] = [
    { property: "formatDate(date, locale)", type: "string", default: "-", description: td("examples.dateUtils.formatDateDescription") },
    { property: "formatDateShort(date, locale)", type: "string", default: "-", description: td("examples.dateUtils.formatDateShortDescription") },
    { property: "formatTime(date, locale)", type: "string", default: "-", description: td("examples.dateUtils.formatTimeDescription") },
    { property: "formatDateTime(date, locale)", type: "string", default: "-", description: td("examples.dateUtils.formatDateTimeDescription") },
    { property: "formatTimeAgo(date, locale)", type: "string", default: "-", description: td("examples.dateUtils.formatTimeAgoDescription") },
    { property: "formatDateSmart(date, locale)", type: "string", default: "-", description: td("examples.dateUtils.formatDateSmartDescription") },
    { property: "isToday(date)", type: "boolean", default: "-", description: td("examples.dateUtils.isTodayDescription") },
    { property: "isYesterday(date)", type: "boolean", default: "-", description: td("examples.dateUtils.isYesterdayDescription") },
    { property: "getDayOfWeek(date, locale)", type: "string", default: "-", description: td("examples.dateUtils.getDayOfWeekDescription") },
    { property: "formatDateForInput(date)", type: "string", default: "-", description: td("examples.dateUtils.formatDateForInputDescription") },
    { property: "formatDateTimeForInput(date)", type: "string", default: "-", description: td("examples.dateUtils.formatDateTimeForInputDescription") },
  ];

  const demo = (
    <div className="space-y-6 p-4">
      {/* Live Demo Grid */}
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
          <h4 className="font-medium">{td("examples.dateUtils.utilityChecks")}</h4>
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
          <h4 className="font-medium">{td("examples.dateUtils.formInputFormats")}</h4>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-muted-foreground">formatDateForInput:</span> <code>{DateUtils.formatDateForInput(now)}</code>
            </div>
            <div>
              <span className="text-muted-foreground">formatDateTimeForInput:</span> <code>{DateUtils.formatDateTimeForInput(now)}</code>
            </div>
          </div>
        </div>

        {/* Lunar Date Utilities */}
        <div className="p-4 border rounded-lg space-y-2 md:col-span-2">
          <h4 className="font-medium">{td("examples.dateUtils.lunarDateUtilities")}</h4>
          <div className="text-sm space-y-1 grid md:grid-cols-2 gap-4 mt-2">
            <div>
              <span className="text-muted-foreground block mb-1">solarToLunar(now):</span>
              <pre className="text-[10px] p-2 bg-muted rounded-md overflow-x-auto">
                {JSON.stringify(LunarUtils.solarToLunar(now), null, 2)}
              </pre>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-muted-foreground block mb-1">lunarToSolar(lunar):</span> 
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{LunarUtils.lunarToSolar(LunarUtils.solarToLunar(now))}</code>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">formatLunarDate(lunar):</span> 
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{LunarUtils.formatLunarDate(LunarUtils.solarToLunar(now))}</code>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">formatLunarBadge(now):</span> 
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{LunarUtils.formatLunarBadge(now)}</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* formatTimeAgo Examples Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{td("examples.dateUtils.formatTimeAgoExamples")}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded-lg">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left">{td("examples.dateUtils.timeUnit")}</th>
                <th className="px-4 py-2 text-left">{td("examples.dateUtils.english")}</th>
                <th className="px-4 py-2 text-left">{td("examples.dateUtils.vietnamese")}</th>
                <th className="px-4 py-2 text-left">{td("examples.dateUtils.korean")}</th>
                <th className="px-4 py-2 text-left">{td("examples.dateUtils.japanese")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-2">{td("examples.dateUtils.justNow")}</td>
                <td className="px-4 py-2">just now</td>
                <td className="px-4 py-2">vừa xong</td>
                <td className="px-4 py-2">방금</td>
                <td className="px-4 py-2">たった今</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2">{td("examples.dateUtils.minutes")}</td>
                <td className="px-4 py-2">5 minutes ago</td>
                <td className="px-4 py-2">5 phút trước</td>
                <td className="px-4 py-2">5분 전</td>
                <td className="px-4 py-2">5分前</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2">{td("examples.dateUtils.hours")}</td>
                <td className="px-4 py-2">2 hours ago</td>
                <td className="px-4 py-2">2 giờ trước</td>
                <td className="px-4 py-2">2시간 전</td>
                <td className="px-4 py-2">2時間前</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2">{td("examples.dateUtils.days")}</td>
                <td className="px-4 py-2">3 days ago</td>
                <td className="px-4 py-2">3 ngày trước</td>
                <td className="px-4 py-2">3일 전</td>
                <td className="px-4 py-2">3日前</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const lunarFunctionsRows: PropsRow[] = [
    { property: "solarToLunar(date)", type: "LunarDateValue", default: "-", description: td("examples.dateUtils.solarToLunarDesc") },
    { property: "lunarToSolar(lunar)", type: "string", default: "-", description: td("examples.dateUtils.lunarToSolarDesc") },
    { property: "formatLunarDate(lunar)", type: "string", default: "-", description: td("examples.dateUtils.formatLunarDateDesc") },
    { property: "formatLunarBadge(date)", type: "string", default: "-", description: td("examples.dateUtils.formatLunarBadgeDesc") },
  ];

  const docs = (
    <div className="space-y-8 p-1">
      <div>
        <p className="text-sm font-medium mb-3">{td("examples.dateUtils.solarDateUtilities")}</p>
        <PropsDocsTable rows={functionsRows} />
      </div>
      <div>
        <p className="text-sm font-medium mb-3">{td("examples.dateUtils.lunarDateUtilities")}</p>
        <PropsDocsTable rows={lunarFunctionsRows} />
      </div>
    </div>
  );

  return (
    <Tabs id="date-utils-tabs"
      tabs={[
        { value: "preview", label: td("tabs.preview"), content: <div className="p-1">{demo}</div> },
        { value: "code", label: td("tabs.code"), content: <CodeBlock code={code} /> },
        { value: "docs", label: td("tabs.document"), content: docs },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
