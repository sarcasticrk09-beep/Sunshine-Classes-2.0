import { AuditLog, SubscriptionConfig } from '../types';
import { SyncService } from './SyncService';

export const adminService = {
  /**
   * Reads all central ERP security and event audit logs from 'audit_logs' collection
   */
  async fetchAuditLogs(limitCount: number = 100): Promise<AuditLog[]> {
    const list = await SyncService.list<AuditLog>('audit_logs');
    return list
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, limitCount);
  },

  /**
   * Appends an individual audit log document in the 'audit_logs' collection
   */
  async addAuditLog(userId: string, username: string, action: string, details: string): Promise<void> {
    try {
      const logId = `AUD-SYS-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newLog: AuditLog = {
        id: logId,
        userId: userId || 'SYSTEM',
        username: username || 'system',
        action,
        details,
        timestamp: new Date().toISOString()
      };
      await SyncService.set('audit_logs', logId, newLog);
    } catch (e) {
      console.warn("Failed to write admin service audit log:", e);
    }
  },

  /**
   * Reads central subscription and config parameters from 'settings/subscription_config'
   */
  async fetchSubscriptionConfig(): Promise<SubscriptionConfig | null> {
    return await SyncService.get<SubscriptionConfig>('settings', 'subscription_config');
  },

  /**
   * Updates central configuration parameters document
   */
  async updateSubscriptionConfig(config: SubscriptionConfig): Promise<void> {
    await SyncService.set('settings', 'subscription_config', config, { merge: true });
  }
};
