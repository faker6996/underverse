"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";
import { Smile, Send, Trash2 } from "lucide-react";
import { cn } from "@/packages/underverse/src/utils/cn";
import { getEmojiUnifiedCode } from "@/packages/underverse/src/components/emoji-ui";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  name: string;
  avatar: string;
  text: string;
  time: string;
}

/**
 * Helper component that parses a text string and renders emojis as high-quality
 * Apple Glossy images using the jsDelivr CDN.
 */
export const EmojiText: React.FC<{ text: string }> = ({ text }) => {
  // A regex using unicode property escapes to capture emoji sequences precisely,
  // including variation selectors, skin tone modifiers, and zero-width joiners.
  const emojiRegex = /(\p{Extended_Pictographic}(?:\u{FE0F}|\p{Emoji_Modifier}|\p{Emoji_Component})*(?:\u{200D}\p{Extended_Pictographic}(?:\u{FE0F}|\p{Emoji_Modifier}|\p{Emoji_Component})*)*)/gu;
  const parts = text.split(emojiRegex);

  return (
    <>
      {parts.map((part, index) => {
        // If it matches the emoji pattern and is not empty.
        // We use a stateless regex test to avoid the global state lastIndex bug.
        if (part && /\p{Extended_Pictographic}/u.test(part)) {
          const unified = getEmojiUnifiedCode(part);
          return (
            <img
              key={index}
              src={`/emojis/${unified}.png`}
              alt={part}
              title={part}
              className="inline-block h-5.5 w-5.5 mx-0.5 align-middle object-contain hover:scale-120 transition-transform duration-200"
              loading="lazy"
            />
          );
        }
        return part;
      })}
    </>
  );
};

