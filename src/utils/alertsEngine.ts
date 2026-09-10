import { Category, Transaction, BudgetSettings, BudgetAlert } from '../types';

export function evaluateBudgetAlerts(
  transactions: Transaction[],
  categories: Category[],
  settings: BudgetSettings,
  existingAlerts: BudgetAlert[]
): BudgetAlert[] {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const now = new Date();
  const dayOfMonth = Math.max(1, now.getDate());
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // Filter current month expenses
  const monthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonth)
  );

  // Group by category
  const categorySpendMap: Record<string, number> = {};
  categories.forEach((cat) => {
    categorySpendMap[cat.id] = 0;
  });

  let totalMonthSpend = 0;

  monthExpenses.forEach((t) => {
    categorySpendMap[t.categoryId] = (categorySpendMap[t.categoryId] || 0) + t.amount;
    totalMonthSpend += t.amount;
  });

  const generatedAlerts: BudgetAlert[] = [];

  // 1. Category Threshold Alerts
  categories.forEach((cat) => {
    if (cat.type !== 'expense' || !cat.monthlyBudget || cat.monthlyBudget <= 0) return;

    const spend = categorySpendMap[cat.id] || 0;
    const percentage = Math.round((spend / cat.monthlyBudget) * 1000) / 10;
    const remaining = cat.monthlyBudget - spend;

    if (percentage >= settings.overbudgetThreshold) {
      generatedAlerts.push({
        id: `alert-overbudget-${cat.id}-${currentMonth}`,
        categoryId: cat.id,
        categoryName: cat.name,
        title: `Overbudget: ${cat.name}`,
        message: `Exceeded budget by $${Math.abs(remaining).toFixed(2)} (${percentage}% used). Current spend: $${spend.toFixed(2)} / $${cat.monthlyBudget.toFixed(2)}.`,
        percentage,
        currentSpend: spend,
        budgetLimit: cat.monthlyBudget,
        severity: 'danger',
        type: 'threshold',
        timestamp: Date.now(),
        isRead: false,
        isResolved: false
      });
    } else if (percentage >= settings.criticalThreshold) {
      generatedAlerts.push({
        id: `alert-crit-${cat.id}-${currentMonth}`,
        categoryId: cat.id,
        categoryName: cat.name,
        title: `Critical: ${cat.name} at ${percentage}%`,
        message: `You have used ${percentage}% of your limit. Only $${remaining.toFixed(2)} remaining for this month.`,
        percentage,
        currentSpend: spend,
        budgetLimit: cat.monthlyBudget,
        severity: 'critical',
        type: 'threshold',
        timestamp: Date.now(),
        isRead: false,
        isResolved: false
      });
    } else if (percentage >= settings.cautionThreshold) {
      generatedAlerts.push({
        id: `alert-caution-${cat.id}-${currentMonth}`,
        categoryId: cat.id,
        categoryName: cat.name,
        title: `Notice: ${cat.name} at ${percentage}%`,
        message: `Approaching budget limit. $${remaining.toFixed(2)} remaining of $${cat.monthlyBudget.toFixed(2)}.`,
        percentage,
        currentSpend: spend,
        budgetLimit: cat.monthlyBudget,
        severity: 'caution',
        type: 'threshold',
        timestamp: Date.now(),
        isRead: false,
        isResolved: false
      });
    }

    // Velocity alert: If spending rate projects exceeding budget early
    if (settings.velocityAlerts && percentage >= 50 && percentage < settings.overbudgetThreshold) {
      const dailyBurnRate = spend / dayOfMonth;
      const projectedMonthSpend = dailyBurnRate * daysInMonth;

      if (projectedMonthSpend > cat.monthlyBudget * 1.15) {
        const daysUntilBust = Math.max(1, Math.floor(remaining / dailyBurnRate));
        if (daysUntilBust < (daysInMonth - dayOfMonth)) {
          generatedAlerts.push({
            id: `alert-velocity-${cat.id}-${currentMonth}`,
            categoryId: cat.id,
            categoryName: cat.name,
            title: `Burn Rate Warning: ${cat.name}`,
            message: `At your pace of $${dailyBurnRate.toFixed(2)}/day, you will exhaust your budget in ${daysUntilBust} days (${daysInMonth - dayOfMonth} days left in month).`,
            percentage,
            severity: 'critical',
            type: 'velocity',
            timestamp: Date.now() - 60000,
            isRead: false,
            isResolved: false
          });
        }
      }
    }
  });

  // 2. Overall Monthly Budget Threshold
  if (settings.overallMonthlyBudget > 0) {
    const overallPct = Math.round((totalMonthSpend / settings.overallMonthlyBudget) * 1000) / 10;
    if (overallPct >= settings.overbudgetThreshold) {
      generatedAlerts.push({
        id: `alert-overall-over-${currentMonth}`,
        title: `Total Monthly Budget Exceeded`,
        message: `Total expenses ($${totalMonthSpend.toFixed(2)}) exceed your overall monthly limit ($${settings.overallMonthlyBudget.toFixed(2)}) by $${(totalMonthSpend - settings.overallMonthlyBudget).toFixed(2)}.`,
        percentage: overallPct,
        currentSpend: totalMonthSpend,
        budgetLimit: settings.overallMonthlyBudget,
        severity: 'danger',
        type: 'threshold',
        timestamp: Date.now(),
        isRead: false,
        isResolved: false
      });
    } else if (overallPct >= settings.criticalThreshold) {
      generatedAlerts.push({
        id: `alert-overall-crit-${currentMonth}`,
        title: `Overall Budget at ${overallPct}%`,
        message: `Total spend is $${totalMonthSpend.toFixed(2)} out of $${settings.overallMonthlyBudget.toFixed(2)}. Slow down discretionary spending.`,
        percentage: overallPct,
        currentSpend: totalMonthSpend,
        budgetLimit: settings.overallMonthlyBudget,
        severity: 'critical',
        type: 'threshold',
        timestamp: Date.now(),
        isRead: false,
        isResolved: false
      });
    }
  }

  // Deduplicate and retain read / resolved state from existing alerts
  const alertMap = new Map<string, BudgetAlert>();
  
  // Keep previous user actions
  existingAlerts.forEach(alert => {
    alertMap.set(alert.id, alert);
  });

  // Merge newly evaluated
  generatedAlerts.forEach(newAlert => {
    const existing = alertMap.get(newAlert.id);
    if (existing) {
      alertMap.set(newAlert.id, {
        ...newAlert,
        isRead: existing.isRead,
        isResolved: existing.isResolved,
        timestamp: existing.timestamp
      });
    } else {
      alertMap.set(newAlert.id, newAlert);
    }
  });

  return Array.from(alertMap.values()).sort((a, b) => b.timestamp - a.timestamp);
}
