import React, { memo } from 'react';
import { ExpenseHeader } from '../ExpenseHeader';

interface MemoizedExpenseHeaderProps {
  onAddExpense: () => void;
  onManageCategories: () => void;
}

export const MemoizedExpenseHeader = memo<MemoizedExpenseHeaderProps>(
  ({ onAddExpense, onManageCategories }) => {
    return (
      <ExpenseHeader
        onAddExpense={onAddExpense}
        onManageCategories={onManageCategories}
      />
    );
  }
);

MemoizedExpenseHeader.displayName = 'MemoizedExpenseHeader';