export default function EmojiPickerExample() {
  const t = useTranslations("DocsUnderverse");
  const [activePicker, setActivePicker] = React.useState<"none" | "standard">("none");
  const inputRef = React.useRef<HTMLDivElement>(null);
  const savedRangeRef = React.useRef<Range | null>(null);

  // Static list of messages to showcase initial state
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      name: "Underverse Bot",
      avatar: "✨",
      text: "Welcome! Tap the smile button below to open the upgraded Glossy Emoji Picker. Try typing or picking emojis like 😀, 🚀, or ❤️! Emojis inside the input box and chat messages look identical!",
      time: "10:30 AM",
    },
  ]);

  const handleSend = () => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    // Convert HTML content of contenteditable back to plain text with unicode characters
    const getRichTextValue = (el: HTMLElement): string => {
      let text = "";
      el.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          text += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          if (element.tagName === "IMG" && element.getAttribute("alt")) {
            text += element.getAttribute("alt");
          } else if (element.tagName === "BR") {
            text += "\n";
          } else {
            text += getRichTextValue(element);
          }
        }
      });
      return text;
    };

    const plainText = getRichTextValue(inputEl);
    if (!plainText.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      name: "You",
      avatar: "👤",
      text: plainText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    inputEl.innerHTML = "";
    savedRangeRef.current = null;
    setActivePicker("none");
  };

  const clearChat = () => {
    setChatMessages([
      {
        id: "1",
        sender: "bot",
        name: "Underverse Bot",
        avatar: "✨",
        text: "Chat cleared. Start sending new messages! 💬",
        time: "10:30 AM",
      },
    ]);
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (inputRef.current?.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  const convertUnicodeEmojisToImages = (el: HTMLElement) => {
    const emojiRegex = /(\p{Extended_Pictographic}(?:\u{FE0F}|\p{Emoji_Modifier}|\p{Emoji_Component})*(?:\u{200D}\p{Extended_Pictographic}(?:\u{FE0F}|\p{Emoji_Modifier}|\p{Emoji_Component})*)*)/gu;
    
    // Save current selection offset in terms of total text characters
    const sel = window.getSelection();
    let savedOffset = 0;
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (el.contains(range.startContainer)) {
        // Calculate offset from start of input
        const preRange = range.cloneRange();
        preRange.selectNodeContents(el);
        preRange.setEnd(range.startContainer, range.startOffset);
        savedOffset = preRange.toString().length;
      }
    }

    let hasChanged = false;

    const traverseAndReplace = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        if (/\p{Extended_Pictographic}/u.test(text)) {
          const parent = node.parentNode;
          if (!parent) return;

          const parts = text.split(emojiRegex);
          const frag = document.createDocumentFragment();

          parts.forEach((part) => {
            if (!part) return;
            if (/\p{Extended_Pictographic}/u.test(part)) {
              const unified = getEmojiUnifiedCode(part);
              const img = document.createElement("img");
              img.src = `/emojis/${unified}.png`;
              img.alt = part;
              img.className = "inline-block h-5.5 w-5.5 mx-0.5 align-middle object-contain";
              frag.appendChild(img);
              hasChanged = true;
            } else {
              frag.appendChild(document.createTextNode(part));
            }
          });

          parent.replaceChild(frag, node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName !== "IMG") {
          Array.from(element.childNodes).forEach(traverseAndReplace);
        }
      }
    };

    traverseAndReplace(el);

    if (hasChanged && sel) {
      try {
        // Restore selection based on character offset
        const newRange = document.createRange();
        let currentOffset = 0;
        let foundNode: Node | null = null;
        let foundOffset = 0;

        const findNodeAtOffset = (node: Node) => {
          if (foundNode) return;

          if (node.nodeType === Node.TEXT_NODE) {
            const len = node.textContent?.length || 0;
            if (currentOffset + len >= savedOffset) {
              foundNode = node;
              foundOffset = savedOffset - currentOffset;
            }
            currentOffset += len;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.tagName === "IMG") {
              // Image represents an emoji (usually length 1 or 2)
              const altText = element.getAttribute("alt") || "";
              const len = altText.length;
              if (currentOffset + len >= savedOffset) {
                foundNode = element.parentNode;
                foundOffset = Array.from(foundNode?.childNodes || []).indexOf(element) + 1;
              }
              currentOffset += len;
            } else {
              Array.from(node.childNodes).forEach(findNodeAtOffset);
            }
          }
        };

        findNodeAtOffset(el);

        if (foundNode) {
          newRange.setStart(foundNode, foundOffset);
          newRange.collapse(true);
        } else {
          newRange.selectNodeContents(el);
          newRange.collapse(false);
        }
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedRangeRef.current = newRange.cloneRange();
      } catch (err) {
        console.warn("Failed to restore caret:", err);
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const unified = getEmojiUnifiedCode(emoji);
    const imgHtml = `<img src="/emojis/${unified}.png" alt="${emoji}" class="inline-block h-5.5 w-5.5 mx-0.5 align-middle object-contain" />`;
    
    const inputEl = inputRef.current;
    if (!inputEl) return;

    inputEl.focus();

    const sel = window.getSelection();
    if (savedRangeRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }

    if (sel && sel.rangeCount > 0) {
      let range = sel.getRangeAt(0);
      
      // Ensure the selection is actually inside our contenteditable div
      if (!inputEl.contains(range.commonAncestorContainer)) {
        range = document.createRange();
        range.selectNodeContents(inputEl);
        range.collapse(false); // collapse to end
        sel.removeAllRanges();
        sel.addRange(range);
      }

      range.deleteContents();
      
      const tempEl = document.createElement("div");
      tempEl.innerHTML = imgHtml;
      const frag = document.createDocumentFragment();
      let node;
      let lastNode;
      while ((node = tempEl.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      
      if (lastNode) {
        const nextRange = range.cloneRange();
        nextRange.setStartAfter(lastNode);
        nextRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(nextRange);
        savedRangeRef.current = nextRange.cloneRange();
      }
    } else {
      inputEl.innerHTML += imgHtml;
      // Focus to the end
      const range = document.createRange();
      range.selectNodeContents(inputEl);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
      savedRangeRef.current = range.cloneRange();
    }
  };

  const demo = (
    <div className="space-y-8">
      {/* CSS style block for contenteditable placeholder */}
      <style dangerouslySetInnerHTML={{ __html: `
        .emoji-input-editable:empty:before {
          content: attr(placeholder);
          color: hsl(var(--muted-foreground));
          opacity: 0.6;
          pointer-events: none;
        }
      `}} />

      {/* Interactive Chat Playground Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground/90">Interactive Chat Workspace</p>
            <p className="text-xs text-muted-foreground">Standard emojis are automatically converted to Apple Glossy assets in both the input field and messages.</p>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Chat
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Mock Chat Window */}
          <div className="lg:col-span-7 border border-border/80 rounded-2xl bg-card overflow-hidden shadow-lg flex flex-col h-112">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/50 bg-muted/20 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-foreground/90">Live Workspace Channel</span>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 max-w-[85%] animate-fade-in",
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm shrink-0">
                    {msg.avatar}
                  </div>
                  <div className="space-y-1">
                    <div className={cn("flex items-center gap-2", msg.sender === "user" ? "justify-end" : "")}>
                      <span className="text-xs font-bold text-foreground/80">{msg.name}</span>
                      <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm shadow-sm space-y-2",
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted/55 text-foreground rounded-tl-none border border-border/30"
                      )}
                    >
                      {msg.text && (
                        <p className="leading-relaxed wrap-break-word">
                          <EmojiText text={msg.text} />
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Panel */}
            <div className="p-3 border-t border-border/50 bg-background/50 space-y-2.5">
              {/* Action and Input row */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setActivePicker((prev) => (prev === "standard" ? "none" : "standard"))
                    }
                    className={cn(
                      "p-2 rounded-xl transition-all duration-200 border",
                      activePicker === "standard"
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "hover:bg-muted border-transparent text-muted-foreground"
                    )}
                    title="Open Emoji Picker"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>

                {/* ContentEditable Glossy Emoji Input */}
                <div
                  ref={inputRef}
                  contentEditable
                  onInput={(e) => {
                    saveSelection();
                    const el = e.currentTarget;
                    if (/\p{Extended_Pictographic}/u.test(el.innerText)) {
                      convertUnicodeEmojisToImages(el);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  onMouseUp={saveSelection}
                  onKeyUp={saveSelection}
                  {...{ placeholder: "Type a message or select an emoji..." }}
                  className="emoji-input-editable flex-1 px-4 py-2 min-h-[38px] max-h-24 overflow-y-auto rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm cursor-text leading-relaxed select-text outline-none"
                />

                <button
                  onClick={handleSend}
                  className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/10 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Picker Container */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            {activePicker === "none" && (
              <div className="w-80 h-112 border border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-muted/5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Smile className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-foreground/90">No Picker Opened</p>
                <p className="text-xs text-muted-foreground max-w-50 mt-1">
                  Click the smile icon in the chat box to activate the beautiful Glossy Emoji Picker.
                </p>
              </div>
            )}

            {activePicker === "standard" && (
              <div className="animate-fade-in space-y-2">
                <p className="text-xs font-bold text-primary uppercase tracking-wider pl-1">Apple Glossy Emoji Picker</p>
                <EmojiPicker
                  onEmojiSelect={handleEmojiSelect}
                  columns={8}
                  maxHeight="22rem"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-side Showcase (Custom Configurations section) */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Emoji Picker Custom Configurations</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Standard Style Standalone</p>
            <div className="flex justify-center border border-border/50 p-4 rounded-2xl bg-muted/5">
              <EmojiPicker
                onEmojiSelect={(emoji) => console.log("Selected:", emoji)}
                columns={8}
                maxHeight="16rem"
              />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Compact Mode (No Search or Categories)</p>
            <div className="flex justify-center border border-border/50 p-4 rounded-2xl bg-muted/5">
              <EmojiPicker
                onEmojiSelect={(emoji) => console.log("Selected:", emoji)}
                showSearch={false}
                showCategoryNav={false}
                columns={6}
                maxHeight="16rem"
                className="w-72"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const code = `import { EmojiPicker } from '@underverse-ui/underverse'

// 1. Basic Usage
<EmojiPicker 
  onEmojiSelect={(emoji) => {
    console.log("Selected Emoji:", emoji); // Returns standard Unicode character
  }} 
/>

// 2. Custom Layout Configuration
<EmojiPicker
  onEmojiSelect={(emoji) => handleSelect(emoji)}
  searchPlaceholder="Search emojis..."
  columns={8}
  maxHeight="20rem"
  className="w-96"
/>

// 3. Compact Mode (No Search, No Category Bottom Bar)
<EmojiPicker
  onEmojiSelect={(emoji) => handleSelect(emoji)}
  showSearch={false}
  showCategoryNav={false}
  columns={6}
  maxHeight="15rem"
/>`;

  const rows: PropsRow[] = [
    {
      property: "onEmojiSelect",
      description: "Callback triggered when an emoji is clicked. Returns the selected standard Unicode character.",
      type: "(emoji: string) => void",
      default: "Required",
    },
    {
      property: "className",
      description: "Additional CSS classes for container wrapper",
      type: "string",
      default: "-",
    },
    {
      property: "searchPlaceholder",
      description: "Placeholder text for search input field",
      type: "string",
      default: "Localized by current locale",
    },
    {
      property: "emptyText",
      description: "Header text shown when no emojis match filter",
      type: "string",
      default: "Localized by current locale",
    },
    {
      property: "emptyHint",
      description: "Helper text shown under the empty state title",
      type: "string",
      default: "Localized by current locale",
    },
    {
      property: "showSearch",
      description: "Toggle visibility of top search bar",
      type: "boolean",
      default: "true",
    },
    {
      property: "showCategoryNav",
      description: "Toggle visibility of bottom navigation bar",
      type: "boolean",
      default: "true",
    },
    {
      property: "columns",
      description: "Number of columns in the grid view",
      type: "number",
      default: "9",
    },
    {
      property: "maxHeight",
      description: "Maximum height of scrolling area",
      type: "string",
      default: '"20rem"',
    },
  ];

  const order = [
    "onEmojiSelect",
    "className",
    "searchPlaceholder",
    "emptyText",
    "emptyHint",
    "showSearch",
    "showCategoryNav",
    "columns",
    "maxHeight",
  ];

  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="EmojiPicker.md" />;

  return (
    <Tabs
      id="emoji-picker-tabs"
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
