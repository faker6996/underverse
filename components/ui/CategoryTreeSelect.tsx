"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
}

interface CategoryTreeSelectProps {
  categories: Category[];
  value: number[];
  onChange: (selectedIds: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CategoryTreeSelect({ categories, value, onChange, placeholder = "Chọn danh mục", disabled }: CategoryTreeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // Build tree structure
  const parentCategories = categories.filter((c) => !c.parent_id);
  const childrenMap = new Map<number, Category[]>();

  categories.forEach((cat) => {
    if (cat.parent_id) {
      if (!childrenMap.has(cat.parent_id)) {
        childrenMap.set(cat.parent_id, []);
      }
      childrenMap.get(cat.parent_id)!.push(cat);
    }
  });

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const handleSelect = (categoryId: number, category: Category) => {
    const newSelected = new Set(value);

    if (newSelected.has(categoryId)) {
      // Unselect
      newSelected.delete(categoryId);

      // Also unselect children if it's a parent
      const children = childrenMap.get(categoryId) || [];
      children.forEach((child) => newSelected.delete(child.id));
    } else {
      // Select
      newSelected.add(categoryId);

      // Also select parent if this is a child
      if (category.parent_id) {
        newSelected.add(category.parent_id);
      }
    }

    onChange(Array.from(newSelected));
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const children = childrenMap.get(category.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(category.id);
    const isSelected = value.includes(category.id);

    return (
      <div key={category.id}>
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md transition-colors",
            "hover:bg-accent",
            isSelected && "bg-primary/10 border-l-2 border-primary"
          )}
          style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(category.id);
              }}
              className="p-0.5 hover:bg-accent rounded"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <span className="w-5" />
          )}

          <div
            onClick={() => handleSelect(category.id, category)}
            className="flex items-center gap-2 flex-1"
          >
            <div
              className={cn(
                "w-4 h-4 border-2 rounded flex items-center justify-center transition-colors",
                isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
              )}
            >
              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>

            <span className={cn("text-sm", isSelected && "font-medium text-primary")}>{category.name}</span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const selectedCount = value.length;
  const displayText = selectedCount > 0 ? `Đã chọn ${selectedCount} danh mục` : placeholder;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 border rounded-md bg-background",
          "hover:border-primary transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "border-primary ring-1 ring-primary"
        )}
      >
        <span className={cn("text-sm", selectedCount === 0 && "text-muted-foreground")}>{displayText}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "transform rotate-180")} />
      </button>

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full max-h-80 overflow-auto bg-background border rounded-md shadow-lg">
            <div className="p-1">
              {parentCategories.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">Không có danh mục nào</div>
              ) : (
                parentCategories.map((cat) => renderCategory(cat))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
