'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, FileText, Download, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'broadcast' | 'individual';
  recipients: string[] | 'all';
  sentBy: string;
  sentAt: string;
  read: boolean;
  attachments?: Array<{
    filename: string;
    originalName: string;
    contentType: string;
    size: number;
    url: string;
  }>;
}

interface NotificationDropdownProps {
  userReferralCode: string;
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  onMarkAsRead: (notificationId: string) => void;
}

type FilterType = 'all' | 'unread' | 'read';

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  userReferralCode,
  isOpen,
  onClose,
  onMarkAsRead
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user-notifications?userCode=${userReferralCode}`);
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userReferralCode]);

  useEffect(() => {
    if (isOpen && userReferralCode) {
      fetchNotifications();
    }
  }, [isOpen, userReferralCode, fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await onMarkAsRead(notification._id);
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n._id === notification._id ? { ...n, read: true } : n
        )
      );
    }
    setSelectedNotification(notification);
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch('/api/user-notifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationId })
      });

      if (response.ok) {
        // Remove from local state
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        // Close modal if it's the deleted notification
        if (selectedNotification?._id === notificationId) {
          setSelectedNotification(null);
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/user-notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userCode: userReferralCode })
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDownloadAttachment = (attachment: { url: string; originalName: string }) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'read':
        return notification.read;
      default:
        return true;
    }
  });

  // Sort notifications: unread first, then by date (newest first)
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (a.read !== b.read) {
      return a.read ? 1 : -1; // Unread first
    }
    return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(); // Newest first
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-hidden"
      >
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMarkAllAsRead}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Mark all as read"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex space-x-1">
            {(['all', 'unread', 'read'] as FilterType[]).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-2 py-1 text-xs rounded ${filter === filterType
                  ? 'bg-[#0E5A50] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {filterType === 'all' ? 'All' : filterType === 'unread' ? 'Unread' : 'Read'}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-center text-gray-500 text-sm">
              Loading notifications...
            </div>
          ) : sortedNotifications.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500 text-sm">
              {filter === 'all' ? 'No notifications' :
                filter === 'unread' ? 'No unread notifications' :
                  'No read notifications'}
            </div>
          ) : (
            sortedNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${!notification.read ? 'bg-blue-50' : ''
                  }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  <div className="flex-1 min-w-0" onClick={() => handleNotificationClick(notification)}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 break-words">
                        {notification.title || 'Notification'}
                      </h4>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.sentAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification._id);
                          }}
                          className="text-gray-400 hover:text-[#0E5A50] p-1"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 break-words">
                      {notification.message}
                    </p>
                    {notification.attachments && notification.attachments.length > 0 && (
                      <div className="mt-2 flex items-center space-x-1">
                        <FileText className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {notification.attachments.length} attachment(s)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100">
            <Link
              href="/dashboard?section=notifications"
              onClick={onClose}
              className="block text-xs text-blue-600 hover:text-blue-700 font-medium text-center"
            >
              View all notifications
            </Link>
          </div>
        )}
      </motion.div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedNotification(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 break-words">
                {selectedNotification.title || 'Notification'}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDeleteNotification(selectedNotification._id)}
                  className="text-gray-400 hover:text-[#0E5A50]"
                  title="Delete notification"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 max-h-64 overflow-y-auto">
              <div className="mb-4">
                <p className="text-sm text-gray-600 break-words whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>

              {selectedNotification.attachments && selectedNotification.attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {selectedNotification.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 break-words">
                            {attachment.originalName}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDownloadAttachment(attachment)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500">
                {formatDate(selectedNotification.sentAt)}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;


