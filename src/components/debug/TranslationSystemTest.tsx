'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { testEnhancedTranslationSystem } from '@/lib/i18n/test-enhanced-system';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Play } from 'lucide-react';

export function TranslationSystemTest() {
  const { t, currentLanguage, hasTranslation } = useTranslation({
    component: 'TranslationSystemTest',
  });
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    try {
      // Run the comprehensive test
      const results = testEnhancedTranslationSystem();
      setTestResults(results);
    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Auto-run tests on component mount in development
    if (process.env.NODE_ENV === 'development') {
      runTests();
    }
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Translation System Test
        </CardTitle>
        <p className="text-sm text-gray-600">
          Current Language: <Badge variant="outline">{currentLanguage}</Badge>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Translation Tests */}
        <div className="space-y-2">
          <h3 className="font-semibold">Basic Translation Tests</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Dashboard:</strong> {t('dashboard')}
            </div>
            <div>
              <strong>Sales:</strong> {t('sales')}
            </div>
            <div>
              <strong>Loading:</strong> {t('loading')}
            </div>
            <div>
              <strong>Error:</strong> {t('error')}
            </div>
          </div>
        </div>

        {/* Translation Availability Tests */}
        <div className="space-y-2">
          <h3 className="font-semibold">Translation Availability</h3>
          <div className="flex flex-wrap gap-2">
            {['dashboard', 'sales', 'loading', 'nonExistentKey'].map((key) => (
              <div key={key} className="flex items-center gap-1">
                {hasTranslation(key as any) ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs">{key}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Test Runner */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Comprehensive System Test</h3>
            <Button
              onClick={runTests}
              disabled={isRunning}
              size="sm"
              variant="outline"
            >
              <Play className="mr-1 h-4 w-4" />
              {isRunning ? 'Running...' : 'Run Tests'}
            </Button>
          </div>

          {testResults && (
            <div className="space-y-2 rounded-lg bg-gray-50 p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Total Errors:</span>
                  <Badge
                    variant={
                      testResults.totalErrors > 0 ? 'destructive' : 'secondary'
                    }
                  >
                    {testResults.totalErrors}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Missing Keys:</span>
                  <Badge
                    variant={
                      testResults.missingKeys > 0 ? 'destructive' : 'secondary'
                    }
                  >
                    {testResults.missingKeys}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Consistent Keys:</span>
                  <Badge variant="secondary">
                    {testResults.consistencyReport?.consistentKeys || 0}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total Keys:</span>
                  <Badge variant="secondary">
                    {testResults.consistencyReport?.totalKeys || 0}
                  </Badge>
                </div>
              </div>

              {testResults.errorStats && (
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-medium">Error Breakdown:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(testResults.errorStats).map(
                      ([type, count]) => (
                        <div key={type} className="flex justify-between">
                          <span className="capitalize">
                            {type.replace('_', ' ')}
                          </span>
                          <Badge
                            variant={
                              (count as number) > 0
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {count as number}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-800">
            Enhanced translation system with validation and fallback is active
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
