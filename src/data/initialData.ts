import { Category, Transaction, BudgetSettings, BudgetAlert } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#FF9500', // Apple Orange
    bgColor: 'rgba(255, 149, 0, 0.15)',
    monthlyBudget: 600,
    type: 'expense'
  },
  {
    id: 'groceries',
    name: 'Groceries',
    icon: 'ShoppingCart',
    color: '#34C759', // Apple Green
    bgColor: 'rgba(52, 199, 89, 0.15)',
    monthlyBudget: 500,
    type: 'expense'
  },
  {
    id: 'housing',
    name: 'Housing & Rent',
    icon: 'Home',
    color: '#007AFF', // Apple Blue
    bgColor: 'rgba(0, 122, 255, 0.15)',
    monthlyBudget: 1800,
    type: 'expense'
  },
  {
    id: 'transport',
    name: 'Transportation',
    icon: 'Car',
    color: '#5856D6', // Apple Purple
    bgColor: 'rgba(88, 86, 214, 0.15)',
    monthlyBudget: 250,
    type: 'expense'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#AF52DE', // Apple Indigo
    bgColor: 'rgba(175, 82, 222, 0.15)',
    monthlyBudget: 200,
    type: 'expense'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#FF2D55', // Apple Pink
    bgColor: 'rgba(255, 45, 85, 0.15)',
    monthlyBudget: 300,
    type: 'expense'
  },
  {
    id: 'utilities',
    name: 'Bills & Utilities',
    icon: 'Zap',
    color: '#FFCC00', // Apple Yellow
    bgColor: 'rgba(255, 204, 0, 0.15)',
    monthlyBudget: 220,
    type: 'expense'
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    icon: 'Activity',
    color: '#30B0C7', // Apple Teal
    bgColor: 'rgba(48, 176, 199, 0.15)',
    monthlyBudget: 180,
    type: 'expense'
  },
  {
    id: 'salary',
    name: 'Primary Salary',
    icon: 'Briefcase',
    color: '#34C759',
    bgColor: 'rgba(52, 199, 89, 0.15)',
    monthlyBudget: 0,
    type: 'income'
  },
  {
    id: 'freelance',
    name: 'Freelance & Side Gig',
    icon: 'Laptop',
    color: '#007AFF',
    bgColor: 'rgba(0, 122, 255, 0.15)',
    monthlyBudget: 0,
    type: 'income'
  }
];

