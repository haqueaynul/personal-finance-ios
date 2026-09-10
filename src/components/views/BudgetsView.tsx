import React, { useState } from 'react';
import { Target, AlertCircle, CheckCircle, Flame, Edit3, PieChart as PieIcon, ArrowRight } from 'lucide-react';
import { Category, Transaction, BudgetSettings } from '../../types';
import { CategoryIcon } from '../CategoryIcon';
import { sounds } from '../../utils/audio';

interface BudgetsViewProps {
  categories: Category[];
  transactions: Transaction[];
  settings: BudgetSettings;
  onSelectCategoryForEdit: (category: Category) => void;
  onUpdateOverallBudget: (newBudget: number) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  categories,
  transactions,
  settings,
  onSelectCategoryForEdit,
  onUpdateOverallBudget
}) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [isEditingOverall, setIsEditingOverall] = useState(false);
  const [overallInput, setOverallInput] = useState(settings.overallMonthlyBudget.toString());

  // Calculate monthly spending per category
  const categorySpendMap: Record<string, number> = {};
  let totalSpent = 0;

  transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
    .forEach((t) => {
      categorySpendMap[t.categoryId] = (categorySpendMap[t.categoryId] || 0) + t.amount;
      totalSpent += t.amount;
    });

  const expenseCategories = categories.filter((c) => c.type === 'expense' && c.monthlyBudget > 0);
  const totalAllocated = expenseCategories.reduce((acc, c) => acc + c.monthlyBudget, 0);

  const overallPct = settings.overallMonthlyBudget > 0
    ? Math.round((totalSpent / settings.overallMonthlyBudget) * 100)
    : 0;

  const handleSaveOverall = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(overallInput);
    if (!isNaN(val) && val > 0) {
      sounds.playTap();
      onUpdateOverallBudget(val);
      setIsEditingOverall(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-20 px-4 pt-1 space-y-4">
      {/* iOS Header */}
      <div className="pt-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          Thresholds & Limits
        </span>
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Budgets</h1>
      </div>

      {/* Overall Monthly Budget Card */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-neutral-200/70">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-[#007AFF]" />
            <span className="text-xs font-bold text-neutral-900">Total Monthly Limit</span>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              setIsEditingOverall(!isEditingOverall);
            }}
            className="text-xs font-semibold text-[#007AFF] hover:underline flex items-center gap-1"
          >
            <Edit3 size={12} />
            {isEditingOverall ? 'Close' : 'Adjust'}
          </button>
        </div>

        {isEditingOverall ? (
          <form onSubmit={handleSaveOverall} className="my-2 p-2 bg-neutral-50 rounded-xl flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-500">$</span>
            <input
              type="number"
              step="50"
              value={overallInput}
              onChange={(e) => setOverallInput(e.target.value)}
              className="w-full bg-white text-sm font-bold text-neutral-900 px-2 py-1 rounded-lg border border-neutral-200 outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-[#007AFF] text-white text-xs font-semibold rounded-lg shrink-0"
            >
              Save
            </button>
          </form>
        ) : (
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-neutral-400 ml-1">
                / ${settings.overallMonthlyBudget.toLocaleString()}
              </span>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                overallPct >= 100
                  ? 'bg-red-100 text-red-600'
                  : overallPct >= 90
                  ? 'bg-orange-100 text-orange-600'
                  : overallPct >= 75
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {overallPct}% Used
            </span>
          </div>
        )}

        {/* High Precision Progress Bar */}
        <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden mb-2 relative">
          {/* 75% Caution Marker */}
          <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-amber-400 z-10 opacity-70" title="75% Caution Threshold" />
          {/* 90% Critical Marker */}
          <div className="absolute top-0 bottom-0 left-[90%] w-0.5 bg-red-400 z-10 opacity-70" title="90% Critical Threshold" />

          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPct >= 100
                ? 'bg-[#FF3B30]'
                : overallPct >= 90
                ? 'bg-[#FF9500]'
                : overallPct >= 75
                ? 'bg-[#FFCC00]'
                : 'bg-[#34C759]'
            }`}
            style={{ width: `${Math.min(100, overallPct)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-500">
          <span>
            ${Math.max(0, settings.overallMonthlyBudget - totalSpent).toFixed(2)} remaining
          </span>
          <span>Alerts trigger at 75% and 90%</span>
        </div>
      </div>

      {/* Categories Breakdown Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
          Category Budgets & Alerts
        </span>
        <span className="text-[11px] text-neutral-400">Tap to edit limit</span>
      </div>

      {/* Category Budgets List */}
      <div className="space-y-2.5">
        {expenseCategories.map((cat) => {
          const spent = categorySpendMap[cat.id] || 0;
          const pct = Math.round((spent / cat.monthlyBudget) * 100);
          const remaining = cat.monthlyBudget - spent;
          const isOver = pct >= 100;
          const isCritical = pct >= 90 && !isOver;
          const isCaution = pct >= 75 && pct < 90;

          return (
            <div
              key={cat.id}
              onClick={() => {
                sounds.playTap();
                onSelectCategoryForEdit(cat);
              }}
              className="bg-white rounded-2xl p-3.5 shadow-xs border border-neutral-200/70 cursor-pointer hover:border-[#007AFF] transition active:scale-[0.99]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 leading-tight flex items-center gap-1.5">
                      {cat.name}
                      <Edit3 size={11} className="text-neutral-300" />
                    </h4>
                    <span className="text-[11px] text-neutral-500">
                      ${spent.toFixed(2)} of ${cat.monthlyBudget.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isOver
                        ? 'bg-red-100 text-red-600'
                        : isCritical
                        ? 'bg-orange-100 text-orange-600'
                        : isCaution
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {pct}%
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">
                    {isOver
                      ? `+$${Math.abs(remaining).toFixed(2)} over`
                      : `$${remaining.toFixed(2)} left`}
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, pct)}%`,
                    backgroundColor: isOver
                      ? '#FF3B30'
                      : isCritical
                      ? '#FF9500'
                      : isCaution
                      ? '#FFCC00'
                      : cat.color
                  }}
                />
              </div>

              {/* Status Note */}
              <div className="flex items-center justify-between pt-1.5 text-[10px]">
                <span className="text-neutral-400">
                  {isOver
                    ? '⚠️ Overbudget alert sent'
                    : isCritical
                    ? '🚨 Critical threshold active'
                    : isCaution
                    ? '⚠️ Caution alert active'
                    : '✅ Spending within budget'}
                </span>
                <span className="text-blue-500 font-medium hover:underline">
                  Edit Target
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
