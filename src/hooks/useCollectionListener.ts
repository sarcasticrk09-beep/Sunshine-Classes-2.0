import { useEffect, useRef, useState, useCallback } from 'react';
import { SyncService, isBenignOfflineOrFallbackError } from '../services/SyncService';

interface UseCollectionListenerOptions<T> {
  collectionName: string;
  onData: (data: T[]) => void;
  storageKey?: string;
  enabled?: boolean;
  reconnectSignal?: number;
  onHeartbeat?: (collectionName: string) => void;
}

export interface DbWatchdogErrorEvent {
  error: any;
  errorMessage: string;
  errorCode?: string;
  latencyMs: number;
  timestamp: string;
  source: 'probe' | 'network' | 'manual';
}

export interface DbWatchdogStatusEvent {
  isHealthy: boolean;
  latencyMs?: number;
  lastCheck: number;
  consecutiveFailures: number;
  details?: any;
}

export interface DbWatchdogOptions {
  onError?: (event: DbWatchdogErrorEvent) => void;
  onStatusChange?: (isHealthy: boolean, details: any) => void;
  enabled?: boolean;
}

// Global registry for heartbeat timestamps
const listenerHeartbeats: Record<string, number> = {};

/**
 * Hook to manage Database Connection Watchdog (Supabase / Network).
 * Actively monitors Supabase connection health, round-trip timing, and errors.
 */
export function useDbConnectionWatchdog(
  checkIntervalMs: number = 30000,
  options?: DbWatchdogOptions
) {
  const [reconnectSignal, setReconnectSignal] = useState<number>(0);
  const [isHealthy, setIsHealthy] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [lastError, setLastError] = useState<any>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState<number>(0);
  const lastCheckRef = useRef<number>(Date.now());
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const recordHeartbeat = useCallback((collectionName: string) => {
    listenerHeartbeats[collectionName] = Date.now();
  }, []);

  const triggerReconnect = useCallback(() => {
    setReconnectSignal((prev) => prev + 1);
  }, []);

  const checkConnection = useCallback(async (source: 'probe' | 'network' | 'manual' = 'probe') => {
    lastCheckRef.current = Date.now();
    try {
      const res = await SyncService.checkConnection();
      setLatencyMs(res.latencyMs);

      if (res.connected) {
        setLastError(null);
        setConsecutiveFailures(0);
        setIsHealthy((prev) => {
          if (!prev) {
            triggerReconnect();
            optionsRef.current?.onStatusChange?.(true, { latencyMs: res.latencyMs, details: res.details });
          }
          return true;
        });
        return res;
      } else {
        const errorInfo: DbWatchdogErrorEvent = {
          error: res.error,
          errorMessage: res.error?.message || (typeof res.error === 'string' ? res.error : JSON.stringify(res.error)),
          errorCode: res.error?.code || res.details?.code,
          latencyMs: res.latencyMs,
          timestamp: new Date().toISOString(),
          source
        };
        setLastError(res.error);
        setConsecutiveFailures((prev) => prev + 1);
        setIsHealthy((prev) => {
          if (prev) {
            optionsRef.current?.onStatusChange?.(false, { error: res.error, latencyMs: res.latencyMs, details: res.details });
          }
          return false;
        });
        const isSchemaOrPermissionFallback =
          isBenignOfflineOrFallbackError(res.error) ||
          res.error?.code === 'PGRST205' ||
          res.details?.code === 'PGRST205' ||
          res.error?.code === 'PGRST204' ||
          res.details?.code === 'PGRST204' ||
          res.error?.code === '22P02' ||
          res.details?.code === '22P02' ||
          res.error?.code === '42501' ||
          res.details?.code === '42501';

        if (!isSchemaOrPermissionFallback) {
          optionsRef.current?.onError?.(errorInfo);
        }
        return res;
      }
    } catch (err: any) {
      const errorInfo: DbWatchdogErrorEvent = {
        error: err,
        errorMessage: err?.message || String(err),
        errorCode: err?.code,
        latencyMs: 0,
        timestamp: new Date().toISOString(),
        source
      };
      setLastError(err);
      setConsecutiveFailures((prev) => prev + 1);
      setIsHealthy(false);
      if (!isBenignOfflineOrFallbackError(err)) {
        optionsRef.current?.onError?.(errorInfo);
      }
      return { connected: false, latencyMs: 0, error: err };
    }
  }, [triggerReconnect]);

  // Periodic health probe
  useEffect(() => {
    if (options?.enabled === false) return;

    // Run initial probe on mount
    checkConnection('probe');

    const intervalId = setInterval(() => {
      checkConnection('probe');
    }, Math.max(checkIntervalMs, 5000));

    return () => {
      clearInterval(intervalId);
    };
  }, [checkIntervalMs, options?.enabled, checkConnection]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      lastCheckRef.current = Date.now();
      checkConnection('network');
    };

    const handleOffline = () => {
      setIsHealthy(false);
      lastCheckRef.current = Date.now();
      const offlineErr = new Error('Browser is offline');
      setLastError(offlineErr);
      optionsRef.current?.onError?.({
        error: offlineErr,
        errorMessage: 'Browser is offline',
        latencyMs: 0,
        timestamp: new Date().toISOString(),
        source: 'network'
      });
      optionsRef.current?.onStatusChange?.(false, { error: offlineErr });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  return {
    reconnectSignal,
    isHealthy,
    lastCheck: lastCheckRef.current,
    lastError,
    latencyMs,
    consecutiveFailures,
    recordHeartbeat,
    triggerReconnect,
    checkNow: () => checkConnection('manual'),
  };
}

/**
 * Custom React hook for listening to a collection and updating state in real-time.
 */
export function useCollectionListener<T = any>({
  collectionName,
  onData,
  storageKey,
  enabled = true,
  reconnectSignal = 0,
  onHeartbeat,
}: UseCollectionListenerOptions<T>) {
  const onDataRef = useRef(onData);
  const onHeartbeatRef = useRef(onHeartbeat);
  const debounceTimerRef = useRef<any>(null);

  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    onHeartbeatRef.current = onHeartbeat;
  }, [onHeartbeat]);

  useEffect(() => {
    if (!enabled || !collectionName) return;

    let isSubscribed = true;

    const updateHeartbeat = () => {
      listenerHeartbeats[collectionName] = Date.now();
      if (onHeartbeatRef.current) {
        onHeartbeatRef.current(collectionName);
      }
    };

    // Load initial data once on mount / reconnect
    SyncService.list<T>(collectionName).then((items) => {
      if (!isSubscribed) return;
      updateHeartbeat();
      if (items && items.length > 0) {
        onDataRef.current(items);
        if (storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(items));
          } catch (e) {}
        }
      }
    }).catch(() => {});

    // Subscribe to ongoing collection changes with debouncing to prevent thrashing
    const unsubscribe = SyncService.subscribe((col, _docId, _data) => {
      if (!isSubscribed) return;
      if (col === collectionName) {
        updateHeartbeat();
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          if (!isSubscribed) return;
          SyncService.list<T>(collectionName).then((items) => {
            if (!isSubscribed) return;
            if (items && items.length > 0) {
              onDataRef.current(items);
              if (storageKey) {
                try {
                  localStorage.setItem(storageKey, JSON.stringify(items));
                } catch (e) {}
              }
            }
          }).catch(() => {});
        }, 200);
      }
    });

    return () => {
      isSubscribed = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      unsubscribe();
    };
  }, [collectionName, enabled, storageKey, reconnectSignal]);
}

