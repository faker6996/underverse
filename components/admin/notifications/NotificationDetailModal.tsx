"use client";

import { useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { X } from "lucide-react";

type NotificationGroup = {
  key: string;
  title: string;
  body?: string;
  type?: string;
  created_at: string;
  count: number;
  userIds: number[];
  emailSent: number;
  emailTracked: number;
};

type User = {
  id: number;
  email: string;
  role?: string;
};

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationGroup | null;
  users: Record<number, User>;
}

export default function NotificationDetailModal({
  isOpen,
  onClose,
  notification,
  users
}: NotificationDetailModalProps) {
  const t = useTranslations('AdminNotifications');
  const tc = useTranslations('Common');

  if (!notification) return null;

  const getTypeVariant = (type?: string) => {
    const variants: Record<string, 'default' | 'success' | 'primary' | 'outline'> = {
      broadcast: 'default',
      targeted: 'success', 
      system: 'primary'
    };
    return variants[type || ''] || 'outline';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{notification.title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
          {notification.type && (
            <Badge variant={getTypeVariant(notification.type)} className="text-xs">
              {notification.type}
            </Badge>
          )}
          <span>{new Date(notification.created_at).toLocaleString()}</span>
          <span>•</span>
          <span>{notification.count} {tc('users')}</span>
        </div>

        {/* Message */}
        {notification.body && (
          <div className="mb-4 p-3 bg-muted/50 rounded text-sm">
            {notification.body}
          </div>
        )}

        {/* Recipients - simplified */}
        <div className="space-y-2">
          <div className="text-sm font-medium">{t('recipients')}</div>
          <div className="max-h-32 overflow-y-auto text-xs">
            {notification.userIds.length > 0 ? (
              <div className="space-y-1">
                {notification.userIds.slice(0, 10).map((userId) => {
                  const user = users[userId];
                  return (
                    <div key={userId} className="flex items-center justify-between py-1">
                      <span className="font-mono">
                        {user?.email || `User #${userId}`}
                      </span>
                      {user?.role && (
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      )}
                    </div>
                  );
                })}
                {notification.userIds.length > 10 && (
                  <div className="text-muted-foreground text-center py-1">
                    ... và {notification.userIds.length - 10} người khác
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-2">
                {t('noRecipients')}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}