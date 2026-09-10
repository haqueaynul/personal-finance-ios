import React from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Sliders, 
  ShieldCheck, 
  RotateCcw, 
  Sparkles,
  Info,
  Clock
} from 'lucide-react';
import { BudgetAlert, BudgetSettings, Category } from '../../types';
import { sounds } from '../../utils/audio';

interface AlertsViewProps {
  alerts: BudgetAlert[];
  settings: BudgetSettings;
  categories: Category[];
  onMarkRead: (alertId: string) => void;
  onResolveAlert: (alertId: string) => void;
  onClearAllResolved: () => void;
  onUpdateSettings: (newSettings: Partial<BudgetSettings>) => void;
  onTriggerTestAlert: () => void;
  onSelectCategoryBudget: (category: Category) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  settings,
  categories,
  onMarkRead,
  onResolveAlert,
  onClearAllResolved,
  onUpdateSettings,
  onTriggerTestAlert,
  onSelectCategoryBudget
}) => {
  const unresolvedAlerts = alerts.filter((a) => !a.isResolved);
  const resolvedAlerts = alerts.filter((a) => a.isResolved);

  const getAlertIcon = (alert: BudgetAlert) => {
    if (alert.severity === 'danger' || alert.percentage && alert.percentage >= 100) {
      return (
        <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
          <AlertTriangle size={18} />
        </div>
      );
    }
    if (alert.type === 'velocity') {
      return (
        <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
          <Flame size={18} />
        </div>
      );
    }
    if (alert.severity === 'critical') {
      return (
        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
          <AlertTriangle size={18} />
        </div>
      );
    }
    if (alert.severity === 'caution') {
      return (
        <div className="w-9 h-9 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0">
          <Bell size={18} />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
        <Info size={18} />
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-20 px-4 pt-1 space-y-4">
      {/* iOS Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Real-Time Engine
          </span>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Budget Alerts</h1>
        </div>

        <button
          onClick={() => {
            sounds.playAlertWarning();
            onTriggerTestAlert();
          }}
          className="px-3 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-neutral-800 transition"
          title="Simulate automated budget alert"
        >
          <Sparkles size={13} className="text-amber-300" />
          Test Alert
        </button>
      </div>

      {/* iOS Notification System Status Card */}
      <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-neutral-200/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-xs font-bold text-neutral-900 block">
              Automated Alerts: {settings.notificationsAllowed ? 'Active' : 'Muted'}
            </span>
            <span className="text-[10px] text-neutral-400">
              Evaluates thresholds on every expense entry
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playTap();
            onUpdateSettings({ notificationsAllowed: !settings.notificationsAllowed });
          }}
          className={`w-11 h-6 rounded-full transition-colors relative ${
            settings.notificationsAllowed ? 'bg-[#34C759]' : 'bg-neutral-300'
          }`}
        >
          <span
            className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-xs ${
              settings.notificationsAllowed ? 'left-[22px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* Active Alerts Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
            Active Alerts
            {unresolvedAlerts.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {unresolvedAlerts.length}
              </span>
            )}
          </span>
          {resolvedAlerts.length > 0 && (
            <button
              onClick={onClearAllResolved}
              className="text-[11px] text-neutral-400 hover:text-neutral-700"
            >
              Clear resolved
            </button>
          )}
        </div>

        {unresolvedAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-neutral-200/70">
            <CheckCircle2 size={32} className="mx-auto mb-1.5 text-emerald-500" />
            <p className="text-xs font-bold text-neutral-800">All Budgets In Good Standing</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              No categories have breached caution or critical thresholds.
            </p>
          </div>
        ) : (
          unresolvedAlerts.map((alert) => {
            const cat = alert.categoryId
              ? categories.find((c) => c.id === alert.categoryId)
              : null;

            return (
              <div
                key={alert.id}
                onClick={() => onMarkRead(alert.id)}
                className={`bg-white rounded-2xl p-3.5 shadow-xs border transition flex flex-col gap-2.5 ${
                  !alert.isRead ? 'border-[#007AFF]/60 ring-1 ring-[#007AFF]/20' : 'border-neutral-200/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-neutral-900 truncate">
                        {alert.title}
                      </span>
                      <span className="text-[10px] text-neutral-400 shrink-0 flex items-center gap-0.5">
                        <Clock size={10} />
                        {new Date(alert.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                      {alert.message}
                    </p>

                    {alert.percentage && (
                      <div className="mt-2 w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            alert.percentage >= 100
                              ? 'bg-red-500'
                              : alert.percentage >= 90
                              ? 'bg-orange-500'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${Math.min(100, alert.percentage)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Alert Actions Bar */}
                <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-xs">
                  {cat && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playTap();
                        onSelectCategoryBudget(cat);
                      }}
                      className="text-[#007AFF] font-medium text-[11px] hover:underline"
                    >
                      Adjust {cat.name} Budget
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playTap();
                      onResolveAlert(alert.id);
                    }}
                    className="ml-auto px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium text-[10px] transition"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Automated Threshold Configuration */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/70 space-y-3">
        <div className="flex items-center gap-2">
          <Sliders size={16} className="text-[#007AFF]" />
          <h3 className="text-xs font-bold text-neutral-900">Alert Rules & Triggers</h3>
        </div>

        {/* Caution Threshold Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-600 font-medium">Notice Threshold:</span>
            <span className="font-bold text-amber-600">{settings.cautionThreshold}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="85"
            step="5"
            value={settings.cautionThreshold}
            onChange={(e) => onUpdateSettings({ cautionThreshold: parseInt(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Critical Threshold Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-600 font-medium">Critical Alert Threshold:</span>
            <span className="font-bold text-orange-600">{settings.criticalThreshold}%</span>
          </div>
          <input
            type="range"
            min="80"
            max="98"
            step="2"
            value={settings.criticalThreshold}
            onChange={(e) => onUpdateSettings({ criticalThreshold: parseInt(e.target.value) })}
            className="w-full accent-orange-500 cursor-pointer"
          />
        </div>

        {/* Spend Velocity Forecast Toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
          <div>
            <span className="text-xs font-bold text-neutral-900 block">Burn Rate Velocity Forecast</span>
            <span className="text-[10px] text-neutral-400">
              Predicts overspending before month ends
            </span>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              onUpdateSettings({ velocityAlerts: !settings.velocityAlerts });
            }}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              settings.velocityAlerts ? 'bg-[#34C759]' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-xs ${
                settings.velocityAlerts ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
