import { format } from 'date-fns';
import { CURRENCY, DATE_FORMATS } from './constants';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'currency',
    currency: CURRENCY.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDate(
  date: Date | string,
  formatString: string = DATE_FORMATS.display
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${formatNumber(value, decimals)}%`;
}

export function formatQuantity(quantity: number): string {
  return formatNumber(quantity, 0);
}

export function parseCurrency(value: string): number {
  // Remove currency symbol and parse
  const cleanValue = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleanValue) || 0;
}

export function formatPhoneNumber(phone: string): string {
  // Format Bangladeshi phone numbers
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    return `+88${cleaned}`;
  }

  if (cleaned.length === 13 && cleaned.startsWith('880')) {
    return `+${cleaned}`;
  }

  return phone;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${formatNumber(size, unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}
