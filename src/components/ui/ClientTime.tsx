'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface ClientTimeProps {
  timestamp?: string | Date;
  format?: 'time' | 'datetime' | 'date' | 'relative';
  className?: string;
}

export function ClientTime({
  timestamp,
  format = 'time',
  className,
}: ClientTimeProps) {
  const { formatDate, formatDateTime, formatTime } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('--:--');

  useEffect(() => {
    setMounted(true);

    const updateTime = () => {
      const date = timestamp ? new Date(timestamp) : new Date();

      try {
        switch (format) {
          case 'time':
            setCurrentTime(formatTime(date));
            break;
          case 'datetime':
            setCurrentTime(formatDateTime(date));
            break;
          case 'date':
            setCurrentTime(formatDate(date));
            break;
          case 'relative':
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours < 1) {
              const diffMinutes = Math.floor(diffMs / (1000 * 60));
              setCurrentTime(`${diffMinutes} min ago`);
            } else if (diffHours < 24) {
              setCurrentTime(`${diffHours} hours ago`);
            } else {
              const diffDays = Math.floor(diffHours / 24);
              setCurrentTime(`${diffDays} day${diffDays > 1 ? 's' : ''} ago`);
            }
            break;
          default:
            setCurrentTime(formatTime(date));
        }
      } catch (error) {
        console.error('Error formatting time:', error);
        // Fallback to simple format
        setCurrentTime(date.toLocaleTimeString());
      }
    };

    updateTime();

    // Update current time every second for live timestamps
    if (!timestamp) {
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [timestamp, format, formatDate, formatDateTime, formatTime]);

  if (!mounted) {
    return (
      <span className={className}>
        {format === 'date' ? '--/--/----' : '--:--'}
      </span>
    );
  }

  return <span className={className}>{currentTime}</span>;
}
