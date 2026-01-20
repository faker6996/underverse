"use client";

import React, { forwardRef, useState, useRef, useId } from "react";
import { cn } from "@/lib/utils/cn";
import { X, Search, Loader2 } from "lucide-react";
import Button from "./Button";

export interface TagInputProps {
  /** Danh sách tags hiện tại */
  value: string[];

  /** Callback khi danh sách tags thay đổi */
  onChange: (tags: string[]) => void;

  /** Callback khi user muốn tìm kiếm (Ctrl+Enter hoặc click Search) */
  onSearch: (tags: string[]) => void;

  /** Callback when all tags are cleared */
  onClear?: () => void;

  /** Placeholder khi chưa có tags */
  placeholder?: string;

  /** Placeholder khi đã có tags */
  placeholderWithTags?: string;

  /** Label hiển thị phía trên input */
  label?: string;

  /** Ẩn nút Search */
  hideSearchButton?: boolean;

  /** Ẩn nút Clear All */
  hideClearButton?: boolean;

  /** Custom class cho container */
  className?: string;

  /** Size: 'sm' | 'md' | 'lg' */
  size?: "sm" | "md" | "lg";

  /** Disabled state */
  disabled?: boolean;

  /** Loading state - hiển thị spinner trên nút Search */
  loading?: boolean;

  /** Maximum number of tags allowed */
  maxTags?: number;

  /** i18n labels - no external dependency required */
  labels?: {
    search?: string;
    clearAll?: string;
    placeholder?: string;
    placeholderWithTags?: string;
    moreCount?: string; // e.g. "+{count} more" - use {count} as placeholder
  };

  /** Maximum visible tags before showing "+N more" badge */
  maxVisibleTags?: number;
}

