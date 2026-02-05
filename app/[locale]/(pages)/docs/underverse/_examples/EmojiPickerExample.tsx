"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function EmojiPickerExample() {
    const t = useTranslations("DocsUnderverse");
    const [selectedEmoji, setSelectedEmoji] = React.useState("");
    const [message, setMessage] = React.useState("");

    const demo = (
        <div className="space-y-8">
            {/* Basic Example with Chat Integration */}
            <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground/90">Basic Usage</p>
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                            onClick={() => {
                                if (message.trim()) {
                                    console.log("Send:", message);
                                    setMessage("");
                                }
                            }}
                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Send
                        </button>
                    </div>
                    <div className="flex justify-center">
                        <EmojiPicker
                            onEmojiSelect={(emoji) => setMessage(message + emoji)}
                            columns={9}
                            maxHeight="18rem"
                        />
                    </div>
                </div>
            </div>

            {/* Custom Props */}
            <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground/90">Custom Props</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Custom Placeholder & Columns</p>
                        <div className="flex justify-center">
                            <EmojiPicker
                                onEmojiSelect={(emoji) => console.log(emoji)}
                                searchPlaceholder="Tìm emoji..."
                                columns={8}
                                maxHeight="20rem"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Compact (No Search)</p>
                        <div className="flex justify-center">
                            <EmojiPicker
                                onEmojiSelect={(emoji) => console.log(emoji)}
                                showSearch={false}
                                columns={7}
                                maxHeight="15rem"
                                className="w-80"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const code =
        `import { EmojiPicker } from '@underverse-ui/underverse'

// Basic usage
const [selectedEmoji, setSelectedEmoji] = useState('')
<EmojiPicker onEmojiSelect={(emoji) => setSelectedEmoji(emoji)} />

// Custom props
<EmojiPicker
  onEmojiSelect={(emoji) => console.log(emoji)}
  searchPlaceholder="Tìm emoji..."
  columns={8}
  maxHeight="25rem"
  className="w-full max-w-md"
/>

// Compact version (no search)
<EmojiPicker
  onEmojiSelect={(emoji) => handleSelect(emoji)}
  showSearch={false}
  columns={7}
  maxHeight="15rem"
/>

// Chat integration
function ChatInput() {
  const [message, setMessage] = useState('')

  return (
    <div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <EmojiPicker
        onEmojiSelect={(emoji) => setMessage(message + emoji)}
      />
    </div>
  )
}`;

    const rows: PropsRow[] = [
        {
            property: "onEmojiSelect",
            description: "Callback when emoji is selected",
            type: "(emoji: string) => void",
            default: "Required",
        },
        {
            property: "className",
            description: "Additional CSS classes for container",
            type: "string",
            default: "-",
        },
        {
            property: "searchPlaceholder",
            description: "Placeholder text for search input",
            type: "string",
            default: '"Search emojis..."',
        },
        {
            property: "showSearch",
            description: "Show/hide search bar",
            type: "boolean",
            default: "true",
        },
        {
            property: "showCategoryNav",
            description: "Show/hide bottom category navigation",
            type: "boolean",
            default: "true",
        },
        {
            property: "columns",
            description: "Number of emoji columns in grid",
            type: "number",
            default: "9",
        },
        {
            property: "maxHeight",
            description: "Maximum height of scroll area",
            type: "string",
            default: '"20rem"',
        },
    ];

    const order = [
        "onEmojiSelect",
        "className",
        "searchPlaceholder",
        "showSearch",
        "showCategoryNav",
        "columns",
        "maxHeight",
    ];

    const docs = <PropsDocsTable rows={rows} order={order} markdownFile="EmojiPicker.md" />;

    return (
        <Tabs
            tabs={[
                { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{demo}</div> },
                { value: "code", label: t("tabs.code"), content: <CodeBlock code={code} /> },
                { value: "docs", label: t("tabs.document"), content: <div className="p-1">{docs}</div> },
            ]}
            variant="underline"
            size="sm"
        />
    );
}
