import { useSettings } from '@/contexts/SettingsContext';

export function useFormatter() {
  const { formatCurrency, formatDateTime, formatDate, formatTime } =
    useSettings();

  return {
    formatCurrency,
    formatDateTime,
    formatDate,
    formatTime,
  };
}