// Helper to get formatted date string for recent days
const getRecentDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Monthly Paycheck',
    amount: 5200,
    type: 'income',
    categoryId: 'salary',
    date: getRecentDate(10),
    paymentMethod: 'Bank Transfer',
    merchant: 'Tech Innovations Inc',
    notes: 'Direct deposit',
    createdAt: Date.now() - 86400000 * 10
  },
  {
    id: 'tx-2',
    title: 'Apartment Monthly Rent',
    amount: 1800,
    type: 'expense',
    categoryId: 'housing',
    date: getRecentDate(9),
    paymentMethod: 'Bank Transfer',
    merchant: 'Metro Living Properties',
    notes: 'September lease payment',
    isRecurring: true,
    createdAt: Date.now() - 86400000 * 9
  },
  {
    id: 'tx-3',
    title: 'Whole Foods Market',
    amount: 142.50,
    type: 'expense',
    categoryId: 'groceries',
    date: getRecentDate(7),
    paymentMethod: 'Apple Pay',
    merchant: 'Whole Foods',
    notes: 'Weekly fresh produce & essentials',
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: 'tx-4',
    title: 'Trader Joe\'s Grocery Run',
    amount: 86.20,
    type: 'expense',
    categoryId: 'groceries',
    date: getRecentDate(3),
    paymentMethod: 'Apple Pay',
    merchant: 'Trader Joe\'s',
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'tx-5',
    title: 'Sushi Omakase Dinner',
    amount: 185.00,
    type: 'expense',
    categoryId: 'food',
    date: getRecentDate(6),
    paymentMethod: 'Credit Card',
    merchant: 'Sushi Ginza',
    notes: 'Celebration dinner with team',
    createdAt: Date.now() - 86400000 * 6
  },
  {
    id: 'tx-6',
    title: 'Artisan Coffee & Bakery',
    amount: 24.50,
    type: 'expense',
    categoryId: 'food',
    date: getRecentDate(2),
    paymentMethod: 'Apple Pay',
    merchant: 'Blue Bottle Coffee',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'tx-7',
    title: 'Italian Bistro Dinner',
    amount: 285.00,
    type: 'expense',
    categoryId: 'food',
    date: getRecentDate(1),
    paymentMethod: 'Credit Card',
    merchant: 'Osteria Rustica',
    notes: 'Family weekend dinner',
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: 'tx-8',
    title: 'Gas Station Fuel',
    amount: 68.00,
    type: 'expense',
    categoryId: 'transport',
    date: getRecentDate(5),
    paymentMethod: 'Apple Pay',
    merchant: 'Chevron',
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'tx-9',
    title: 'Subway Monthly Pass',
    amount: 120.00,
    type: 'expense',
    categoryId: 'transport',
    date: getRecentDate(8),
    paymentMethod: 'Debit Card',
    merchant: 'MTA Transit',
    createdAt: Date.now() - 86400000 * 8
  },
  {
    id: 'tx-10',
    title: 'High-Speed Fiber Internet',
    amount: 79.99,
    type: 'expense',
    categoryId: 'utilities',
    date: getRecentDate(4),
    paymentMethod: 'Bank Transfer',
    merchant: 'Verizon Fios',
    isRecurring: true,
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: 'tx-11',
    title: 'Electric & Gas Utility',
    amount: 115.40,
    type: 'expense',
    categoryId: 'utilities',
    date: getRecentDate(5),
    paymentMethod: 'Bank Transfer',
    merchant: 'National Grid',
    isRecurring: true,
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'tx-12',
    title: 'Design UI Consulting Client',
    amount: 850.00,
    type: 'income',
    categoryId: 'freelance',
    date: getRecentDate(3),
    paymentMethod: 'Bank Transfer',
    merchant: 'Acme Studios',
    notes: 'iOS app design audit payout',
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'tx-13',
    title: 'Apple Store Accessories',
    amount: 149.00,
    type: 'expense',
    categoryId: 'shopping',
    date: getRecentDate(2),
    paymentMethod: 'Apple Pay',
    merchant: 'Apple Store 5th Ave',
    notes: 'MagSafe battery pack & cables',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'tx-14',
    title: 'Equinox Gym Membership',
    amount: 140.00,
    type: 'expense',
    categoryId: 'health',
    date: getRecentDate(7),
    paymentMethod: 'Credit Card',
    merchant: 'Equinox Fitness',
    isRecurring: true,
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: 'tx-15',
    title: 'Movie Tickets & IMAX',
    amount: 48.00,
    type: 'expense',
    categoryId: 'entertainment',
    date: getRecentDate(3),
    paymentMethod: 'Apple Pay',
    merchant: 'AMC Theatres',
    createdAt: Date.now() - 86400000 * 3
  }
];

export const INITIAL_SETTINGS: BudgetSettings = {
  overallMonthlyBudget: 4050,
  cautionThreshold: 75,
  criticalThreshold: 90,
  overbudgetThreshold: 100,
  velocityAlerts: true,
  largeExpenseAlertThreshold: 250,
  soundEnabled: true,
  hapticsEnabled: true,
  notificationsAllowed: true
};

export const INITIAL_ALERTS: BudgetAlert[] = [
  {
    id: 'alert-initial-1',
    categoryId: 'food',
    categoryName: 'Food & Dining',
    title: 'Critical: Food & Dining at 82%',
    message: 'You have spent $494.50 of your $600.00 limit. Only $105.50 remaining for this month.',
    percentage: 82.4,
    currentSpend: 494.50,
    budgetLimit: 600.00,
    severity: 'caution',
    type: 'threshold',
    timestamp: Date.now() - 3600000 * 4,
    isRead: false,
    isResolved: false
  },
  {
    id: 'alert-initial-2',
    categoryId: 'food',
    categoryName: 'Food & Dining',
    title: 'Spending Velocity Warning',
    message: 'At your current burn rate of $49.45/day in Dining, you will exceed your monthly budget in 3 days.',
    percentage: 82.4,
    severity: 'critical',
    type: 'velocity',
    timestamp: Date.now() - 3600000 * 2,
    isRead: false,
    isResolved: false
  },
  {
    id: 'alert-initial-3',
    title: 'Large Expense Detected',
    message: 'Italian Bistro Dinner ($285.00) surpassed your large transaction alert threshold of $250.00.',
    severity: 'info',
    type: 'large_transaction',
    timestamp: Date.now() - 3600000 * 18,
    isRead: true,
    isResolved: false
  }
];
