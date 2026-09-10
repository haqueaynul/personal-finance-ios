/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Transaction, 
  Category, 
  BudgetSettings, 
  BudgetAlert, 
  TabType 
} from './types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_SETTINGS, 
  INITIAL_ALERTS 
} from './data/initialData';
import { evaluateBudgetAlerts } from './utils/alertsEngine';
import { sounds } from './utils/audio';

import { IPhoneFrame } from './components/IPhoneFrame';
import { TabBar } from './components/TabBar';
import { DashboardView } from './components/views/DashboardView';
import { ExpensesView } from './components/views/ExpensesView';
import { BudgetsView } from './components/views/BudgetsView';
import { AlertsView } from './components/views/AlertsView';
import { CodeHubView } from './components/views/CodeHubView';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { EditCategoryBudgetModal } from './components/modals/EditCategoryBudgetModal';

export default function App() {
  // Persistence state initialized from localStorage or initial seed
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('finance_categories');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('finance_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [settings, setSettings] = useState<BudgetSettings>(() => {
    try {
      const saved = localStorage.getItem('finance_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [alerts, setAlerts] = useState<BudgetAlert[]>(() => {
    try {
      const saved = localStorage.getItem('finance_alerts');
      return saved ? JSON.parse(saved) : INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  });

  // Navigation and active screen state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Dynamic Island notification banner
  const [activeNotification, setActiveNotification] = useState<BudgetAlert | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categoryForEdit, setCategoryForEdit] = useState<Category | null>(null);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('finance_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('finance_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Handler: Add a new transaction with automated budget check
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now()
    };

    const updatedTransactions = [newTx, ...transactions];
    setTransactions(updatedTransactions);

    // Re-evaluate automated budget alerts
    const freshAlerts = evaluateBudgetAlerts(
      updatedTransactions,
      categories,
      settings,
      alerts
    );
    setAlerts(freshAlerts);

    // If an alert was generated or touched by this category
    const catAlert = freshAlerts.find(
      (a) => a.categoryId === newTx.categoryId && !a.isResolved && (!a.isRead || a.timestamp >= Date.now() - 5000)
    );

    if (catAlert && settings.notificationsAllowed) {
      setTimeout(() => {
        if (settings.soundEnabled) sounds.playAlertWarning();
        if (settings.hapticsEnabled) sounds.vibrate([30, 40, 30]);
        setActiveNotification(catAlert);
      }, 500);
    } else {
      // Show swift success banner on Dynamic Island
      setActiveNotification({
        id: `confirm-${Date.now()}`,
        title: `${newTx.type === 'expense' ? 'Spent' : 'Received'} $${newTx.amount.toFixed(2)}`,
        message: newTx.title,
        severity: 'info',
        type: 'threshold',
        timestamp: Date.now(),
        isRead: true,
        isResolved: true
      });
    }
  };

  // Handler: Delete transaction
  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    const freshAlerts = evaluateBudgetAlerts(updated, categories, settings, alerts);
    setAlerts(freshAlerts);
  };

  // Handler: Update category budget
  const handleUpdateCategoryBudget = (categoryId: string, newBudget: number) => {
    const updatedCategories = categories.map((c) =>
      c.id === categoryId ? { ...c, monthlyBudget: newBudget } : c
    );
    setCategories(updatedCategories);
    const freshAlerts = evaluateBudgetAlerts(transactions, updatedCategories, settings, alerts);
    setAlerts(freshAlerts);
  };

  // Handler: Update overall monthly budget
  const handleUpdateOverallBudget = (newBudget: number) => {
    const updatedSettings = { ...settings, overallMonthlyBudget: newBudget };
    setSettings(updatedSettings);
    const freshAlerts = evaluateBudgetAlerts(transactions, categories, updatedSettings, alerts);
    setAlerts(freshAlerts);
  };

  // Handler: Update settings
  const handleUpdateSettings = (partial: Partial<BudgetSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    const freshAlerts = evaluateBudgetAlerts(transactions, categories, updated, alerts);
    setAlerts(freshAlerts);
  };

  // Handler: Mark alert as read
  const handleMarkRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
    );
  };

  // Handler: Resolve alert
  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isResolved: true, isRead: true } : a))
    );
  };

  // Handler: Clear all resolved alerts
  const handleClearAllResolved = () => {
    setAlerts((prev) => prev.filter((a) => !a.isResolved));
  };

  // Handler: Trigger test alert simulation
  const handleTriggerTestAlert = () => {
    const testAlert: BudgetAlert = {
      id: `test-alert-${Date.now()}`,
      categoryId: 'food',
      categoryName: 'Food & Dining',
      title: '🚨 Automated Alert: Dining at 94%',
      message: 'You have spent $564.00 of your $600.00 budget. Only $36.00 left for this month.',
      percentage: 94,
      currentSpend: 564,
      budgetLimit: 600,
      severity: 'critical',
      type: 'threshold',
      timestamp: Date.now(),
      isRead: false,
      isResolved: false
    };

    setAlerts((prev) => [testAlert, ...prev]);
    setActiveNotification(testAlert);
    if (settings.hapticsEnabled) sounds.vibrate([40, 50, 40]);
  };

  // Unread alerts count for tab badge
  const unreadAlertsCount = alerts.filter((a) => !a.isRead && !a.isResolved).length;

  // Spend for category currently selected in modal
  const currentCategorySpend = categoryForEdit
    ? transactions
        .filter((t) => t.type === 'expense' && t.categoryId === categoryForEdit.id)
        .reduce((acc, curr) => acc + curr.amount, 0)
    : 0;

  return (
    <IPhoneFrame
      activeNotification={activeNotification}
      onTapNotification={() => {
        sounds.playTap();
        setActiveTab('alerts');
        setActiveNotification(null);
      }}
      onClearNotification={() => setActiveNotification(null)}
      soundEnabled={settings.soundEnabled}
      onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
    >
      {/* Screen View Router */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            categories={categories}
            settings={settings}
            alerts={alerts}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onNavigateTab={(tab) => {
              sounds.playTap();
              setActiveTab(tab);
            }}
            onSelectCategoryBudget={(cat) => setCategoryForEdit(cat)}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            transactions={transactions}
            categories={categories}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView
            categories={categories}
            transactions={transactions}
            settings={settings}
            onSelectCategoryForEdit={(cat) => setCategoryForEdit(cat)}
            onUpdateOverallBudget={handleUpdateOverallBudget}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            settings={settings}
            categories={categories}
            onMarkRead={handleMarkRead}
            onResolveAlert={handleResolveAlert}
            onClearAllResolved={handleClearAllResolved}
            onUpdateSettings={handleUpdateSettings}
            onTriggerTestAlert={handleTriggerTestAlert}
            onSelectCategoryBudget={(cat) => setCategoryForEdit(cat)}
          />
        )}

        {activeTab === 'code' && (
          <CodeHubView
            transactions={transactions}
            categories={categories}
            settings={settings}
          />
        )}
      </div>

      {/* Persistent iOS Bottom Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          sounds.playTap();
          setActiveTab(tab);
        }}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* Add Transaction Sheet Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddTransaction}
        categories={categories}
      />

      {/* Edit Category Budget Modal */}
      <EditCategoryBudgetModal
        category={categoryForEdit}
        currentSpend={currentCategorySpend}
        isOpen={categoryForEdit !== null}
        onClose={() => setCategoryForEdit(null)}
        onSave={handleUpdateCategoryBudget}
      />
    </IPhoneFrame>
  );
}
