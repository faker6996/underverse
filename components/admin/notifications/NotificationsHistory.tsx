"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { DataTable, DataTableColumn, DataTableQuery } from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import NotificationDetailModal from "./NotificationDetailModal";
import { Eye } from "lucide-react";
import { callApi } from "@/lib/utils/api-client";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";

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

type NotificationRecord = {
  id: number;
  title: string;
  body?: string;
  type?: string;
  user_id: number;
  created_at: string;
  metadata?: any;
};

interface NotificationsHistoryProps {
  refreshTrigger?: number;
}

export default function NotificationsHistory({ refreshTrigger }: NotificationsHistoryProps) {
  const t = useTranslations('AdminNotifications');
  const tc = useTranslations('Common');
  
  const [data, setData] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [allUsers, setAllUsers] = useState<Array<{ id: number; email: string; role?: string }>>([]);
  const [selectedNotification, setSelectedNotification] = useState<NotificationGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState<DataTableQuery>({
    filters: {},
    page: 1,
    pageSize: 10,
    sort: { key: 'created_at', order: 'desc' }
  });

  // Load users for display
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const payload = await callApi<any>(
          API_ROUTES.USERS.LIST,
          HTTP_METHOD_ENUM.GET,
          { page: 1, pageSize: 1000 },
          { silent: true }
        );
        // Handle different API response formats from backend
        let rawData = payload;
        if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
          // If data is an object with nested data array (like pagination response)
          rawData = rawData.data || rawData.users || [];
        }
        
        const rows: any[] = Array.isArray(rawData) ? rawData : [];
        const users = rows
          .filter(u => !!u?.email && Number.isFinite(Number(u?.id)))
          .map(u => ({ id: Number(u.id), email: String(u.email), role: u.role }));
        setAllUsers(users);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

  const idToUser = useMemo(() => {
    const m: Record<number, { id: number; email: string; role?: string }> = {};
    for (const u of allUsers) m[u.id] = u;
    return m;
  }, [allUsers]);

  const loadNotifications = useCallback(async (newQuery = query) => {
    setLoading(true);
    try {
      const queryParams: any = {
        page: newQuery.page,
        pageSize: newQuery.pageSize * 10,
      };
      if (newQuery.sort) {
        queryParams.sortBy = newQuery.sort.key;
        queryParams.sortOrder = newQuery.sort.order;
      }
      const payload = await callApi<any>(
        API_ROUTES.NOTIFICATIONS.SENT,
        HTTP_METHOD_ENUM.GET,
        queryParams,
        { silent: true }
      );
      const notifications: NotificationRecord[] = payload?.data || [];

      // Group notifications
      const grouped = groupNotifications(notifications);

      // Apply pagination to grouped results
      const startIndex = (newQuery.page - 1) * newQuery.pageSize;
      const paginatedGroups = grouped.slice(startIndex, startIndex + newQuery.pageSize);

      setData(paginatedGroups);
      setTotal(grouped.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const groupNotifications = (notifications: NotificationRecord[]): NotificationGroup[] => {
    const map = new Map<string, NotificationGroup>();
    const bucketMs = 5000; // 5s window for grouping

    for (const n of notifications) {
      const meta = n?.metadata || {};
      let key = meta?.batch_id;
      
      if (!key) {
        const ts = new Date(n.created_at).getTime();
        const bucket = Math.floor(ts / bucketMs);
        key = `legacy:${n.title || ''}|${n.body || ''}|${bucket}`;
      }

      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        if (meta?.email_sent === true) existing.emailSent += 1;
        if (typeof meta?.email_sent !== 'undefined') existing.emailTracked += 1;
        
        if (new Date(n.created_at) < new Date(existing.created_at)) {
          existing.created_at = n.created_at;
        }
        
        if (Number.isFinite(Number(n.user_id))) {
          const uid = Number(n.user_id);
          if (!existing.userIds.includes(uid)) existing.userIds.push(uid);
        }
      } else {
        const userIds: number[] = [];
        if (Number.isFinite(Number(n.user_id))) userIds.push(Number(n.user_id));
        
        map.set(key, {
          key,
          title: n.title || '(no title)',
          body: n.body,
          type: n.type,
          created_at: n.created_at,
          count: 1,
          userIds,
          emailSent: meta?.email_sent === true ? 1 : 0,
          emailTracked: typeof meta?.email_sent !== 'undefined' ? 1 : 0
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  const handleQueryChange = (newQuery: DataTableQuery) => {
    setQuery(newQuery);
    loadNotifications(newQuery);
  };


  useEffect(() => {
    loadNotifications();
  }, [refreshTrigger, loadNotifications]);

  const columns: DataTableColumn<NotificationGroup>[] = [
    {
      key: 'title',
      title: t('notificationTitle'),
      dataIndex: 'title',
      sortable: true,
      filter: { type: 'text', placeholder: t('searchByTitle') },
      render: (_, record) => (
        <div className="space-y-1">
          <div className="font-medium">{record.title}</div>
          {record.body && (
            <div className="text-sm text-muted-foreground line-clamp-2">
              {record.body}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'recipients',
      title: t('recipients'),
      width: 150,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Badge variant="default">
            {record.count} {tc('users')}
          </Badge>
          {record.emailTracked > 0 && (
            <Badge variant="outline">
              {record.emailSent}/{record.count} {tc('email')}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'type',
      title: t('type'),
      dataIndex: 'type',
      width: 120,
      filter: {
        type: 'select',
        options: ['broadcast', 'targeted', 'system'],
        placeholder: t('filterByType')
      },
      render: (value) => {
        if (!value) return '-';
        const variants: Record<string, 'default' | 'success' | 'primary' | 'outline'> = {
          broadcast: 'default',
          targeted: 'success', 
          system: 'primary'
        };
        const variant = variants[value] || 'outline';
        return (
          <Badge variant={variant}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'created_at',
      title: t('sentAt'),
      dataIndex: 'created_at',
      width: 180,
      sortable: true,
      filter: { type: 'date', placeholder: t('filterByDate') },
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value).toLocaleString()}
        </span>
      )
    },
    {
      key: 'actions',
      title: t('actions'),
      width: 100,
      render: (_, record) => (
        <Button
          variant="link"
          size="sm"
          onClick={() => showDetails(record)}
          title={t('viewDetails')}
          className="h-8 w-8 p-0"
        >
          <Eye className="w-4 h-4" />
        </Button>
      )
    }
  ];

  const showDetails = (record: NotificationGroup) => {
    setSelectedNotification(record);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  return (
    <>
      <DataTable<NotificationGroup>
        columns={columns}
        data={data}
        rowKey="key"
        loading={loading}
        total={total}
        page={query.page}
        pageSize={query.pageSize}
        onQueryChange={handleQueryChange}
        enableColumnVisibilityToggle
      />

      <NotificationDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        notification={selectedNotification}
        users={idToUser}
      />
    </>
  );
}
