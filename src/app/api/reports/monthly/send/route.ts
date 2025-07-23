import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ReportGenerator } from '@/lib/email/report-generator';
import { EmailService, getEmailConfig } from '@/lib/email/email-service';
import { PrismaClient } from '@prisma/client';
 

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { month, year, recipients } = await request.json();

    if (!month || !year || !recipients?.length) {
      return NextResponse.json(
        { error: 'Month, year, and recipients are required' },
        { status: 400 }
      );
    }

    // Validate recipients are valid email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validRecipients = recipients.filter((email: string) => emailRegex.test(email));
    
    if (validRecipients.length === 0) {
      return NextResponse.json(
        { error: 'No valid email addresses provided' },
        { status: 400 }
      );
    }

    // Generate monthly report
    const generator = new ReportGenerator();
    const reportData = await generator.generateMonthlyReport(
      session.user.companyId,
      parseInt(year),
      parseInt(month)
    );

    // Get email configuration
    const emailConfig = await getEmailConfig();
    const emailService = new EmailService(emailConfig);

    // Send email
    const success = await emailService.sendMonthlyReport(
      reportData,
      validRecipients
    );

    if (success) {
      // Log the email activity
      await prisma.auditLog.create({
        data: {
          companyId: session.user.companyId,
          userId: session.user.id,
          action: 'MONTHLY_REPORT_SENT',
          entityType: 'REPORT',
          entityId: `monthly-${month}-${year}`,
          changes: {
            month,
            year,
            recipients: validRecipients,
            reportMetrics: {
              totalSales: reportData.salesSummary.totalSales,
              totalRevenue: reportData.salesSummary.totalRevenue
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: `Monthly report sent successfully to ${validRecipients.length} recipients`,
        reportSummary: {
          period: `${reportData.period.month}/${reportData.period.year}`,
          totalSales: reportData.salesSummary.totalSales,
          totalRevenue: reportData.salesSummary.totalRevenue,
          recipients: validRecipients.length
        }
      });
    } else {
      throw new Error('Failed to send email');
    }

  } catch (error) {
    console.error('Error sending monthly report:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send monthly report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get recent monthly report sending history
    const recentReports = await prisma.auditLog.findMany({
      where: {
        companyId: session.user.companyId,
        action: 'MONTHLY_REPORT_SENT'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      recentReports: recentReports.map(log => ({
        id: log.id,
        sentAt: log.createdAt,
        sentBy: log.user,
        period: log.entityId,
        recipients: log.changes.recipients?.length || 0,
        reportMetrics: log.changes.reportMetrics
      }))
    });

  } catch (error) {
    console.error('Error fetching report history:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch report history' },
      { status: 500 }
    );
  }
}