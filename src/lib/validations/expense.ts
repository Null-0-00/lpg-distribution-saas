import { z } from 'zod';

export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  description: z
    .string()
    .max(255, 'Description is too long')
    .optional()
    .or(z.literal('')),
  categoryId: z.string().min(1, 'Category is required'),
  expenseDate: z.string().min(1, 'Expense date is required'),
  receiptUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  notes: z.string().max(500, 'Notes are too long').optional().or(z.literal('')),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name is too long'),
  description: z
    .string()
    .max(255, 'Description is too long')
    .optional()
    .or(z.literal('')),
  parentId: z.string().optional().or(z.literal('')),
  budget: z.number().positive('Budget must be greater than 0').optional(),
  isParent: z.boolean().optional(),
});

export const expenseFiltersSchema = z.object({
  status: z.enum(['all', 'pending', 'approved']).default('all'),
  categoryId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(20),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type ExpenseFiltersData = z.infer<typeof expenseFiltersSchema>;
export type PaginationData = z.infer<typeof paginationSchema>;
