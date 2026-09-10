export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 
  | 'Apple Pay' 
  | 'Credit Card' 
  | 'Debit Card' 
  | 'Cash' 
  | 'Bank Transfer';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  monthlyBudget: number;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  merchant?: string;
  isRecurring?: boolean;
  createdAt: number;
}

export type AlertSeverity = 'info' | 'caution' | 'critical' | 'danger';

export type AlertType = 'threshold' | 'velocity' | 'large_transaction';

export interface BudgetAlert {
  id: string;
  categoryId?: string;
  categoryName?: string;
  title: string;
  message: string;
  percentage?: number;
  currentSpend?: number;
  budgetLimit?: number;
  severity: AlertSeverity;
  type: AlertType;
  timestamp: number;
  isRead: boolean;
  isResolved: boolean;
}

export interface BudgetSettings {
  overallMonthlyBudget: number;
  cautionThreshold: number;   // default 75%
  criticalThreshold: number;  // default 90%
  overbudgetThreshold: number; // default 100%
  velocityAlerts: boolean;    // predict overspending based on current day of month
  largeExpenseAlertThreshold: number; // e.g. $250
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsAllowed: boolean;
}

export type TabType = 'dashboard' | 'expenses' | 'budgets' | 'alerts' | 'code';

export interface SwiftCodeFile {
  name: string;
  filename: string;
  description: string;
  code: string;
}