const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      value = [],
      onChange,
      onSearch,
      onClear,
      placeholder,
      placeholderWithTags,
      label,
      hideSearchButton = false,
      hideClearButton = false,
      className,
      size = "md",
      disabled = false,
      loading = false,
      maxTags,
      maxVisibleTags,
      labels,
    },
    ref,
  ) => {
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const autoId = useId();
    const inputId = `tag-input-${autoId}`;

    // Use props > labels > defaults (no external i18n dependency)
    const defaultPlaceholder = placeholder ?? labels?.placeholder ?? "Enter value and press Enter...";
    const defaultPlaceholderWithTags = placeholderWithTags ?? labels?.placeholderWithTags ?? "Ctrl+Enter to search";
    const searchLabel = labels?.search ?? "Search";
    const clearAllLabel = labels?.clearAll ?? "Clear all";

    // Check if max tags reached
    const isMaxReached = maxTags !== undefined && value.length >= maxTags;

    // Calculate visible tags and hidden count
    const [isExpanded, setIsExpanded] = useState(false);
    const hiddenCount = maxVisibleTags !== undefined && !isExpanded ? Math.max(0, value.length - maxVisibleTags) : 0;
    const visibleTags = hiddenCount > 0 ? value.slice(0, maxVisibleTags) : value;
    const moreLabel = labels?.moreCount?.replace("{count}", String(hiddenCount)) ?? `+${hiddenCount} more`;

    // Size styles
    const sizeStyles = {
      sm: {
        container: "min-h-8 p-1.5 gap-1 rounded-lg",
        input: "text-xs",
        tag: "px-1.5 py-0.5 text-xs gap-1 rounded-md",
        tagIcon: "h-3 w-3",
        button: "h-7 text-xs px-2",
      },
      md: {
        container: "min-h-10 p-2 gap-1.5 rounded-2xl",
        input: "text-sm",
        tag: "px-2 py-1 text-sm gap-1.5 rounded-lg",
        tagIcon: "h-3.5 w-3.5",
        button: "h-8 text-sm px-3",
      },
      lg: {
        container: "min-h-12 p-2.5 gap-2 rounded-2xl",
        input: "text-base",
        tag: "px-2.5 py-1.5 text-base gap-2 rounded-lg",
        tagIcon: "h-4 w-4",
        button: "h-9 text-base px-4",
      },
    };

    const addTag = (tagValue: string) => {
      const trimmed = tagValue.trim();
      if (!trimmed) return false;

      // Check for duplicates
      if (value.includes(trimmed)) return false;

      // Check max tags limit
      if (isMaxReached) return false;

      onChange([...value, trimmed]);
      setInputValue("");
      return true;
    };

    const removeTag = (index: number) => {
      const newTags = value.filter((_, i) => i !== index);
      onChange(newTags);
    };

    const clearAll = () => {
      onChange([]);
      setInputValue("");
      onClear?.();
      inputRef.current?.focus();
    };

    const triggerSearch = () => {
      // Add current input if exists before searching
      const trimmed = inputValue.trim();
      let finalTags = [...value];
      if (trimmed && !value.includes(trimmed) && !isMaxReached) {
        finalTags = [...value, trimmed];
        onChange(finalTags);
        setInputValue("");
      }
      onSearch(finalTags);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();

        // Check for Ctrl+Enter or Cmd+Enter for search
        if (e.ctrlKey || e.metaKey) {
          triggerSearch();
          return; // Exit early to prevent other actions
        }

        // Check for Shift+Enter for batch adding tags
        if (e.shiftKey) {
          const tagsToAdd = inputValue
            .split(/\s+/) // Split by one or more whitespace
            .map((t) => t.trim())
            .filter((t) => t.length > 0 && !value.includes(t)); // Remove empty or duplicate

          if (tagsToAdd.length > 0) {
            // Check max tags limit
            const availableSlots = maxTags !== undefined ? maxTags - value.length : Infinity;

            if (availableSlots > 0) {
              const tagsToInsert = tagsToAdd.slice(0, availableSlots);
              onChange([...value, ...tagsToInsert]);
              setInputValue("");
            }
          }
          return;
        }

        // Default behavior: just add single tag
        addTag(inputValue);
      } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
        // Remove last tag when backspace on empty input
        removeTag(value.length - 1);
      }
    };

    const handleContainerClick = () => {
      inputRef.current?.focus();
    };

    const currentPlaceholder = value.length > 0 ? defaultPlaceholderWithTags : defaultPlaceholder;

    return (
      <div className={cn("w-full space-y-2", className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block font-medium transition-colors duration-200",
              size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm",
              disabled ? "text-muted-foreground" : isFocused ? "text-primary" : "text-foreground",
            )}
          >
            {label}
            {maxTags !== undefined && (
              <span className="ml-2 text-muted-foreground font-normal">
                ({value.length}/{maxTags})
              </span>
            )}
          </label>
        )}

        {/* Input Container with Tags */}
        <div
          onClick={handleContainerClick}
          className={cn(
            "flex flex-wrap items-center cursor-text",
            "bg-background border border-input",
            "transition-all duration-200",
            "hover:border-accent-foreground/20",
            isFocused && "ring-1 ring-ring ring-offset-1 ring-offset-background border-transparent shadow-md",
            disabled && "opacity-50 cursor-not-allowed",
            sizeStyles[size].container,
          )}
        >
          {/* Tags */}
          {visibleTags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className={cn(
                "inline-flex items-center",
                "bg-primary/10 text-primary font-mono",
                "animate-in fade-in-0 zoom-in-95 duration-200",
                sizeStyles[size].tag,
              )}
            >
              <span className="truncate max-w-50">{tag}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                disabled={disabled}
                className={cn(
                  "flex items-center justify-center rounded-md",
                  "text-primary/70 hover:text-primary hover:bg-primary/20",
                  "transition-colors duration-150",
                  "focus:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                  "disabled:pointer-events-none",
                )}
                aria-label={`Remove ${tag}`}
              >
                <X className={sizeStyles[size].tagIcon} />
              </button>
            </span>
          ))}

          {/* +N more badge */}
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
              className={cn(
                "inline-flex items-center cursor-pointer",
                "bg-muted text-muted-foreground hover:bg-muted/80",
                "transition-colors duration-150",
                "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                sizeStyles[size].tag,
              )}
              title={value.slice(maxVisibleTags).join(", ")}
            >
              {moreLabel}
            </button>
          )}

          {/* Collapse button when expanded */}
          {isExpanded && maxVisibleTags !== undefined && value.length > maxVisibleTags && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className={cn(
                "inline-flex items-center cursor-pointer",
                "bg-muted/50 text-muted-foreground hover:bg-muted/80",
                "transition-colors duration-150",
                "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                sizeStyles[size].tag,
              )}
            >
              Show less
            </button>
          )}

          {/* Input */}
          <input
            ref={(node) => {
              // Handle both refs
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            id={inputId}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isMaxReached ? `Max ${maxTags} tags` : currentPlaceholder}
            disabled={disabled || isMaxReached}
            className={cn(
              "flex-1 min-w-30 bg-transparent outline-none",
              "placeholder:text-muted-foreground",
              "disabled:cursor-not-allowed",
              sizeStyles[size].input,
            )}
            aria-label={label || "Tag input"}
          />
        </div>

        {/* Action Buttons */}
        {(!hideSearchButton || !hideClearButton) && (
          <div className="flex items-center gap-2">
            {!hideSearchButton && (
              <Button
                type="button"
                variant="default"
                size={size === "lg" ? "md" : size}
                onClick={triggerSearch}
                disabled={disabled || loading}
                className={sizeStyles[size].button}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Search className="h-4 w-4 mr-1.5" />}
                {searchLabel}
              </Button>
            )}

            {!hideClearButton && value.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size={size === "lg" ? "md" : size}
                onClick={clearAll}
                disabled={disabled}
                className={cn(sizeStyles[size].button, "text-muted-foreground hover:text-foreground")}
              >
                {clearAllLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  },
);

TagInput.displayName = "TagInput";

export { TagInput };
export default TagInput;
// CI Trigger Test
