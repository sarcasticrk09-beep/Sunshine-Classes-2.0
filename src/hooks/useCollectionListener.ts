import { useEffect, useRef, useState, useCallback } from 'react';
import { SyncService } from '../services/SyncService';

interface UseCollectionListenerOptions<T> {
  collectionName: string;
  onData: (data: T[]) => void;
  storageKey?: string;
  enabled?: boolean;
  reconnectSignal?: number;
  onHeartbeat?: (collectionName: string) => void;
}

// Global registry for heartbeat timestamps
const listenerHeartbeats: Record<string, number> = {};

/**
 * Hook to manage Connection Watchdog.
 */
export function useFirestoreConnectionWatchdog(checkIntervalMs: number = 30000) {
  const [reconnectSignal, setReconnectSignal] = useState<number>(0);
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [lastCheck, setLastCheck] = useState<number>(Date.now());

  const recordHeartbeat = useCallback((collectionName: string) => {
    listenerHeartbeats[collectionName] = Date.now();
  }, []);

  const triggerReconnect = useCallback(() => {
    setReconnectSignal((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      triggerReconnect();
    };

    window.addEventListener('online', handleOnline);

    const interval = setInterval(() => {
      const now = Date.now();
      setLastCheck(now);
      setIsHealthy(navigator.onLine);
    }, checkIntervalMs);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, [checkIntervalMs, triggerReconnect]);

  return {
    reconnectSignal,
    isHealthy,
    lastCheck,
    recordHeartbeat,
    triggerReconnect,
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

    // Load initial data
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

    // Subscribe to ongoing collection changes
    const unsubscribe = SyncService.subscribe((col, _docId, _data) => {
      if (!isSubscribed) return;
      if (col === collectionName) {
        updateHeartbeat();
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
      }
    });

    return () => {
      isSubscribed = false;
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
