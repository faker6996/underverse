"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { StickerPicker } from "@/components/ui/StickerPicker";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";
import { Smile, Trash2 } from "lucide-react";
import { cn } from "@/packages/underverse/src/utils/cn";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  name: string;
  avatar: string;
  sticker?: {
    packId: string;
    id: string;
    name: string;
    url: string;
  };
  text?: string;
  time: string;
}

export default function StickerPickerExample() {
  const t = useTranslations("DocsUnderverse");
  const [activePicker, setActivePicker] = React.useState<"none" | "standard">("none");

  // Static list of messages to showcase initial state with a sticker
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      name: "Underverse Bot",
      avatar: "✨",
      text: "Welcome! Click the sticker/smile button below to select a custom offline 3D sticker! Emojis and Stickers have completely offline assets built-in.",
      time: "10:30 AM",
    },
    {
      id: "2",
      sender: "bot",
      name: "Underverse Bot",
      avatar: "✨",
      sticker: {
        packId: "memoji_apple",
        id: "thumbs_up",
        name: "Thumbs Up",
        url: "/stickers/memoji_apple/thumbs_up.png",
      },
      time: "10:31 AM",
    },
  ]);

  const handleStickerSelect = (sticker: { id: string; name: string; packId: string; url: string }) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      name: "You",
      avatar: "👤",
      sticker: {
        packId: sticker.packId,
        id: sticker.id,
        name: sticker.name,
        url: sticker.url,
      },
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setActivePicker("none");
  };

  const clearChat = () => {
    setChatMessages([
      {
        id: "1",
        sender: "bot",
        name: "Underverse Bot",
        avatar: "✨",
        text: "Chat cleared. Go ahead and send some stickers! 💬",
        time: "10:30 AM",
      },
    ]);
  };

  const demo = (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        The <strong>StickerPicker</strong> is a self-contained premium stickers component designed with dynamic backgrounds,
        real-time matching search filters, and automatic pack layout grouping.
      </p>

      {/* Simulated Chat & Picker Wrapper */}
      <div className="relative border border-border/80 rounded-2xl bg-card overflow-hidden shadow-sm flex flex-col h-[500px]">
        {/* Chat feed */}
        <div className="flex-1 flex flex-col overflow-hidden bg-muted/5">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-card/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold">Offline Sticker Chatroom</span>
            </div>
            <button
              onClick={clearChat}
              title="Clear Chat"
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-2.5 max-w-[85%]",
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm shrink-0">
                  {msg.avatar}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">{msg.name}</span>
                    <span>•</span>
                    <span>{msg.time}</span>
                  </div>
                  <div
                    className={cn(
                      !msg.sticker && "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                      !msg.sticker && (
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/40 text-foreground border border-border/30"
                      )
                    )}
                  >
                    {msg.text && <p>{msg.text}</p>}
                    {msg.sticker && (
                      <img
                        src={msg.sticker.url}
                        alt={msg.sticker.name}
                        title={msg.sticker.name}
                        className="h-24 w-24 object-contain hover:scale-110 transition-transform duration-200 select-none pointer-events-none"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Control input bar */}
          <div className="p-3.5 border-t border-border/60 bg-card flex items-center gap-2 relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setActivePicker(activePicker === "standard" ? "none" : "standard")}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-200 border",
                  activePicker === "standard"
                    ? "bg-primary/10 border-primary/30 text-primary scale-105"
                    : "bg-muted/30 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
                title="Open Sticker Picker"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Inline Float Picker */}
              {activePicker === "standard" && (
                <div className="absolute bottom-14 left-0 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setActivePicker("none")}
                  />
                  <StickerPicker
                    onStickerSelect={handleStickerSelect}
                    className="w-80 shadow-2xl border border-border/80 bg-popover"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-muted/20 text-muted-foreground text-sm select-none">
              Click the smile icon to select a sticker...
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const code = `import React from "react";
import { StickerPicker } from "@underverse-ui/underverse";

export default function MyChatComponent() {
  const handleSelect = (sticker) => {
    console.log("Selected sticker:", sticker);
    // returns: { id: "love", name: "Love", packId: "cute_cat", url: "/stickers/cute_cat/love.png" }
  };

  return (
    <div className="relative">
      <StickerPicker 
        onStickerSelect={handleSelect}
        columns={4}
        maxHeight="20rem"
      />
    </div>
  );
}`;

  const rows: PropsRow[] = [
    {
      property: "onStickerSelect",
      type: "(sticker: { id: string; name: string; packId: string; url: string }) => void",
      default: "Required",
      description: "Callback fired when a sticker is clicked/selected.",
    },
    {
      property: "className",
      type: "string",
      default: "-",
      description: "Optional custom classes to style the container element.",
    },
    {
      property: "searchPlaceholder",
      type: "string",
      default: "Localized value",
      description: "Placeholder text for the search input box.",
    },
    {
      property: "emptyText",
      type: "string",
      default: "Localized value",
      description: "Main error text shown when search returns zero matches.",
    },
    {
      property: "emptyHint",
      type: "string",
      default: "Localized value",
      description: "Hint subtitle text shown when search returns zero matches.",
    },
    {
      property: "showSearch",
      type: "boolean",
      default: "true",
      description: "Whether to display the search box inside the header.",
    },
    {
      property: "showPackNav",
      type: "boolean",
      default: "true",
      description: "Whether to render the bottom pack navigation tabs.",
    },
    {
      property: "columns",
      type: "number",
      default: "4",
      description: "Number of grid columns to display stickers in.",
    },
    {
      property: "maxHeight",
      type: "string",
      default: '"20rem"',
      description: "Maximum height for the scrollable list container.",
    },
  ];

  const order = [
    "onStickerSelect",
    "className",
    "searchPlaceholder",
    "emptyText",
    "emptyHint",
    "showSearch",
    "showPackNav",
    "columns",
    "maxHeight",
  ];

  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="StickerPicker.md" />;

  return (
    <Tabs
      id="sticker-picker-tabs"
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
