import React from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Plus, 
  AlertTriangle, 
  ChevronRight, 
  Flame, 
  TrendingUp, 
  ShieldCheck, 
  BellRing,
  Wallet
} from 'lucide-react';
import { Category, Transaction, BudgetSettings, BudgetAlert, TabType } from '../../types';
import { CategoryIcon } from '../CategoryIcon';
import { sounds } from '../../utils/audio';

interface DashboardViewProps {
  transactions: Transaction[];
  categories: Category[];
  settings: BudgetSettings;
  alerts: BudgetAlert[];
  onOpenAddModal: () => void;
  onNavigateTab: (tab: TabType) => void;
  onSelectCategoryBudget: (category: Category) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  categories,
  settings,
  alerts,
  onOpenAddModal,
  onNavigateTab,
  onSelectCategoryBudget
}) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthProgressPct = Math.round((dayOfMonth / daysInMonth) * 100);

  // Month transactions
  const monthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));
  
  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  // Category spending calculation
  const categorySpendMap: Record<string, number> = {};
  monthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categorySpendMap[t.categoryId] = (categorySpendMap[t.categoryId] || 0) + t.amount;
    });

  // Calculate overall budget percent
  const overallBudget = settings.overallMonthlyBudget || 4050;
  const overallBudgetPct = Math.min(100, Math.round((totalExpense / overallBudget) * 100));

  // Critical and unresolved alerts
  const unresolvedAlerts = alerts.filter((a) => !a.isResolved);
  const topCriticalAlert = unresolvedAlerts.find(
    (a) => a.severity === 'danger' || a.severity === 'critical'
  ) || unresolvedAlerts[0];

  // Recent 4 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Top 3 expense categories
  const topCategories = categories
    .filter((c) => c.type === 'expense' && c.monthlyBudget > 0)
    .map((cat) => {
      const spent = categorySpendMap[cat.id] || 0;
      const pct = Math.round((spent / cat.monthlyBudget) * 100);
      return { ...cat, spent, pct };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-20 px-4 pt-1 space-y-4">
      {/* iOS App Navigation Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Finances</h1>
        </div>

        <button
          id="quick-add-expense-btn"
          onClick={() => {
            sounds.playTap();
            onOpenAddModal();
          }}
          className="w-10 h-10 rounded-full bg-[#007AFF] text-white flex items-center justify-center shadow-md hover:bg-blue-600 active:scale-95 transition"
          title="Log Transaction"
        >
          <Plus size={20} strokeWidth={2.6} />
        </button>
      </div>

      {/* Automated Alert Banner (if any alert is active) */}
      {topCriticalAlert && (
        <div
          onClick={() => {
            sounds.playTap();
            onNavigateTab('alerts');
          }}
          className={`p-3 rounded-2xl cursor-pointer transition shadow-xs flex items-center justify-between border ${
            topCriticalAlert.severity === 'danger'
              ? 'bg-red-50/90 border-red-200 text-red-900'
              : topCriticalAlert.severity === 'critical'
              ? 'bg-orange-50/90 border-orange-200 text-orange-900'
              : 'bg-amber-50/90 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                topCriticalAlert.severity === 'danger'
                  ? 'bg-red-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {topCriticalAlert.type === 'velocity' ? (
                <Flame size={15} />
              ) : (
                <AlertTriangle size={15} />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate leading-tight">
                {topCriticalAlert.title}
              </span>
              <span className="text-[11px] opacity-80 block truncate leading-tight mt-0.5">
                {topCriticalAlert.message}
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="opacity-50 shrink-0 ml-2" />
        </div>
      )}

      {/* Main Cash Flow Card (Apple Card Aesthetic) */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-[#1C1C1E] via-[#2C2C2E] to-[#1C1C1E] text-white shadow-xl relative overflow-hidden">
        {/* Subtle mesh background accent */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
          <span className="font-medium flex items-center gap-1.5">
            <Wallet size={13} className="text-blue-400" />
            Net Monthly Savings
          </span>
          <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-400">
            {savingsRate}% Saved
          </span>
        </div>

        <div className="text-3xl font-extrabold tracking-tight text-white mb-4">
          ${netSavings >= 0 ? netSavings.toLocaleString('en-US', { minimumFractionDigits: 2 }) : `-${Math.abs(netSavings).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        </div>

        {/* Income vs Expenses Split */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowDownRight size={14} />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block">Total Income</span>
              <span className="font-bold text-white text-xs">${totalIncome.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ArrowUpRight size={14} />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block">Total Spent</span>
              <span className="font-bold text-white text-xs">${totalExpense.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spending Velocity & Monthly Pace Meter */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/70">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={15} className="text-[#007AFF]" />
            <span className="text-xs font-semibold text-neutral-800">Monthly Budget Velocity</span>
          </div>
          <span className="text-[11px] font-bold text-neutral-500">
            Day {dayOfMonth} of {daysInMonth}
          </span>
        </div>

        <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden mb-2 relative">
          {/* Day of month progress marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-neutral-400 z-10"
            style={{ left: `${monthProgressPct}%` }}
            title={`Month Day: ${monthProgressPct}%`}
          />
          {/* Spend progress bar */}
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallBudgetPct > monthProgressPct + 15
                ? 'bg-red-500'
                : overallBudgetPct > monthProgressPct
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, overallBudgetPct)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-500">
            ${totalExpense.toFixed(0)} spent of ${overallBudget.toLocaleString()} limit
          </span>
          <span
            className={`font-semibold ${
              overallBudgetPct > monthProgressPct + 15
                ? 'text-red-500'
                : 'text-emerald-600'
            }`}
          >
            {overallBudgetPct > monthProgressPct + 15
              ? 'Burning Fast'
              : 'Pace On Track'}
          </span>
        </div>
      </div>

      {/* Category Budgets Watchlist */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
            Budget Watchlist
          </span>
          <button
            onClick={() => {
              sounds.playTap();
              onNavigateTab('budgets');
            }}
            className="text-xs font-semibold text-[#007AFF] hover:underline flex items-center"
          >
            View All <ChevronRight size={13} />
          </button>
        </div>

        <div className="space-y-2">
          {topCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategoryBudget(cat)}
              className="bg-white rounded-2xl p-3 shadow-xs border border-neutral-200/70 flex flex-col gap-2 cursor-pointer hover:border-blue-300 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} size={15} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block leading-tight">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      ${cat.spent.toFixed(2)} of ${cat.monthlyBudget.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      cat.pct >= 100
                        ? 'bg-red-100 text-red-600'
                        : cat.pct >= 85
                        ? 'bg-orange-100 text-orange-600'
                        : cat.pct >= 75
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {cat.pct}%
                  </span>
                </div>
              </div>

              {/* Mini progress track */}
              <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, cat.pct)}%`,
                    backgroundColor:
                      cat.pct >= 100 ? '#FF3B30' : cat.pct >= 85 ? '#FF9500' : cat.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
            Recent Activity
          </span>
          <button
            onClick={() => {
              sounds.playTap();
              onNavigateTab('expenses');
            }}
            className="text-xs font-semibold text-[#007AFF] hover:underline flex items-center"
          >
            See More <ChevronRight size={13} />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/70 divide-y divide-neutral-100 overflow-hidden">
          {recentTransactions.map((tx) => {
            const cat = categories.find((c) => c.id === tx.categoryId);
            const isExpense = tx.type === 'expense';
            return (
              <div key={tx.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: cat ? cat.color : '#8E8E93' }}
                  >
                    <CategoryIcon name={cat ? cat.icon : 'DollarSign'} size={15} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-neutral-900 block truncate">
                      {tx.title}
                    </span>
                    <span className="text-[10px] text-neutral-400 block truncate">
                      {tx.paymentMethod} • {tx.date}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-bold ${
                      isExpense ? 'text-neutral-900' : 'text-[#34C759]'
                    }`}
                  >
                    {isExpense ? '-' : '+'}${tx.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
