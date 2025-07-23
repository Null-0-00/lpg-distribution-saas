import { z } from 'zod';

export const settingsSchema = z.object({
  currency: z.string().min(3).max(3),
  timezone: z.string().min(1),
  language: z.string().min(2).max(5),
});

export type SettingsData = z.infer<typeof settingsSchema>;

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export interface TimezoneOption {
  value: string;
  label: string;
}

export interface LanguageOption {
  code: string;
  name: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
];

export const TIMEZONES: TimezoneOption[] = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Dhaka', label: 'Dhaka (BST)' },
  { value: 'Asia/Kolkata', label: 'Kolkata (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
];

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
];
