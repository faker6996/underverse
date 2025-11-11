"use client";

import * as React from "react";
import List from "@/components/ui/List";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";
import { Mail, User, ChevronRight, Settings, Bell, Trash2, Edit } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ListExample() {
  const t = useTranslations("DocsUnderverse");
  const [selected, setSelected] = React.useState<number | null>(1);

  const demo = (
    <div className="space-y-8">
      {/* Variants */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Variants</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Card</p>
            <List variant="card" inset divided>
              <List.Item leftIcon={User} label="Jane Cooper" description="Product Manager" />
              <List.Item leftIcon={Mail} label="jane@company.com" />
            </List>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Bordered</p>
            <List variant="bordered" divided>
              <List.Item leftIcon={Settings} label="Settings" />
              <List.Item leftIcon={Bell} label="Notifications" />
            </List>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Soft</p>
            <List variant="soft" inset divided>
              <List.Item label="Profile" description="View and edit your profile" />
              <List.Item label="Security" description="Manage your security settings" />
            </List>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Striped</p>
            <List variant="striped" inset>
              <List.Item label="Row 1" description="Striped row" />
              <List.Item label="Row 2" description="Striped row" />
              <List.Item label="Row 3" description="Striped row" />
            </List>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Sizes</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Extra Small</p>
            <List variant="bordered" size="xs" divided>
              <List.Item leftIcon={User} label="Compact item" />
              <List.Item leftIcon={Mail} label="Another item" />
            </List>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Large</p>
            <List variant="bordered" size="lg" divided>
              <List.Item leftIcon={User} label="Large item" description="With more spacing" />
            </List>
          </div>
        </div>
      </div>

      {/* With Avatars */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">With Avatars</p>
        <List variant="card" inset divided>
          <List.Item
            avatar="https://i.pravatar.cc/150?img=1"
            label="Eleanor Pena"
            description="Product Designer"
            badge="Online"
            badgeVariant="success"
          />
          <List.Item
            avatar="https://i.pravatar.cc/150?img=2"
            label="Cameron Williamson"
            description="Engineering Manager"
            badge="Away"
            badgeVariant="warning"
          />
          <List.Item
            avatar="https://i.pravatar.cc/150?img=3"
            label="Courtney Henry"
            description="Finance Director"
            badge="Offline"
            badgeVariant="default"
          />
        </List>
      </div>

      {/* With Actions */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">With Action Buttons</p>
        <List variant="bordered" inset divided>
          <List.Item
            leftIcon={User}
            label="User Profile"
            description="Manage your profile settings"
            action={
              <div className="flex gap-1">
                <Button size="sm" variant="ghost">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            }
          />
          <List.Item
            leftIcon={Settings}
            label="System Settings"
            description="Configure system preferences"
            action={
              <Button size="sm" variant="ghost">
                <Edit className="w-4 h-4" />
              </Button>
            }
          />
        </List>
      </div>

      {/* Collapsible Items */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Collapsible Items</p>
        <List variant="card" inset divided>
          <List.Item
            leftIcon={Settings}
            label="Account Settings"
            description="Manage your account preferences"
            collapsible
            expandContent={
              <div className="space-y-2">
                <div className="text-sm">Email: user@example.com</div>
                <div className="text-sm">Phone: +1 234 567 8900</div>
                <Button size="sm" variant="outline">
                  Edit Details
                </Button>
              </div>
            }
          />
          <List.Item
            leftIcon={Bell}
            label="Notification Settings"
            description="Configure notification preferences"
            collapsible
            expandContent={
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked />
                  Email notifications
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked />
                  Push notifications
                </label>
              </div>
            }
          />
        </List>
      </div>

      {/* Selectable List */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Selectable List</p>
        <List variant="outlined" inset divided>
          <List.Item
            as="button"
            onClick={() => setSelected(1)}
            selected={selected === 1}
            leftIcon={User}
            rightIcon={ChevronRight}
            label="Eleanor Pena"
            description="Marketing"
          />
          <List.Item
            as="button"
            onClick={() => setSelected(2)}
            selected={selected === 2}
            leftIcon={User}
            rightIcon={ChevronRight}
            label="Cameron Williamson"
            description="Engineering"
          />
          <List.Item
            as="button"
            onClick={() => setSelected(3)}
            selected={selected === 3}
            leftIcon={User}
            rightIcon={ChevronRight}
            label="Courtney Henry"
            description="Finance"
          />
        </List>
      </div>

      {/* Dense Mode */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Dense Mode</p>
        <List variant="bordered" dense divided>
          <List.Item label="Compact Item 1" description="Less padding" />
          <List.Item label="Compact Item 2" description="More items visible" />
          <List.Item label="Compact Item 3" description="Efficient use of space" />
          <List.Item label="Compact Item 4" description="Perfect for lists" />
        </List>
      </div>

      {/* Loading State */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Loading State</p>
        <List variant="card" inset loading loadingCount={4} />
      </div>

      {/* Empty State */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Empty State</p>
        <List variant="bordered" emptyText="No items found" />
      </div>
    </div>
  );

  const code =
    `import { List } from '@underverse-ui/underverse'\n\n` +
    `// Basic usage\n` +
    `<List divided>\n` +
    `  <List.Item leftIcon={User} label='Jane Cooper' description='Product Manager'/>\n` +
    `  <List.Item leftIcon={Mail} label='jane@company.com'/>\n` +
    `</List>\n\n` +
    `// With avatars and badges\n` +
    `<List variant='card' inset divided>\n` +
    `  <List.Item\n` +
    `    avatar='https://i.pravatar.cc/150?img=1'\n` +
    `    label='Eleanor Pena'\n` +
    `    description='Product Designer'\n` +
    `    badge='Online'\n` +
    `    badgeVariant='success'\n` +
    `  />\n` +
    `</List>\n\n` +
    `// Collapsible items\n` +
    `<List variant='card' inset>\n` +
    `  <List.Item\n` +
    `    label='Account Settings'\n` +
    `    collapsible\n` +
    `    expandContent={<div>Expanded content here</div>}\n` +
    `  />\n` +
    `</List>\n\n` +
    `// With actions\n` +
    `<List variant='bordered'>\n` +
    `  <List.Item\n` +
    `    label='Item'\n` +
    `    action={<Button size='sm'>Edit</Button>}\n` +
    `  />\n` +
    `</List>\n\n` +
    `// Loading state\n` +
    `<List loading loadingCount={5} />\n\n` +
    `// Empty state\n` +
    `<List emptyText='No items found' />`;

  const rows: PropsRow[] = [
    { property: "as", description: t("props.list.as"), type: "'ul' | 'ol' | 'div'", default: "'ul'" },
    { property: "ordered", description: t("props.list.ordered"), type: "boolean", default: "false" },
    { property: "variant", description: t("props.list.variant"), type: "'plain' | 'outlined' | 'soft' | 'bordered' | 'card' | 'flush' | 'striped'", default: "'plain'" },
    { property: "size", description: t("props.list.size"), type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'" },
    { property: "divided", description: t("props.list.divided"), type: "boolean", default: "false" },
    { property: "inset", description: t("props.list.inset"), type: "boolean", default: "false" },
    { property: "hoverable", description: t("props.list.hoverable"), type: "boolean", default: "true" },
    { property: "loading", description: "Show loading skeleton", type: "boolean", default: "false" },
    { property: "loadingCount", description: "Number of skeleton items", type: "number", default: "3" },
    { property: "emptyText", description: "Empty state text", type: "string", default: "-" },
    { property: "dense", description: "Compact mode with less padding", type: "boolean", default: "false" },
  ];
  const itemRows: PropsRow[] = [
    { property: "as", description: t("props.listItem.as"), type: "'li' | 'div' | 'a' | 'button'", default: "'li'" },
    { property: "selected", description: t("props.listItem.selected"), type: "boolean", default: "false" },
    { property: "disabled", description: t("props.listItem.disabled"), type: "boolean", default: "false" },
    { property: "href", description: t("props.listItem.href"), type: "string", default: "-" },
    { property: "label", description: t("props.listItem.label"), type: "ReactNode", default: "-" },
    { property: "description", description: t("props.listItem.description"), type: "ReactNode", default: "-" },
    { property: "leftIcon", description: t("props.listItem.leftIcon"), type: "React.ComponentType", default: "-" },
    { property: "rightIcon", description: t("props.listItem.rightIcon"), type: "React.ComponentType", default: "-" },
    { property: "avatar", description: "Avatar image URL or ReactNode", type: "string | ReactNode", default: "-" },
    { property: "badge", description: "Badge/tag content", type: "ReactNode", default: "-" },
    { property: "badgeVariant", description: "Badge color variant", type: "'default' | 'success' | 'warning' | 'error' | 'info'", default: "'default'" },
    { property: "action", description: "Action button(s) shown on hover", type: "ReactNode", default: "-" },
    { property: "collapsible", description: "Make item collapsible", type: "boolean", default: "false" },
    { property: "expanded", description: "Controlled expanded state", type: "boolean", default: "-" },
    { property: "onExpandChange", description: "Callback when expanded changes", type: "(expanded: boolean) => void", default: "-" },
    { property: "expandContent", description: "Content to show when expanded", type: "ReactNode", default: "-" },
  ];
  const docs = (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold mb-3">List Props</h3>
        <PropsDocsTable rows={rows} />
      </div>
      <div>
        <h3 className="text-base font-semibold mb-3">List.Item Props</h3>
        <PropsDocsTable rows={itemRows} />
      </div>
    </div>
  );

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
