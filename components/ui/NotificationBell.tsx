"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { NotificationBadge } from "@/components/ui/Badge";
import { Bell, Check, CheckCheck, Trash2, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { io, Socket } from "socket.io-client";
import { callApi } from "@/lib/utils/api-client";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { NotificationModal } from "@/components/ui/NotificationModal";
import { Tabs } from "@/components/ui/Tab";

interface NotificationItem {
  id: number;
  title?: string;
  body?: string;
  type?: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

interface NotificationBellProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
}

export function NotificationBell({ 
  className, 
  size = "sm",
  showBadge = true 
}: NotificationBellProps) {
  const { user } = useAuth();
  const t = useTranslations('Common');
  const { addToast } = useToast();
  
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number, width: number} | null>(null);
  
  const triggerRef = useRef<HTMLButtonElement>(null);
  const unreadItems = useMemo(() => items.filter((item) => !item.is_read), [items]);

  // Calculate dropdown position
  const calculatePosition = () => {
    if (!triggerRef.current) return null;
    
    const trigger = triggerRef.current;
    const rect = trigger.getBoundingClientRect();
    const dropdownWidth = 320; // Fixed width for dropdown
    
    return {
      top: rect.bottom + 8, // 8px gap below trigger
      left: Math.max(16, Math.min(rect.left, window.innerWidth - dropdownWidth - 16)), // Keep within viewport
      width: dropdownWidth
    };
  };

  const renderTabPanel = (
    list: NotificationItem[],
    showLoadMore: boolean,
    showActions: boolean = true
  ) => (
    <div className="flex flex-col gap-2">
      <div className="max-h-80 overflow-y-auto">
        {list.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('noNotifications')}</p>
          </div>
        ) : (
          list.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={cn(
                "px-3 py-3 border-b border-border/40 hover:bg-accent/50 transition-colors rounded-md mb-1 cursor-pointer",
                !item.is_read && "bg-accent/20"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                    !item.is_read ? "bg-primary" : "bg-border"
                  )}
                />

                <div className="flex-1 min-w-0">
                  {item.title && (
                    <h4 className="text-sm font-medium text-foreground line-clamp-1 mb-1">
                      {item.title}
                    </h4>
                  )}
                  {item.body && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.body}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatTime(item.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {item.metadata?.link && (
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  )}
                  {!item.is_read && (
                    <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showActions && list.length > 0 && (
        <div className="border-t border-border/60 pt-2 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs h-auto py-2"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="w-3 h-3 mr-1" />
            {t('markAll')}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs h-auto py-2"
            onClick={clearAll}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            {t('clear')}
          </Button>

          {showLoadMore && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs h-auto py-2"
              onClick={loadMore}
              disabled={loading}
            >
              {t('loadMore')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
  // Load notifications
  const loadNotifications = useCallback(async (pageNum: number = 1) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: '10'
      });

      const response = await callApi<{
        data: NotificationItem[];
        total: number;
        unread: number;
        page: number;
        pageSize: number;
      }>(`${API_ROUTES.NOTIFICATIONS.LIST}?${queryParams}`, HTTP_METHOD_ENUM.GET);

      const notifications = response?.data || [];

      if (pageNum === 1) {
        setItems(notifications);
      } else {
        setItems(prev => [...prev, ...notifications]);
      }

      setUnreadCount(response?.unread || 0);

      const total = response?.total || 0;
      const pageSize = response?.pageSize || 10;
      const totalPages = Math.ceil(total / pageSize);
      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await callApi(
        API_ROUTES.NOTIFICATIONS.UPDATE,
        HTTP_METHOD_ENUM.PATCH,
        { action: 'mark_all_read' }
      );
      
      setUnreadCount(0);
      setItems(prev => prev.map(item => ({ ...item, is_read: true })));
      addToast({ type: 'success', message: t('markAllRead') });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      addToast({ type: 'error', message: 'Failed to mark notifications as read' });
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    if (!user?.id) return;
    
    try {
      await callApi(
        API_ROUTES.NOTIFICATIONS.UPDATE,
        HTTP_METHOD_ENUM.PATCH,
        { action: 'clear_all' }
      );
      
      setUnreadCount(0);
      setItems([]);
      addToast({ type: 'success', message: t('clearAll') });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      addToast({ type: 'error', message: 'Failed to clear notifications' });
    }
  };

  // Load more notifications
  const loadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(page + 1);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      // Update local state first for immediate UI feedback
      setItems(prev => 
        prev.map(item => 
          item.id === notificationId ? { ...item, is_read: true } : item
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Call API to persist the change
      await callApi(
        API_ROUTES.NOTIFICATIONS.UPDATE,
        HTTP_METHOD_ENUM.PATCH,
        { action: 'mark_single_read', id: notificationId }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert local state on error
      setItems(prev => 
        prev.map(item => 
          item.id === notificationId ? { ...item, is_read: false } : item
        )
      );
      setUnreadCount(prev => prev + 1);
      addToast({ type: 'error', message: 'Failed to mark notification as read' });
    }
  };

  // Handle notification click
  const handleNotificationClick = (item: NotificationItem) => {
    // Mark as read if not already read
    if (!item.is_read) {
      markAsRead(item.id);
    }

    // Check if notification has a link
    const link = item.metadata?.link;
    if (link) {
      // If has link, navigate to it
      window.open(link, '_blank');
    } else {
      // If no link, show modal
      setSelectedNotification(item);
      setShowModal(true);
    }
  };

  // Handle bell click: toggle and compute dropdown position; lazy-load items on first open
  const handleBellClick = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      const pos = calculatePosition();
      if (pos) setDropdownPosition(pos);
      if (items.length === 0) {
        loadNotifications(1);
      }
    } else {
      setDropdownPosition(null);
    }
  };

  // Format relative time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Initial load
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id, loadNotifications]);

  // Handle dropdown close on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      setIsOpen(false);
      setDropdownPosition(null);
    };

    const handleResize = () => {
      setIsOpen(false);
      setDropdownPosition(null);
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Setup Socket.IO for real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    // Use WebSocket URL from environment variables (matches .env.local config)
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';
    
    let socket: Socket;
    
    try {
      socket = io(wsUrl, { transports: ['websocket'] });
      
      socket.emit('join', `user:${user.id}`);
      
      socket.on('notification', (payload: any) => {
        const newNotification: NotificationItem = {
          id: Date.now(), // Temporary ID until real one comes from server
          title: payload.title,
          body: payload.body,
          type: payload.type || 'info',
          is_read: false,
          created_at: payload.created_at || new Date().toISOString(),
          metadata: payload.metadata
        };
        
        setItems(prev => [newNotification, ...prev].slice(0, 50)); // Keep only 50 most recent
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        addToast({ 
          type: 'info', 
          message: payload.title || t('newNotification'),
          duration: 5000 
        });
      });

      return () => {
        try {
          socket?.emit('leave', `user:${user.id}`);
          socket?.disconnect();
        } catch (error) {
          console.error('Error disconnecting socket:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up socket:', error);
    }
  }, [user?.id, addToast, t]);

  if (!user?.id) return null;

  return (
    <div className="relative">
      {showBadge ? (
        <NotificationBadge count={unreadCount} position="top-right">
          <Button 
            variant="ghost" 
            size="icon"
            ref={triggerRef}
            onClick={handleBellClick}
            aria-label={t('notifications')}
            title={t('notifications')}
            className={cn("bg-muted hover:bg-accent ring-1 ring-border rounded-full", className)}
          >
            <Bell className="h-5 w-5" />
          </Button>
        </NotificationBadge>
      ) : (
        <Button 
          variant="ghost" 
          size="icon"
          ref={triggerRef}
          onClick={handleBellClick}
          aria-label={t('notifications')}
          title={t('notifications')}
          className={cn("bg-muted hover:bg-accent ring-1 ring-border rounded-full", className)}
        >
          <Bell className="h-5 w-5" />
        </Button>
      )}

      {isOpen && (
        <>
          {/* Backdrop via portal to escape header stacking/transform */}
          {typeof window !== 'undefined' && createPortal(
            <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />, document.body
          )}

          {/* Dropdown via portal with absolute positioning */}
          {typeof window !== 'undefined' && dropdownPosition && createPortal(
            <div
              className="z-[9999] bg-card border border-border rounded-lg shadow-lg overflow-hidden"
              style={{ position: 'absolute', top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="p-2">
              {/* Header */}
              <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{t('notifications')}</span>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-5 h-5 p-0"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <Tabs
                tabs={[
                  {
                    label: t('notificationTabAll'),
                    value: 'all',
                    content: renderTabPanel(items, hasMore, items.length > 0),
                  },
                  {
                    label: t('notificationTabUnread'),
                    value: 'unread',
                    content: renderTabPanel(unreadItems, false, unreadItems.length > 0),
                  },
                ]}
                defaultValue="all"
                variant="underline"
                size="sm"
                className="px-1"
              />
              </div>
            </div>, document.body
          )}
        </>
      )}

      {/* Notification Modal */}
      <NotificationModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        notification={selectedNotification}
      />
    </div>
  );
}

export default NotificationBell;
