"use client";

import { ExternalLink } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";

interface NotificationItem {
  id: number;
  title?: string;
  body?: string;
  type?: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationItem | null;
  titleText?: string;
  openLinkText?: string;
  closeText?: string;
}

export function NotificationModal({ isOpen, onClose, notification, titleText, openLinkText, closeText }: NotificationModalProps) {
  const t = useTranslations('Common');
  
  if (!notification) return null;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasLink = notification.metadata?.link;

  const handleLinkClick = () => {
    if (hasLink) {
      window.open(notification.metadata.link, '_blank');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titleText || t('notifications')}
      size="md"
    >
      <div className="space-y-4">
        {/* Status indicator */}
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <div className={cn(
            "w-2 h-2 rounded-full",
            !notification.is_read ? "bg-primary" : "bg-border"
          )} />
          <span className="text-xs text-muted-foreground">
            {!notification.is_read ? t('newNotification') : t('readStatus')}
          </span>
        </div>

        {notification.title && (
          <h3 className="text-lg font-semibold text-foreground">
            {notification.title}
          </h3>
        )}
        
        {notification.body && (
          <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {notification.body}
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t border-border pt-2">
          {formatTime(notification.created_at)}
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-2">
          {hasLink && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleLinkClick}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {openLinkText || t('openLink')}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            {closeText || t('close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default NotificationModal;
