'use client';

import React, { useState, useEffect } from 'react';
import {
  getTranslationErrors,
  getTranslationErrorStats,
  clearTranslationErrors,
  checkTranslationConsistency,
  TranslationError,
  TranslationErrorType,
  ConsistencyReport,
} from '@/lib/i18n/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';

export function TranslationMonitor() {
  const [errors, setErrors] = useState<TranslationError[]>([]);
  const [errorStats, setErrorStats] = useState<
    Record<TranslationErrorType, number>
  >({} as Record<TranslationErrorType, number>);
  const [consistencyReport, setConsistencyReport] =
    useState<ConsistencyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const currentErrors = getTranslationErrors();
      const currentStats = getTranslationErrorStats();
      const consistency = checkTranslationConsistency();

      setErrors(currentErrors);
      setErrorStats(currentStats);
      setConsistencyReport(consistency);
    } catch (error) {
      console.error('Error refreshing translation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearErrors = () => {
    clearTranslationErrors();
    refreshData();
  };

  useEffect(() => {
    refreshData();

    // Refresh data every 30 seconds in development
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getErrorTypeColor = (type: TranslationErrorType): string => {
    switch (type) {
      case TranslationErrorType.MISSING_KEY:
        return 'destructive';
      case TranslationErrorType.EMPTY_TRANSLATION:
        return 'destructive';
      case TranslationErrorType.INVALID_FORMAT:
        return 'destructive';
      case TranslationErrorType.LOADING_FAILED:
        return 'destructive';
      case TranslationErrorType.INVALID_LANGUAGE:
        return 'destructive';
      case TranslationErrorType.FALLBACK_USED:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getErrorTypeIcon = (type: TranslationErrorType) => {
    switch (type) {
      case TranslationErrorType.FALLBACK_USED:
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-h-96 w-96">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Translation Monitor</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`}
                />
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearErrors}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="errors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="errors" className="text-xs">
                Errors ({errors.length})
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs">
                Stats
              </TabsTrigger>
              <TabsTrigger value="consistency" className="text-xs">
                Health
              </TabsTrigger>
            </TabsList>

            <TabsContent value="errors" className="mt-2">
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {errors.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    No translation errors
                  </div>
                ) : (
                  errors.slice(-10).map((error, index) => (
                    <div key={index} className="rounded border p-2 text-xs">
                      <div className="mb-1 flex items-center gap-2">
                        {getErrorTypeIcon(error.type)}
                        <Badge
                          variant={getErrorTypeColor(error.type) as any}
                          className="text-xs"
                        >
                          {error.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-gray-600">
                        <div>
                          <strong>Key:</strong> {error.key}
                        </div>
                        <div>
                          <strong>Locale:</strong> {error.locale}
                        </div>
                        {error.component && (
                          <div>
                            <strong>Component:</strong> {error.component}
                          </div>
                        )}
                        <div>
                          <strong>Fallback:</strong> {error.fallbackUsed}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-2">
              <div className="space-y-2">
                {Object.entries(errorStats).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="capitalize">{type.replace('_', ' ')}</span>
                    <Badge variant={count > 0 ? 'destructive' : 'secondary'}>
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="consistency" className="mt-2">
              {consistencyReport && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Keys:</span>
                    <span>{consistencyReport.totalKeys}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consistent:</span>
                    <span className="text-green-600">
                      {consistencyReport.consistentKeys}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issues:</span>
                    <span className="text-red-600">
                      {consistencyReport.inconsistentKeys.length}
                    </span>
                  </div>

                  {Object.entries(consistencyReport.missingInLanguages).map(
                    ([lang, missing]) =>
                      missing.length > 0 && (
                        <div key={lang} className="flex justify-between">
                          <span>Missing in {lang}:</span>
                          <Badge variant="destructive">{missing.length}</Badge>
                        </div>
                      )
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
