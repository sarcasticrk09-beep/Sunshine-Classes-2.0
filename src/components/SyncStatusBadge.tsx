import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { SyncService, GlobalSyncStatus } from '../services/SyncService';

interface SyncStatusBadgeProps {
  className?: string;
  showDetails?: boolean;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  className = '',
  showDetails = false
}) => {
  const [status, setStatus] = useState<GlobalSyncStatus>(() => SyncService.getSyncStatus());
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const unsubscribe = SyncService.onStatusChange((newStatus, msg) => {
      setStatus(newStatus);
      if (msg) setStatusMessage(msg);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleManualRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    try {
      await SyncService.flushTransactionLog();
      SyncService.setStatus('synced', 'All changes synchronized');
    } catch (e: any) {
      SyncService.setStatus('error', e?.message || 'Sync failed');
    } finally {
      setTimeout(() => setIsRetrying(false), 800);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />,
          label: 'Saving Changes...',
          subtitle: 'Syncing with Supabase',
          color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50'
        };
      case 'offline':
        return {
          icon: <CloudOff className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Saved on Device',
          subtitle: 'Will sync when connection restores',
          color: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" />,
          label: 'Sync Paused',
          subtitle: statusMessage || 'Click to retry synchronization',
          color: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50'
        };
      case 'synced':
      default:
        return {
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />,
          label: 'Synced ☀️',
          subtitle: 'All student data backed up securely',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      id="container-sync-status-badge"
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        id="btn-sync-status-indicator"
        type="button"
        onClick={handleManualRetry}
        title={config.subtitle}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-all duration-200 hover:shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${config.color}`}
      >
        {isRetrying ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
        ) : (
          config.icon
        )}
        <span className="font-sans whitespace-nowrap">{isRetrying ? 'Syncing...' : config.label}</span>
      </button>

      {/* Student-friendly contextual popup */}
      {(showTooltip || showDetails) && (
        <div
          id="popover-sync-details"
          className="absolute top-full left-0 mt-1.5 z-50 w-64 p-3 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-xs transition-opacity duration-150"
        >
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
              {config.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800 dark:text-slate-100">{config.label}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                {config.subtitle}
              </p>
            </div>
          </div>
          {status === 'error' && (
            <button
              id="btn-retry-cloud-sync"
              onClick={handleManualRetry}
              className="mt-2.5 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-[11px] transition-colors"
            >
              Retry Sync Now
            </button>
          )}
        </div>
      )}
    </div>
  );
};
