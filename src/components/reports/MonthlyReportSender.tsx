"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Mail, Plus, X, Send, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportHistory {
  id: string;
  sentAt: string;
  sentBy: {
    name: string;
    email: string;
  };
  period: string;
  recipients: number;
  reportMetrics: {
    totalSales: number;
    totalRevenue: number;
  };
}

export function MonthlyReportSender() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [recipients, setRecipients] = useState<string[]>(['']);
  const [sending, setSending] = useState(false);
  const [recentReports, setRecentReports] = useState<ReportHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { toast } = useToast();

  const addRecipient = () => {
    setRecipients([...recipients, '']);
  };

  const removeRecipient = (index: number) => {
    const newRecipients = recipients.filter((_, i) => i !== index);
    setRecipients(newRecipients.length === 0 ? [''] : newRecipients);
  };

  const updateRecipient = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  const validateEmails = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = recipients.filter(email => email.trim() && emailRegex.test(email.trim()));
    return validEmails;
  };

  const loadReportHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch('/api/reports/monthly/send');
      
      if (response.ok) {
        const data = await response.json();
        setRecentReports(data.recentReports || []);
      }
    } catch (error) {
      console.error('Failed to load report history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMonthlyReport = async () => {
    const validEmails = validateEmails();
    
    if (validEmails.length === 0) {
      toast({
        title: "Invalid Recipients",
        description: "Please provide at least one valid email address",
        variant: "destructive"
      });
      return;
    }

    try {
      setSending(true);
      const response = await fetch('/api/reports/monthly/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          month: month + 1, // Convert from 0-based to 1-based
          year,
          recipients: validEmails
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Report Sent Successfully",
          description: `Monthly report sent to ${validEmails.length} recipients`
        });
        
        // Refresh history
        await loadReportHistory();
        
        // Reset form
        setRecipients(['']);
      } else {
        throw new Error(data.error || 'Failed to send report');
      }
    } catch (error) {
      console.error('Failed to send report:', error);
      toast({
        title: "Failed to Send Report",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Send Report Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Send Monthly Report
          </CardTitle>
          <CardDescription>
            Generate and email a comprehensive monthly business report to stakeholders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Period Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="month">Month</Label>
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {monthNames.map((name, index) => (
                  <option key={index} value={index}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Recipients */}
          <div>
            <Label>Email Recipients</Label>
            <div className="space-y-2 mt-1">
              {recipients.map((email, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => updateRecipient(index, e.target.value)}
                    className="flex-1"
                  />
                  {recipients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRecipient(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRecipient}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Recipient
              </Button>
            </div>
          </div>

          {/* Preview Info */}
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Report for <strong>{monthNames[month]} {year}</strong> will be sent to{' '}
              <strong>{validateEmails().length}</strong> valid recipients.
              The report includes sales summary, top drivers, inventory status, and financial metrics.
            </AlertDescription>
          </Alert>

          {/* Send Button */}
          <Button
            onClick={sendMonthlyReport}
            disabled={sending || validateEmails().length === 0}
            className="w-full"
          >
            {sending ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Generating & Sending Report...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Monthly Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Reports History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Report History</CardTitle>
          <CardDescription>
            View previously sent monthly reports and their delivery status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={loadReportHistory}
            disabled={loadingHistory}
            variant="outline"
            className="mb-4"
          >
            {loadingHistory ? 'Loading...' : 'Refresh History'}
          </Button>

          {recentReports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No monthly reports have been sent yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Report for {report.period}</span>
                      <Badge variant="secondary">{report.recipients} recipients</Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(report.sentAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Sent by: {report.sentBy.name} ({report.sentBy.email})
                  </div>
                  {report.reportMetrics && (
                    <div className="text-sm text-gray-600">
                      Report metrics: {report.reportMetrics.totalSales} sales, 
                      ৳{report.reportMetrics.totalRevenue.toLocaleString()} revenue
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}