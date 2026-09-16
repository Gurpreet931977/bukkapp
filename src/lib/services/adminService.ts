import { AuditLog, BusinessStatus } from '@/types';

export class AdminService {
  public static createAuditLog(
    actorUserId: string,
    actorName: string,
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    metadata?: Record<string, any>
  ): AuditLog {
    return {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actorUserId,
      actorName,
      action,
      entityType,
      entityId,
      metadata,
      createdAt: new Date().toISOString(),
    };
  }

  public static isValidStatusTransition(
    current: BusinessStatus,
    target: BusinessStatus
  ): boolean {
    const validTransitions: Record<BusinessStatus, BusinessStatus[]> = {
      draft: ['pending_review', 'closed'],
      pending_review: ['approved', 'active', 'needs_changes', 'draft', 'closed'],
      needs_changes: ['pending_review', 'draft', 'closed'],
      approved: ['active', 'suspended', 'closed'],
      active: ['suspended', 'closed'],
      suspended: ['active', 'closed'],
      closed: ['draft'],
    };

    return validTransitions[current]?.includes(target) ?? false;
  }
}
