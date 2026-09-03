export class AuditLogger {
  private static saveToDbFn?: (logItem: any) => Promise<void>;

  public static setDatabaseLogger(fn: (logItem: any) => Promise<void>) {
    this.saveToDbFn = fn;
  }

  public static async log(
    action: string,
    username: string,
    details: string,
    status: 'SUCCESS' | 'FAILURE' = 'SUCCESS',
    userId?: string
  ) {
    const timestamp = new Date().toISOString();
    console.log(`[ERP AUDIT LOG] [${timestamp}] [${status}] User: ${username} | Action: ${action} | Details: ${details}`);

    if (this.saveToDbFn) {
      try {
        await this.saveToDbFn({
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userId: userId || username || 'SYSTEM',
          username: username || 'system',
          action,
          details: `[${status}] ${details}`,
          status,
          timestamp
        });
      } catch (err: any) {
        console.warn('[AuditLogger] Failed to persist audit log to database:', err?.message);
      }
    }
  }
}

