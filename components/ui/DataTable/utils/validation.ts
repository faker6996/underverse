import type { DataTableColumn } from "../types";
import { getHeaderDepth, getColSpan, isLeafColumn } from "./headers";

/**
 * Validate column structure and return warnings.
 * Only runs in development mode to avoid performance impact in production.
 *
 * @param columns - Column definitions to validate
 * @returns Array of warning messages (empty if no issues)
 */
export function validateColumns<T>(columns: DataTableColumn<T>[]): string[] {
  const warnings: string[] = [];
  const keys = new Set<string>();

  function validate(cols: DataTableColumn<T>[], path = "") {
    for (const col of cols) {
      const fullPath = path ? `${path}.${col.key}` : col.key;

      // Check duplicate keys
      if (keys.has(col.key)) {
        warnings.push(`Duplicate key "${col.key}" at ${fullPath}`);
      }
      keys.add(col.key);

      const isGroup = col.children && col.children.length > 0;

      // Group columns shouldn't have leaf properties
      if (isGroup) {
        if (col.dataIndex) {
          warnings.push(`Group column "${fullPath}" has dataIndex (will be ignored)`);
        }
        if (col.sortable) {
          warnings.push(`Group column "${fullPath}" has sortable (will be ignored)`);
        }
        if (col.filter) {
          warnings.push(`Group column "${fullPath}" has filter (will be ignored)`);
        }
        if (col.render) {
          warnings.push(`Group column "${fullPath}" has render function (will be ignored)`);
        }

        // Check explicit colspan matches structure
        if (col.colSpan !== undefined) {
          const actualColSpan = getColSpan(col);
          if (col.colSpan !== actualColSpan) {
            warnings.push(
              `Column "${fullPath}" has colSpan=${col.colSpan} but structure suggests ${actualColSpan} (based on ${col.children!.length} children)`,
            );
          }
        }

        // Check sticky inheritance conflicts
        if (col.fixed) {
          const conflictingChildren = col.children!.filter((c) => c.fixed && c.fixed !== col.fixed);
          if (conflictingChildren.length > 0) {
            warnings.push(
              `Group column "${fullPath}" has fixed="${col.fixed}" but children have different fixed values: ${conflictingChildren.map((c) => c.key).join(", ")}`,
            );
          }
        }

        // Recursively validate children
        validate(col.children!, fullPath);
      } else {
        // Leaf columns shouldn't have children array (even if empty)
        if (col.children !== undefined) {
          warnings.push(`Leaf column "${fullPath}" has children property (should be omitted for leaf columns)`);
        }
      }
    }
  }

  validate(columns);

  // Warn about deep nesting (UX concern)
  const depth = getHeaderDepth(columns);
  if (depth > 4) {
    warnings.push(`Header depth is ${depth} rows. Consider simplifying - too many header rows may impact user experience.`);
  }

  // Warn about mixed sticky in groups (can cause visual issues)
  function checkMixedSticky(cols: DataTableColumn<T>[], parentPath = "") {
    for (const col of cols) {
      if (col.children && col.children.length > 0) {
        const childrenFixed = col.children.map((c) => c.fixed);
        const hasStickyChild = childrenFixed.some((f) => f !== undefined);
        const hasNonStickyChild = childrenFixed.some((f) => f === undefined);

        if (hasStickyChild && hasNonStickyChild) {
          const fullPath = parentPath ? `${parentPath}.${col.key}` : col.key;
          warnings.push(
            `Group column "${fullPath}" has mixed sticky children (some fixed, some not). This may cause visual separation when scrolling.`,
          );
        }

        checkMixedSticky(col.children, parentPath ? `${parentPath}.${col.key}` : col.key);
      }
    }
  }

  checkMixedSticky(columns);

  return warnings;
}
