import React, { memo, useMemo } from 'react';
import { ExpenseStatCards } from '../ExpenseStatCards';

interface ExpensesSummary {
  total: { count: number; amount: number };
  pending: { count: number; amount: number };
  approved: { count: number; amount: number };
}

interface MemoizedExpenseStatCardsProps {
  summary: ExpensesSummary;
  loading: boolean;
}

export const MemoizedExpenseStatCards = memo<MemoizedExpenseStatCardsProps>(
  ({ summary, loading }) => {
    const memoizedSummary = useMemo(() => {
      // Only recalculate if the actual values change
      return {
        total: {
          count: summary.total.count,
          amount: summary.total.amount,
        },
        pending: {
          count: summary.pending.count,
          amount: summary.pending.amount,
        },
        approved: {
          count: summary.approved.count,
          amount: summary.approved.amount,
        },
      };
    }, [
      summary.total.count,
      summary.total.amount,
      summary.pending.count,
      summary.pending.amount,
      summary.approved.count,
      summary.approved.amount,
    ]);

    return <ExpenseStatCards summary={memoizedSummary} loading={loading} />;
  }
);

MemoizedExpenseStatCards.displayName = 'MemoizedExpenseStatCards';