// Dedicated listener hooks with Watchdog reconnect support
export function useStudentsListener(
  onData: (students: any[]) => void,
  reconnectSignal?: number,
  enabled: boolean = true
) {
  useCollectionListener({
    collectionName: 'students',
    storageKey: 'sunshine_students',
    onData,
    reconnectSignal,
    enabled,
  });
}

export function useTeachersListener(
  onData: (teachers: any[]) => void,
  reconnectSignal?: number,
  enabled: boolean = true
) {
  useCollectionListener({
    collectionName: 'teachers',
    storageKey: 'sunshine_teachers',
    onData,
    reconnectSignal,
    enabled,
  });
}

export function useAdmissionsListener(
  onData: (admissions: any[]) => void,
  reconnectSignal?: number,
  enabled: boolean = true
) {
  useCollectionListener({
    collectionName: 'admissions',
    storageKey: 'sunshine_admissions',
    onData,
    reconnectSignal,
    enabled,
  });
}

export function useFeeStatusesListener(
  onData: (feeStatuses: any[]) => void,
  reconnectSignal?: number,
  enabled: boolean = true
) {
  useCollectionListener({
    collectionName: 'fee_statuses',
    storageKey: 'sunshine_fee_statuses',
    onData,
    reconnectSignal,
    enabled,
  });
}

export function useUsersListener(
  onData: (users: any[]) => void,
  reconnectSignal?: number,
  enabled: boolean = true
) {
  useCollectionListener({
    collectionName: 'users',
    storageKey: 'sunshine_users',
    onData,
    reconnectSignal,
    enabled,
  });
}

export function useClassesListener(
  onData: (classes: any[]) => void,
  reconnectSignal?: number,
  enabled: boolean = true
) {
  useCollectionListener({
    collectionName: 'classes',
    storageKey: 'sunshine_classes',
    onData,
    reconnectSignal,
    enabled,
  });
}

export function useFeesListener(
  onData: (fees: any[]) => void,
  reconnectSignal?: number,
  enabled: boolean = true
) {
  useCollectionListener({
    collectionName: 'fees',
    storageKey: 'sunshine_fees',
    onData,
    reconnectSignal,
    enabled,
  });
}

export function usePaymentsListener(
  onData: (payments: any[]) => void,
  reconnectSignal?: number,
  enabled: boolean = true
) {
  useCollectionListener({
    collectionName: 'payments',
    storageKey: 'sunshine_payments',
    onData,
    reconnectSignal,
    enabled,
  });
}

export function useAttendanceListener(
  onData: (attendance: any[]) => void,
  reconnectSignal?: number,
  enabled: boolean = true
) {
  useCollectionListener({
    collectionName: 'attendance',
    storageKey: 'sunshine_attendance',
    onData,
    reconnectSignal,
    enabled,
  });
}

export function useNotificationsListener(
  onData: (notifications: any[]) => void,
  reconnectSignal?: number,
  enabled: boolean = true
) {
  useCollectionListener({
    collectionName: 'notifications',
    storageKey: 'sunshine_notifications',
    onData,
    reconnectSignal,
    enabled,
  });
}

export function useAuditLogsListener(
  onData: (auditLogs: any[]) => void,
  reconnectSignal?: number,
  enabled: boolean = true
) {
  useCollectionListener({
    collectionName: 'audit_logs',
    storageKey: 'sunshine_audit_logs',
    onData,
    reconnectSignal,
    enabled,
  });
}
