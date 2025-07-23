'use client';

import React, { useState, useEffect } from 'react';
import { MobileButton, MobileCard } from '@/components/ui/mobile-optimized';
import { usePWA, useOfflineSync } from '@/hooks/usePWA';
import { offlineStorage } from '@/lib/offline/storage';
import { pushNotificationManager } from '@/lib/pwa/push-notifications';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Clock,
  Wifi,
  WifiOff,
  Smartphone,
  Bell,
  Database,
  Sync,
  Download,
  AlertTriangle,
  Play,
  TestTube,
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  details?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  running: boolean;
}

export function MobileTestSuite() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'PWA Installation',
      tests: [],
      running: false,
    },
    {
      name: 'Service Worker',
      tests: [],
      running: false,
    },
    {
      name: 'Offline Storage',
      tests: [],
      running: false,
    },
    {
      name: 'Push Notifications',
      tests: [],
      running: false,
    },
    {
      name: 'Touch & Mobile UI',
      tests: [],
      running: false,
    },
    {
      name: 'Voice Input',
      tests: [],
      running: false,
    },
    {
      name: 'Network Connectivity',
      tests: [],
      running: false,
    },
  ]);

  const [overallStatus, setOverallStatus] = useState<
    'idle' | 'running' | 'completed'
  >('idle');
  const pwa = usePWA();
  const { syncStatus } = useOfflineSync();

  // PWA Installation Tests
  const runPWAInstallationTests = async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];

    // Test 1: PWA Manifest
    tests.push({
      name: 'PWA Manifest',
      status: 'pending',
      message: 'Checking manifest file...',
    });

    try {
      const manifestResponse = await fetch('/manifest.json');
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        tests[0] = {
          name: 'PWA Manifest',
          status: 'pass',
          message: 'Manifest loaded successfully',
          details: `App name: ${manifest.name}`,
        };
      } else {
        tests[0] = {
          name: 'PWA Manifest',
          status: 'fail',
          message: 'Manifest file not found',
        };
      }
    } catch (error) {
      tests[0] = {
        name: 'PWA Manifest',
        status: 'fail',
        message: 'Failed to load manifest',
      };
    }

    // Test 2: Install Prompt
    tests.push({
      name: 'Install Prompt',
      status: pwa.isInstallable ? 'pass' : 'warning',
      message: pwa.isInstallable
        ? 'Install prompt available'
        : 'Install prompt not triggered (may be already installed)',
      details: pwa.isInstalled ? 'App appears to be installed' : undefined,
    });

    // Test 3: Standalone Mode
    tests.push({
      name: 'Standalone Mode',
      status: pwa.isInstalled ? 'pass' : 'warning',
      message: pwa.isInstalled
        ? 'Running in standalone mode'
        : 'Not running in standalone mode',
    });

    return tests;
  };

  // Service Worker Tests
  const runServiceWorkerTests = async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];

    // Test 1: Service Worker Support
    tests.push({
      name: 'Service Worker Support',
      status: 'serviceWorker' in navigator ? 'pass' : 'fail',
      message:
        'serviceWorker' in navigator
          ? 'Service Worker API supported'
          : 'Service Worker not supported',
    });

    // Test 2: Service Worker Registration
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        tests.push({
          name: 'Service Worker Registration',
          status: registration ? 'pass' : 'fail',
          message: registration
            ? 'Service Worker registered'
            : 'Service Worker not registered',
        });

        // Test 3: Service Worker State
        if (registration) {
          const sw =
            registration.active ||
            registration.installing ||
            registration.waiting;
          tests.push({
            name: 'Service Worker State',
            status: sw ? 'pass' : 'warning',
            message: sw
              ? `Service Worker ${sw.state}`
              : 'Service Worker state unknown',
          });
        }
      } catch (error) {
        tests.push({
          name: 'Service Worker Registration',
          status: 'fail',
          message: 'Failed to check registration',
        });
      }
    }

    // Test 4: Update Available
    tests.push({
      name: 'Update Check',
      status: pwa.updateAvailable ? 'warning' : 'pass',
      message: pwa.updateAvailable ? 'Update available' : 'App is up to date',
    });

    return tests;
  };

  // Offline Storage Tests
  const runOfflineStorageTests = async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];

    // Test 1: IndexedDB Support
    tests.push({
      name: 'IndexedDB Support',
      status: 'indexedDB' in window ? 'pass' : 'fail',
      message:
        'indexedDB' in window
          ? 'IndexedDB supported'
          : 'IndexedDB not supported',
    });

    // Test 2: Storage Quota
    try {
      const storageInfo = await pwa.getStorageInfo();
      tests.push({
        name: 'Storage Quota',
        status: storageInfo.available > 0 ? 'pass' : 'warning',
        message: `${Math.round(storageInfo.used / 1024 / 1024)}MB used of ${Math.round(storageInfo.available / 1024 / 1024)}MB available`,
        details: `${Math.round((storageInfo.used / storageInfo.available) * 100)}% used`,
      });
    } catch (error) {
      tests.push({
        name: 'Storage Quota',
        status: 'warning',
        message: 'Unable to check storage quota',
      });
    }

    // Test 3: Offline Data Storage
    try {
      const testId = await offlineStorage.storeOffline('sale', {
        test: true,
        timestamp: Date.now(),
      });
      const pendingData = await offlineStorage.getPendingData();
      const testData = pendingData.find((item) => item.id === testId);

      tests.push({
        name: 'Offline Data Storage',
        status: testData ? 'pass' : 'fail',
        message: testData
          ? 'Successfully stored offline data'
          : 'Failed to store offline data',
      });

      // Clean up test data
      if (testData) {
        await offlineStorage.markSynced(testId);
      }
    } catch (error) {
      tests.push({
        name: 'Offline Data Storage',
        status: 'fail',
        message: 'Offline storage test failed',
      });
    }

    // Test 4: Cache Performance
    try {
      const testKey = 'cache-performance-test';
      const testData = { timestamp: Date.now(), data: 'test' };

      const startTime = performance.now();
      await offlineStorage.cacheData(testKey, testData, 'test', 60000);
      const cachedData = await offlineStorage.getCachedData(testKey);
      const endTime = performance.now();

      tests.push({
        name: 'Cache Performance',
        status: cachedData && endTime - startTime < 100 ? 'pass' : 'warning',
        message: `Cache operation took ${Math.round(endTime - startTime)}ms`,
        details: cachedData
          ? 'Data cached and retrieved successfully'
          : 'Cache operation failed',
      });
    } catch (error) {
      tests.push({
        name: 'Cache Performance',
        status: 'warning',
        message: 'Cache performance test failed',
      });
    }

    return tests;
  };

  // Push Notifications Tests
  const runPushNotificationTests = async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];

    // Test 1: Notification API Support
    tests.push({
      name: 'Notification API',
      status: 'Notification' in window ? 'pass' : 'fail',
      message:
        'Notification' in window
          ? 'Notification API supported'
          : 'Notification API not supported',
    });

    // Test 2: Push Manager Support
    tests.push({
      name: 'Push Manager',
      status: 'PushManager' in window ? 'pass' : 'fail',
      message:
        'PushManager' in window
          ? 'Push Manager supported'
          : 'Push Manager not supported',
    });

    // Test 3: Notification Permission
    if ('Notification' in window) {
      tests.push({
        name: 'Notification Permission',
        status:
          Notification.permission === 'granted'
            ? 'pass'
            : Notification.permission === 'denied'
              ? 'fail'
              : 'warning',
        message: `Permission: ${Notification.permission}`,
      });

      // Test 4: Push Notification Manager
      try {
        const initialized = await pushNotificationManager.initialize();
        tests.push({
          name: 'Push Manager Init',
          status: initialized ? 'pass' : 'warning',
          message: initialized
            ? 'Push notification manager initialized'
            : 'Push notification manager failed to initialize',
        });

        // Test 5: Test Notification
        if (initialized && Notification.permission === 'granted') {
          try {
            await pushNotificationManager.testNotification();
            tests.push({
              name: 'Test Notification',
              status: 'pass',
              message: 'Test notification sent successfully',
            });
          } catch (error) {
            tests.push({
              name: 'Test Notification',
              status: 'warning',
              message: 'Test notification failed',
            });
          }
        }
      } catch (error) {
        tests.push({
          name: 'Push Manager Init',
          status: 'fail',
          message: 'Failed to initialize push manager',
        });
      }
    }

    return tests;
  };

  // Touch & Mobile UI Tests
  const runMobileUITests = async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];

    // Test 1: Touch Support
    tests.push({
      name: 'Touch Support',
      status: 'ontouchstart' in window ? 'pass' : 'warning',
      message:
        'ontouchstart' in window
          ? 'Touch events supported'
          : 'Touch events not detected (may be desktop)',
    });

    // Test 2: Viewport Meta Tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    tests.push({
      name: 'Viewport Meta Tag',
      status: viewportMeta ? 'pass' : 'fail',
      message: viewportMeta
        ? 'Viewport meta tag present'
        : 'Viewport meta tag missing',
      details: viewportMeta
        ? (viewportMeta as HTMLMetaElement).content
        : undefined,
    });

    // Test 3: Screen Size Detection
    const isMobileSize = window.innerWidth <= 768;
    tests.push({
      name: 'Mobile Screen Size',
      status: isMobileSize ? 'pass' : 'warning',
      message: `Screen width: ${window.innerWidth}px`,
      details: isMobileSize ? 'Mobile layout active' : 'Desktop layout active',
    });

    // Test 4: CSS Transforms (for touch feedback)
    const testElement = document.createElement('div');
    testElement.style.transform = 'scale(1)';
    tests.push({
      name: 'CSS Transform Support',
      status: testElement.style.transform === 'scale(1)' ? 'pass' : 'warning',
      message:
        testElement.style.transform === 'scale(1)'
          ? 'CSS transforms supported'
          : 'CSS transforms may not be supported',
    });

    return tests;
  };

  // Voice Input Tests
  const runVoiceInputTests = async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];

    // Test 1: Speech Recognition Support
    const hasSpeechRecognition =
      'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    tests.push({
      name: 'Speech Recognition API',
      status: hasSpeechRecognition ? 'pass' : 'warning',
      message: hasSpeechRecognition
        ? 'Speech Recognition supported'
        : 'Speech Recognition not supported',
    });

    // Test 2: Media Devices Support (for microphone access)
    tests.push({
      name: 'Media Devices API',
      status: navigator.mediaDevices ? 'pass' : 'warning',
      message: navigator.mediaDevices
        ? 'Media Devices API supported'
        : 'Media Devices API not supported',
    });

    // Test 3: HTTPS Check (required for voice input)
    tests.push({
      name: 'HTTPS Protocol',
      status:
        location.protocol === 'https:' || location.hostname === 'localhost'
          ? 'pass'
          : 'fail',
      message:
        location.protocol === 'https:' || location.hostname === 'localhost'
          ? 'Secure context available'
          : 'HTTPS required for voice input',
    });

    return tests;
  };

  // Network Connectivity Tests
  const runNetworkTests = async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];

    // Test 1: Online Status
    tests.push({
      name: 'Network Status',
      status: navigator.onLine ? 'pass' : 'warning',
      message: navigator.onLine ? 'Online' : 'Offline',
    });

    // Test 2: Network Information API
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    if (connection) {
      tests.push({
        name: 'Connection Type',
        status: 'pass',
        message: `${connection.effectiveType || 'unknown'} connection`,
        details: `Downlink: ${connection.downlink || 'unknown'} Mbps`,
      });
    } else {
      tests.push({
        name: 'Connection Type',
        status: 'warning',
        message: 'Network Information API not supported',
      });
    }

    // Test 3: API Connectivity
    if (navigator.onLine) {
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          cache: 'no-cache',
        });
        tests.push({
          name: 'API Connectivity',
          status: response.ok ? 'pass' : 'warning',
          message: response.ok
            ? `API reachable (${response.status})`
            : `API error (${response.status})`,
        });
      } catch (error) {
        tests.push({
          name: 'API Connectivity',
          status: 'fail',
          message: 'API not reachable',
        });
      }
    }

    // Test 4: Sync Status
    tests.push({
      name: 'Data Sync',
      status: syncStatus.pendingItems === 0 ? 'pass' : 'warning',
      message:
        syncStatus.pendingItems === 0
          ? 'All data synced'
          : `${syncStatus.pendingItems} items pending sync`,
      details: syncStatus.lastSync
        ? `Last sync: ${new Date(syncStatus.lastSync).toLocaleTimeString()}`
        : 'Never synced',
    });

    return tests;
  };

  // Run individual test suite
  const runTestSuite = async (suiteName: string) => {
    setTestSuites((prev) =>
      prev.map((suite) =>
        suite.name === suiteName ? { ...suite, running: true } : suite
      )
    );

    let tests: TestResult[] = [];

    try {
      switch (suiteName) {
        case 'PWA Installation':
          tests = await runPWAInstallationTests();
          break;
        case 'Service Worker':
          tests = await runServiceWorkerTests();
          break;
        case 'Offline Storage':
          tests = await runOfflineStorageTests();
          break;
        case 'Push Notifications':
          tests = await runPushNotificationTests();
          break;
        case 'Touch & Mobile UI':
          tests = await runMobileUITests();
          break;
        case 'Voice Input':
          tests = await runVoiceInputTests();
          break;
        case 'Network Connectivity':
          tests = await runNetworkTests();
          break;
      }
    } catch (error) {
      tests = [
        {
          name: 'Test Suite Error',
          status: 'fail',
          message: 'Test suite failed to run',
        },
      ];
    }

    setTestSuites((prev) =>
      prev.map((suite) =>
        suite.name === suiteName ? { ...suite, tests, running: false } : suite
      )
    );
  };

  // Run all test suites
  const runAllTests = async () => {
    setOverallStatus('running');

    for (const suite of testSuites) {
      await runTestSuite(suite.name);
      // Small delay between test suites
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setOverallStatus('completed');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'text-green-600';
      case 'fail':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'pending':
        return 'text-gray-400';
      default:
        return 'text-gray-600';
    }
  };

  const getSuiteIcon = (suiteName: string) => {
    switch (suiteName) {
      case 'PWA Installation':
        return <Download className="h-5 w-5" />;
      case 'Service Worker':
        return <Sync className="h-5 w-5" />;
      case 'Offline Storage':
        return <Database className="h-5 w-5" />;
      case 'Push Notifications':
        return <Bell className="h-5 w-5" />;
      case 'Touch & Mobile UI':
        return <Smartphone className="h-5 w-5" />;
      case 'Voice Input':
        return <Play className="h-5 w-5" />;
      case 'Network Connectivity':
        return pwa.isOnline ? (
          <Wifi className="h-5 w-5" />
        ) : (
          <WifiOff className="h-5 w-5" />
        );
      default:
        return <TestTube className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <MobileCard>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Mobile & PWA Test Suite</h2>
          <Badge
            variant={overallStatus === 'completed' ? 'default' : 'secondary'}
          >
            {overallStatus}
          </Badge>
        </div>

        <MobileButton
          variant="primary"
          size="lg"
          onClick={runAllTests}
          loading={overallStatus === 'running'}
          className="w-full"
        >
          {overallStatus === 'running' ? 'Running Tests...' : 'Run All Tests'}
        </MobileButton>
      </MobileCard>

      {/* Test Suites */}
      {testSuites.map((suite) => (
        <MobileCard key={suite.name}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getSuiteIcon(suite.name)}
              <h3 className="font-semibold">{suite.name}</h3>
            </div>

            <MobileButton
              variant="secondary"
              size="sm"
              onClick={() => runTestSuite(suite.name)}
              loading={suite.running}
              className="px-3"
            >
              Test
            </MobileButton>
          </div>

          {suite.tests.length > 0 && (
            <div className="space-y-2">
              {suite.tests.map((test, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 rounded bg-gray-50 p-2"
                >
                  {getStatusIcon(test.status)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{test.name}</span>
                      <span
                        className={`text-xs ${getStatusColor(test.status)}`}
                      >
                        {test.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{test.message}</p>
                    {test.details && (
                      <p className="mt-1 text-xs text-gray-500">
                        {test.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {suite.tests.length === 0 && !suite.running && (
            <p className="py-4 text-center text-sm text-gray-500">
              No tests run yet
            </p>
          )}
        </MobileCard>
      ))}
    </div>
  );
}
