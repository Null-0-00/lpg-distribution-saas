import React from 'react';
import { Receipt, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface ExpensesSummary {
  total: { count: number; amount: number };
  pending: { count: number; amount: number };
  approved: { count: number; amount: number };
}

interface ExpenseStatCardsProps {
  summary: ExpensesSummary;
  loading: boolean;
}

export const ExpenseStatCards: React.FC<ExpenseStatCardsProps> = ({
  summary,
  loading,
}) => {
  const { formatCurrency } = useSettings();

  const cards = [
    {
      title: 'Total Expenses',
      amount: summary.total.amount,
      count: summary.total.count,
      icon: Receipt,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Pending Approval',
      amount: summary.pending.amount,
      count: summary.pending.count,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Approved',
      amount: summary.approved.amount,
      count: summary.approved.count,
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {cards.map((card, index) => (
        <div key={index} className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                {card.title}
              </p>
              {loading ? (
                <div className="animate-pulse">
                  <div className="bg-muted mt-2 h-8 w-24 rounded"></div>
                  <div className="bg-muted mt-1 h-4 w-16 rounded"></div>
                </div>
              ) : (
                <>
                  <p className={`text-2xl font-bold ${card.textColor}`}>
                    {formatCurrency(card.amount)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {card.count} expense{card.count !== 1 ? 's' : ''}
                  </p>
                </>
              )}
            </div>
            <div className={`rounded-full p-3 ${card.color} bg-opacity-10`}>
              <card.icon className={`h-6 w-6 ${card.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
