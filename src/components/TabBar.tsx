import React from 'react';
import { PieChart, Receipt, Target, Bell, FileCode2 } from 'lucide-react';
import { TabType } from '../types';

interface TabBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unreadAlertsCount: number;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onSelectTab,
  unreadAlertsCount
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: <PieChart size={21} strokeWidth={activeTab === 'dashboard' ? 2.5 : 1.8} />
    },
    {
      id: 'expenses',
      label: 'Activity',
      icon: <Receipt size={21} strokeWidth={activeTab === 'expenses' ? 2.5 : 1.8} />
    },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: <Target size={21} strokeWidth={activeTab === 'budgets' ? 2.5 : 1.8} />
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: (
        <div className="relative">
          <Bell size={21} strokeWidth={activeTab === 'alerts' ? 2.5 : 1.8} />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#FF3B30] text-white text-[10px] font-bold rounded-full min-w-[17px] h-[17px] px-1 flex items-center justify-center ring-2 ring-[#F2F2F7] animate-pulse">
              {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'code',
      label: 'Code Hub',
      icon: <FileCode2 size={21} strokeWidth={activeTab === 'code' ? 2.5 : 1.8} />
    }
  ];

  return (
    <nav className="w-full bg-white/85 backdrop-blur-xl border-t border-neutral-200/80 px-2 py-1.5 flex items-center justify-around z-30 shrink-0 select-none shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-btn-${tab.id}`}
            onClick={() => onSelectTab(tab.id)}
            className={`flex-1 py-1 flex flex-col items-center justify-center transition-all duration-150 relative ${
              isActive ? 'text-[#007AFF] font-semibold scale-[1.03]' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <div className="flex items-center justify-center h-6">
              {tab.icon}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
