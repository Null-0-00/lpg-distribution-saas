import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'page' | 'card' | 'table' | 'form';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'page',
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

  switch (variant) {
    case 'page':
      return (
        <div className={`space-y-6 p-6 ${className}`}>
          <div className="flex items-center justify-between">
            <div className={`h-8 w-64 ${baseClasses}`} />
            <div className={`h-10 w-32 ${baseClasses}`} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-24 ${baseClasses}`} />
            ))}
          </div>
          <div className={`h-96 ${baseClasses}`} />
        </div>
      );

    case 'card':
      return <div className={`h-24 ${baseClasses} ${className}`} />;

    case 'table':
      return (
        <div className={`space-y-3 ${className}`}>
          <div className={`h-10 ${baseClasses}`} />
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-12 ${baseClasses}`} />
          ))}
        </div>
      );

    case 'form':
      return (
        <div className={`space-y-4 ${className}`}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className={`h-4 w-24 ${baseClasses}`} />
              <div className={`h-10 ${baseClasses}`} />
            </div>
          ))}
        </div>
      );

    default:
      return <div className={`h-20 ${baseClasses} ${className}`} />;
  }
};

export const PageLoadingSkeleton = () => <LoadingSkeleton variant="page" />;
export const CardLoadingSkeleton = () => <LoadingSkeleton variant="card" />;
export const TableLoadingSkeleton = () => <LoadingSkeleton variant="table" />;
export const FormLoadingSkeleton = () => <LoadingSkeleton variant="form" />;
