'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
} from 'lucide-react';

interface MessageLogEntry {
  id: string;
  recipientType: string;
  phoneNumber: string;
  trigger: string;
  status: string;
  messageType: string;
  sentAt: string;
  templateName: string;
  messagePreview: string;
  metadata: any;
}

interface MessageLogData {
  messages: MessageLogEntry[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    triggers: string[];
    statuses: string[];
    recipientTypes: string[];
  };
}

export default function MessageLog() {
  const [data, setData] = useState<MessageLogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRecipientType, setSelectedRecipientType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [
    currentPage,
    searchTerm,
    selectedTrigger,
    selectedStatus,
    selectedRecipientType,
  ]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedTrigger) params.append('trigger', selectedTrigger);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedRecipientType)
        params.append('recipientType', selectedRecipientType);

      const response = await fetch(`/api/messaging/logs?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch message logs');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load message logs'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message log?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/messaging/logs?messageId=${messageId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      // Refresh the message list
      fetchMessages();
    } catch (err) {
      alert(
        'Failed to delete message: ' +
          (err instanceof Error ? err.message : 'Unknown error')
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'RECEIVABLES_CHANGE':
        return 'Receivables Change';
      case 'PAYMENT_RECEIVED':
        return 'Payment Received';
      case 'CYLINDER_RETURN':
        return 'Cylinder Return';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTrigger('');
    setSelectedStatus('');
    setSelectedRecipientType('');
    setCurrentPage(1);
  };

  if (loading && !data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="bg-muted h-8 w-1/3 rounded"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-muted h-16 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex items-center">
          <XCircle className="mr-2 h-5 w-5 text-red-500" />
          <p className="text-red-700 dark:text-red-400">
            Error loading message logs: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-lg font-semibold">Message Log</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
          <input
            type="text"
            placeholder="Search by phone number or message content..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && data && (
          <div className="bg-muted/30 border-border grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-4">
            <div>
              <label className="text-foreground mb-1 block text-sm font-medium">
                Trigger Type
              </label>
              <select
                value={selectedTrigger}
                onChange={(e) => {
                  setSelectedTrigger(e.target.value);
                  setCurrentPage(1);
                }}
                className="border-border bg-background text-foreground w-full rounded border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Triggers</option>
                {data.filters.triggers.map((trigger) => (
                  <option key={trigger} value={trigger}>
                    {getTypeLabel(trigger)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-foreground mb-1 block text-sm font-medium">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="border-border bg-background text-foreground w-full rounded border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {data.filters.statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-foreground mb-1 block text-sm font-medium">
                Recipient Type
              </label>
              <select
                value={selectedRecipientType}
                onChange={(e) => {
                  setSelectedRecipientType(e.target.value);
                  setCurrentPage(1);
                }}
                className="border-border bg-background text-foreground w-full rounded border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {data.filters.recipientTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground px-4 py-2 text-sm transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages Table */}
      {data && (
        <div className="bg-card border-border overflow-hidden rounded-lg border">
          {data.messages.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No messages found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-border border-b">
                    <tr>
                      <th className="text-foreground px-4 py-3 text-left text-sm font-medium">
                        Status
                      </th>
                      <th className="text-foreground px-4 py-3 text-left text-sm font-medium">
                        Recipient
                      </th>
                      <th className="text-foreground px-4 py-3 text-left text-sm font-medium">
                        Trigger
                      </th>
                      <th className="text-foreground px-4 py-3 text-left text-sm font-medium">
                        Message
                      </th>
                      <th className="text-foreground px-4 py-3 text-left text-sm font-medium">
                        Sent At
                      </th>
                      <th className="text-foreground px-4 py-3 text-left text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {data.messages.map((message) => (
                      <tr
                        key={message.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(message.status)}
                            <span className="text-foreground text-sm capitalize">
                              {message.status.toLowerCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-foreground text-sm font-medium">
                              {message.phoneNumber}
                            </div>
                            <div className="text-muted-foreground text-xs capitalize">
                              {message.recipientType.toLowerCase()}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-foreground text-sm">
                              {getTypeLabel(message.trigger)}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {message.templateName}
                            </div>
                          </div>
                        </td>
                        <td className="max-w-xs px-4 py-3">
                          <div
                            className="text-foreground truncate text-sm"
                            title={message.messagePreview}
                          >
                            {message.messagePreview}
                          </div>
                          <div className="text-muted-foreground text-xs capitalize">
                            {message.messageType.toLowerCase()}
                          </div>
                        </td>
                        <td className="text-foreground px-4 py-3 text-sm">
                          {formatDate(message.sentAt)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-red-600 transition-colors hover:text-red-800"
                            title="Delete message log"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-muted/30 border-border flex items-center justify-between border-t px-4 py-3">
                <div className="text-muted-foreground text-sm">
                  Showing{' '}
                  {Math.min(
                    (currentPage - 1) * 20 + 1,
                    data.pagination.totalCount
                  )}{' '}
                  to {Math.min(currentPage * 20, data.pagination.totalCount)} of{' '}
                  {data.pagination.totalCount} messages
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!data.pagination.hasPrev}
                    className="border-border hover:bg-muted/50 bg-background text-foreground rounded border px-3 py-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="text-foreground text-sm">
                    Page {currentPage} of {data.pagination.totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!data.pagination.hasNext}
                    className="border-border hover:bg-muted/50 bg-background text-foreground rounded border px-3 py-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {loading && data && (
        <div className="text-muted-foreground py-4 text-center">Loading...</div>
      )}
    </div>
  );
}
