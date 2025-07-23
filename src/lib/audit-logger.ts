import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { getRequestMetadata } from '@/lib/admin-auth';

type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'ASSIGN'
  | 'UNASSIGN'
  | 'APPROVE'
  | 'REJECT'
  | 'ACTIVATE'
  | 'DEACTIVATE';

interface AuditLogData {
  userId: string;
  tenantId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  request?: NextRequest;
}

export class AuditLogger {
  static async log(data: AuditLogData): Promise<void> {
    try {
      const requestMetadata = data.request
        ? await getRequestMetadata(data.request)
        : {};

      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          tenantId: data.tenantId || null,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId || null,
          oldValues: data.oldValues || null,
          newValues: data.newValues || null,
          metadata: {
            ...requestMetadata,
            ...data.metadata,
          },
          ipAddress: requestMetadata.ipAddress,
          userAgent: requestMetadata.userAgent,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  static async logCompanyAction(
    userId: string,
    action: AuditAction,
    companyId?: string,
    oldValues?: any,
    newValues?: any,
    request?: NextRequest
  ) {
    await this.log({
      userId,
      action,
      entityType: 'Company',
      entityId: companyId,
      oldValues,
      newValues,
      request,
    });
  }

  static async logProductAction(
    userId: string,
    action: AuditAction,
    productId?: string,
    oldValues?: any,
    newValues?: any,
    request?: NextRequest
  ) {
    await this.log({
      userId,
      action,
      entityType: 'Product',
      entityId: productId,
      oldValues,
      newValues,
      request,
    });
  }

  static async logDistributorAssignmentAction(
    userId: string,
    action: AuditAction,
    assignmentId?: string,
    oldValues?: any,
    newValues?: any,
    request?: NextRequest
  ) {
    await this.log({
      userId,
      action,
      entityType: 'DistributorAssignment',
      entityId: assignmentId,
      oldValues,
      newValues,
      request,
    });
  }

  static async logPricingTierAction(
    userId: string,
    action: AuditAction,
    tierType: 'Company' | 'Product',
    tierId?: string,
    oldValues?: any,
    newValues?: any,
    request?: NextRequest
  ) {
    await this.log({
      userId,
      action,
      entityType: `${tierType}PricingTier`,
      entityId: tierId,
      oldValues,
      newValues,
      request,
    });
  }

  static async logPricingAssignmentAction(
    userId: string,
    action: AuditAction,
    assignmentId?: string,
    oldValues?: any,
    newValues?: any,
    request?: NextRequest
  ) {
    await this.log({
      userId,
      action,
      entityType: 'DistributorPricingAssignment',
      entityId: assignmentId,
      oldValues,
      newValues,
      request,
    });
  }

  static async getAuditHistory(
    entityType?: string,
    entityId?: string,
    userId?: string,
    tenantId?: string,
    limit: number = 100,
    offset: number = 0
  ) {
    const whereClause: any = {};

    if (entityType) whereClause.entityType = entityType;
    if (entityId) whereClause.entityId = entityId;
    if (userId) whereClause.userId = userId;
    if (tenantId) whereClause.tenantId = tenantId;

    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          tenant: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where: whereClause }),
    ]);

    return {
      logs,
      totalCount,
      hasMore: offset + limit < totalCount,
    };
  }

  static async getRecentActivity(tenantId?: string, limit: number = 20) {
    const whereClause: any = {};
    if (tenantId) whereClause.tenantId = tenantId;

    return prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  static async getUserActivity(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return prisma.auditLog.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getEntityHistory(entityType: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getActivityStats(tenantId?: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const whereClause: any = {
      createdAt: { gte: startDate },
    };
    if (tenantId) whereClause.tenantId = tenantId;

    const [totalActions, actionsByType, actionsByEntity, topUsers] =
      await Promise.all([
        prisma.auditLog.count({ where: whereClause }),

        prisma.auditLog.groupBy({
          by: ['action'],
          where: whereClause,
          _count: { action: true },
        }),

        prisma.auditLog.groupBy({
          by: ['entityType'],
          where: whereClause,
          _count: { entityType: true },
        }),

        prisma.auditLog.groupBy({
          by: ['userId'],
          where: whereClause,
          _count: { userId: true },
          orderBy: { _count: { userId: 'desc' } },
          take: 10,
        }),
      ]);

    return {
      totalActions,
      actionsByType: actionsByType.map((item) => ({
        action: item.action,
        count: item._count.action,
      })),
      actionsByEntity: actionsByEntity.map((item) => ({
        entityType: item.entityType,
        count: item._count.entityType,
      })),
      topUsers: topUsers.map((item) => ({
        userId: item.userId,
        count: item._count.userId,
      })),
    };
  }
}
