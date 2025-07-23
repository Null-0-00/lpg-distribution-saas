'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ProgressIndicatorProps {
  title: string;
  current: number;
  target: number;
  unit?: string;
  period?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  status?: 'on-track' | 'behind' | 'ahead' | 'at-risk';
  description?: string;
}

export function ProgressIndicator({
  title,
  current,
  target,
  unit = '',
  period = 'today',
  trend,
  status,
  description
}: ProgressIndicatorProps) {
  const percentage = Math.min(100, (current / target) * 100);
  const isOverTarget = current > target;
  
  const getStatusColor = () => {
    if (isOverTarget) return 'text-green-600';
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (isOverTarget || percentage >= 90) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (percentage >= 70) {
      return <Clock className="h-4 w-4 text-yellow-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusBadge = () => {
    if (status) {
      switch (status) {
        case 'ahead':
          return <Badge variant="default" className="bg-green-100 text-green-800">Ahead</Badge>;
        case 'on-track':
          return <Badge variant="default" className="bg-blue-100 text-blue-800">On Track</Badge>;
        case 'behind':
          return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Behind</Badge>;
        case 'at-risk':
          return <Badge variant="destructive">At Risk</Badge>;
      }
    }
    
    if (isOverTarget) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Exceeded</Badge>;
    }
    if (percentage >= 90) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">On Track</Badge>;
    }
    if (percentage >= 70) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Behind</Badge>;
    }
    return <Badge variant="destructive">At Risk</Badge>;
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>{title}</span>
          </CardTitle>
          {getStatusIcon()}
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {formatValue(current)}{unit}
            </div>
            <div className="text-sm text-muted-foreground">
              of {formatValue(target)}{unit} target
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${getStatusColor()}`}>
              {percentage.toFixed(1)}%
            </div>
            {getStatusBadge()}
          </div>
        </div>

        <Progress 
          value={percentage} 
          className="h-2"
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{period}</span>
          <span>
            {isOverTarget 
              ? `+${formatValue(current - target)}${unit} over target`
              : `${formatValue(target - current)}${unit} to go`
            }
          </span>
        </div>

        {trend && (
          <div className="flex items-center space-x-2 pt-2 border-t">
            {trend.direction === 'up' ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : trend.direction === 'down' ? (
              <TrendingDown className="h-3 w-3 text-red-500" />
            ) : (
              <div className="h-3 w-3 rounded-full bg-gray-400" />
            )}
            <span className={`text-xs font-medium ${
              trend.direction === 'up' ? 'text-green-500' : 
              trend.direction === 'down' ? 'text-red-500' : 
              'text-gray-500'
            }`}>
              {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '' : ''}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TargetProgressGridProps {
  targets: Array<{
    id: string;
    title: string;
    current: number;
    target: number;
    unit?: string;
    period?: string;
    trend?: {
      value: number;
      direction: 'up' | 'down' | 'neutral';
      label: string;
    };
    status?: 'on-track' | 'behind' | 'ahead' | 'at-risk';
    description?: string;
  }>;
}

export function TargetProgressGrid({ targets }: TargetProgressGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {targets.map((target) => (
        <ProgressIndicator key={target.id} {...target} />
      ))}
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
}

export function CircularProgress({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  label,
  showPercentage = true,
  color = 'hsl(var(--primary))'
}: CircularProgressProps) {
  const percentage = Math.min(100, (value / max) * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-lg font-bold">
            {percentage.toFixed(0)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-muted-foreground text-center">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}