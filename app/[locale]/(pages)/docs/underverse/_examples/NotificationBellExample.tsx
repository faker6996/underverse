"use client";

import { NotificationBell } from "@/components/ui/NotificationBell";

export default function NotificationBellExample() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Notification Bell</h3>
        <p className="text-sm text-muted-foreground">
          Real-time notification system with Socket.IO integration.
        </p>
      </div>

      <div className="flex items-center gap-4 p-6 border rounded-lg bg-card">
        <span className="text-sm">Notification bell component:</span>
        <NotificationBell size="md" />
      </div>

      <div className="text-sm text-muted-foreground space-y-2">
        <p className="font-medium">Features:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Real-time notifications via Socket.IO</li>
          <li>Unread notification badge counter</li>
          <li>Notification list with tabs (All / Unread)</li>
          <li>Mark as read/unread functionality</li>
          <li>Delete notifications</li>
          <li>Pagination support</li>
          <li>Click to open linked content</li>
          <li>Integrates with NotificationModal component</li>
        </ul>
        <p className="text-xs italic mt-4">
          Note: This component requires authentication. You need to be logged in to see notifications.
        </p>
      </div>
    </div>
  );
}
